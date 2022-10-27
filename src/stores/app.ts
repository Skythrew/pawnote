import { SessionExported } from "@/types/session";
import { ApiLoginInformations, ApiUserData, ApiUserTimetable } from "@/types/api";

/// This is the store used by the app when
/// browsing the data of a specific slug.

type CurrentUserStore =
  | {
    slug: string;
    session: SessionExported;

    endpoints: {
      // Required data for other API calls.
      "/user/data": ApiUserData["response"]["received"];
      "/login/informations": ApiLoginInformations["response"]["received"];

      // Not available when not cached/fetched.
      "/user/timetable"?: ApiUserTimetable["response"]["received"];
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

/// Message that we use to show in the UI.
export enum AppBannerMessage {
  Idle,
  RestoringSession,
  FetchingTimetable
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
  current_user, setCurrentUser, cleanCurrentUser,
  banner_message, setBannerMessage, setBannerToIdle
};
