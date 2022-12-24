import type { HttpCallFunction } from "@pornote/api";
import { handlers } from "@pornote/api";

import { CapacitorHttp } from "@capacitor/core";
import { Geolocation } from '@capacitor/geolocation';

const fetcher: HttpCallFunction = async (url, options) => {
  let data = options.body;

  // Small workaround until this PR <https://github.com/ionic-team/capacitor/pull/6165> is merged.
  if (data instanceof URLSearchParams) {
    data = Object.fromEntries(data);
  }

  const response = await CapacitorHttp.request({
    url,
    method: options.method,
    headers: options.headers,
    data
  });

  return ({
    headers: response.headers as Record<string, string>,
    json: async <T>() => JSON.parse(await response.data) as T,
    text: () => response.data
  });
};

export const callGeolocationAPI = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  const api = await handlers.geolocation(fetcher, {
    latitude: coordinates.coords.latitude,
    longitude: coordinates.coords.longitude
  });

  return api;
}
