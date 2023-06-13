import { type ApiResponse } from "@pawnote/api";
import { callAPI, type RequestLikeApi, type CallApiRequester, type CallAPIFetcher } from "@pawnote/client";

export const fetcher: CallAPIFetcher = async (request) => {
  const response = await fetch(`/api${request.path}`, {
    method: "POST",
    body: JSON.stringify(request.body)
  });

  const data = await response.json() as ApiResponse<unknown>;
  return data;
};

export const callAPIUsingFetch = async <T extends RequestLikeApi>(request: CallApiRequester<T>): ReturnType<Awaited<typeof callAPI<T>>> => {
  return await callAPI(fetcher, request);
};
