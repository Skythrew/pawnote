import { SessionExported } from "@/types/session";

import {
  ApiLoginInformations,
  ApiUserData,
  ApiUserHomeworks,
  ApiUserTimetable
} from "@/types/api";

/// This is the store used by the app when
/// browsing the data of a specific slug.

export type CurrentUserStore =
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
    }
  }
  | {
    slug: null;
    session: null;
    endpoints: null;
  }

const [current_user, setCurrentUser] = createStore<CurrentUserStore>({
  slug: null,
  session: null,
  endpoints: null
});

const cleanCurrentUser = () => setCurrentUser({
  slug: null,
  session: null,
  endpoints: null
});

const [modal, setModal] = createStore({
  /** When a session restore has failed. */
  needs_scratch_session: false
});

/// Message that we use to show in the UI.
export enum AppBannerMessage {
  Idle,
  RestoringSession,
  FetchingTimetable,
  FetchingHomeworks,
  NeedCredentials,
  UnknownError
}

const [banner_message, setBannerMessage] = createStore<{
  is_loader: boolean;
  is_error: boolean;
  message: AppBannerMessage
}>({
  is_loader: false,
  is_error: false,
  message: AppBannerMessage.Idle
});

const setBannerToIdle = () => setBannerMessage({
  is_loader: false,
  is_error: false,
  message: AppBannerMessage.Idle
});

export default {
  modal, setModal,
  current_user, setCurrentUser, cleanCurrentUser,
  banner_message, setBannerMessage, setBannerToIdle
};
