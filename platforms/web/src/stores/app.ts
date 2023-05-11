import { SessionExported } from "@/types/session";

import type {
  ApiLoginInformations,
  ApiUserData,
  ApiUserHomeworks,
  ApiUserTimetable,
  ApiUserRessources,
  ApiUserGrades
} from "@/types/api";

import { ClientAppStateCode } from "@pawnote/i18n";

const [current_user, setCurrentUser] = createStore<
  // User is into session.
  | {
    slug: string;
    session: SessionExported;

    endpoints: {
      // Required data for other API calls.
      "/user/data": ApiUserData["response"]["received"];
      "/login/informations": ApiLoginInformations["response"]["received"];

      // Not available when not cached/fetched.
      [key: ApiUserTimetable["path"]]: ApiUserTimetable["response"]["received"] | undefined;
      [key: ApiUserHomeworks["path"]]: ApiUserHomeworks["response"]["received"] | undefined;
      [key: ApiUserRessources["path"]]: ApiUserRessources["response"]["received"] | undefined;
      [key: ApiUserGrades["path"]]: ApiUserGrades["response"]["received"] | undefined;
    }
  }
  // User not into session.
  | {
    slug: null;
    session: null;
    endpoints: null;
  }
>({
  slug: null,
  session: null,
  endpoints: null
});

/** Helper function to reset the state of the current user. */
const cleanCurrentUser = () => setCurrentUser({
  slug: null,
  session: null,
  endpoints: null
});

const [current_state, setCurrentState] = createStore<{
  /** `true` when SessionFromScratch modal is shown/being used. */
  restoring_session: boolean;
  fetching: boolean;
  code: ClientAppStateCode
}>({
  restoring_session: false,
  fetching: false,
  code: ClientAppStateCode.Idle
});

const fetch_queue: {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => unknown;
  action: () => unknown;
}[] = [];

const enqueue_fetch = (code: ClientAppStateCode, action: () => unknown) => {
  console.info("[enqueue_fetch]", code, fetch_queue);
  return new Promise((resolve, reject) => {
    fetch_queue.push({
      resolve, reject, action: async () => {
        setCurrentState({ fetching: true, code });
        return action();
      }
    });

    dequeue_fetch();
  });
};

const dequeue_fetch = async () => {
  if (current_state.fetching) return false;

  // Clear queue when session is restoring.
  if (current_state.restoring_session) {
    console.info("[dequeue_fetch] queue cleared (restoring session)", fetch_queue);
    fetch_queue.splice(0, fetch_queue.length);
    return false;
  }

  const item = fetch_queue.shift();
  if (!item) return false;

  try {
    console.info("run fetch in queue", item);
    const payload = await item.action();
    setStateToIdle();

    item.resolve(payload);
  }
  catch (error) {
    console.info("fetch error in queue", error);
    setStateToIdle();
    item.reject(error);
  }
  finally {
    dequeue_fetch();
  }

  return true;
};

/** Helper function to reset the state of the app. */
const setStateToIdle = () => setCurrentState({
  fetching: false,
  restoring_session: false,
  code: ClientAppStateCode.Idle
});

export default {
  current_user, setCurrentUser, cleanCurrentUser,
  current_state, setCurrentState, setStateToIdle,
  fetch_queue, enqueue_fetch
};

