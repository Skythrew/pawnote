import { type FlowComponent, type Context, createContext, createEffect, on, onCleanup, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

import { useNavigate } from "@solidjs/router";

import { ClientAppStateCode } from "@pawnote/i18n";
import { PronoteApiAccountId } from "@pawnote/api";

import type {
  SessionExported,
  ApiLoginInformations,
  ApiUserData,
  ApiUserHomeworks,
  ApiUserTimetable,
  ApiUserResources,
  ApiUserGrades
} from "@pawnote/api";

import * as endpoints from "@/stores/endpoints";
import * as sessions from "@/stores/sessions";

export interface CurrentUserStoreDefault {
  slug: null;
}

export interface CurrentUserStoreReady {
  slug: string;
  session: SessionExported;

  endpoints: {
    // Required data for other API calls.
    "/user/data": ApiUserData["response"]["received"];
    "/login/informations": ApiLoginInformations["response"]["received"];

    // Not available when not cached/fetched.
    [key: ApiUserTimetable["path"]]: ApiUserTimetable["response"]["received"] | undefined;
    [key: ApiUserHomeworks["path"]]: ApiUserHomeworks["response"]["received"] | undefined;
    [key: ApiUserResources["path"]]: ApiUserResources["response"]["received"] | undefined;
    [key: ApiUserGrades["path"]]: ApiUserGrades["response"]["received"] | undefined;
  }
}

export type CurrentUserStore = CurrentUserStoreDefault | CurrentUserStoreReady;

type UserContextValue = [
  CurrentUserStore,
  {
    mutate: SetStoreFunction<CurrentUserStoreReady>;
    clean: () => void;
  }
];

const UserContext = createContext<UserContextValue>();

export const UserProvider: FlowComponent<{
  /** Slug of the user to get. */
  slug: string;
}> = (props) => {
  const defaultUserStore: CurrentUserStoreDefault = { slug: null };

  const navigate = useNavigate();
  const [user, setUser] = createStore<CurrentUserStore>(defaultUserStore);

  const cleanUser = () => {
    setUser(defaultUserStore);
    console.info("[debug]: cleared store");
  };

  const context: UserContextValue = [
    user, {
      mutate: setUser as SetStoreFunction<CurrentUserStoreReady>,
      clean: cleanUser
    }
  ];

  /** Helper function to reset the state of the current user. */
  createEffect(on(() => props.slug, async (slug) => {
    onCleanup(() => cleanUser());

    const session = await sessions.select(slug);
    if (!session) {
      console.error("[debug] no session found");
      return navigate("/app/link");
    }
    console.info("[debug]: got session");

    if (session.instance.account_type_id !== PronoteApiAccountId.Eleve) {
      alert("Seul le compte élève est disponible actuellement.");
      return navigate("/app/");
    }

    const user_data = await endpoints.select<ApiUserData>(slug, "/user/data");
    if (!user_data) {
      console.error("[debug] no endpoint '/user/data' found");
      return navigate("/app/link");
    }
    console.info("[debug]: got '/user/data'");

    const login_informations = await endpoints.select<ApiLoginInformations>(slug, "/login/informations");
    if (!login_informations) {
      console.error("[debug] no endpoint '/login/informations' found");
      return navigate("/app/link");
    }
    console.info("[debug]: got '/login/informations'");

    setUser({
      slug,
      session,
      endpoints: {
        "/login/informations": login_informations.data,
        "/user/data": user_data.data
      }
    });

    console.info("[debug]: defined `app.current_user`");
  }));

  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext<UserContextValue>(UserContext as Context<UserContextValue>);

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

