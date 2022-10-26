import { SessionExported } from "@/types/session";
import { ApiUserData } from "@/types/api";

/// This is the store used by the app when
/// browsing the data of a specific slug.

const [current_user, setCurrentUser] = createStore<
  | { // When data hasn't been fetched yet.
    loaded: false
  }
  | { // When data is ready to be shown.
    loaded: true,
    session: SessionExported,
    endpoints: {
      "/user/data": ApiUserData["response"]["received"]
    }
  }
>({ loaded: false });

const cleanCurrentUser = () => {
  const keys = Object.keys(current_user);
  const obj: { [key: string]: undefined | boolean } = {};

  for (const key of keys) {
    obj[key] = undefined;
  }

  obj.loaded = false;
  setCurrentUser({ ...obj });
};

/// Message that we use to show in the UI.
export enum AppBannerMessage {
  Idle,
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
