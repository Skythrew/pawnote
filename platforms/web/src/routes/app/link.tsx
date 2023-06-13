import type { Component } from "solid-js";
import type { ApiGeolocation, ApiInstance } from "@pawnote/api";

import { A } from "solid-start";

import { createModal } from "@/primitives/modal";
import { AuthenticateSessionModalContent } from "@/components/molecules/modals";

import { ApiError } from "@pawnote/client";
import { callAPIUsingFetch } from "@/utils/client/requests/fetcher";
import { getGeolocationPosition } from "@/utils/client/geolocation";

import Input from "@/components/atoms/Input";

const Page: Component = () => {
  const [state, setState] = createStore<{
    loading_instance: boolean
    loading_geolocation: boolean

    pronote_url: string
    instance_data: ApiInstance["response"] | null
    geolocation_data: ApiGeolocation["response"] | null
  }>({
    loading_instance: false,
    loading_geolocation: false,

    pronote_url: "",
    instance_data: null,
    geolocation_data: null
  });

  const [showInstanceModal] = createModal(() => (
    <AuthenticateSessionModalContent
      instance={state.instance_data}
      loading={state.loading_instance}
    />
  ));

  const handleGeolocation = async (): Promise<void> => {
    try {
      setState("loading_geolocation", true);

      const {
        coords: {
          latitude, longitude
        }
      } = await getGeolocationPosition();

      const data = await callAPIUsingFetch<ApiGeolocation>({
        handler_id: "geolocation",
        body: { latitude, longitude }
      });

      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a été trouvée.");
        return;
      }

      setState({
        loading_geolocation: false,
        geolocation_data: data
      });
    }
    catch (err) {
      setState({
        loading_geolocation: false,
        geolocation_data: null
      });

      if (err instanceof ApiError) {
        console.error(err.message);
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
      }
    }
  };

  const handleInstance = async (url?: string): Promise<void> => {
    try {
      setState("loading_instance", true);

      const response = await callAPIUsingFetch<ApiInstance>({
        handler_id: "instance",
        body: { pronote_url: url ?? state.pronote_url }
      });

      setState({
        loading_instance: false,
        instance_data: response
      });

      showInstanceModal();
    }
    catch (err) {
      setState({
        loading_instance: false,
        instance_data: null
      });

      if (err instanceof ApiError) {
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
      }
    }
  };

  // Run geolocation on page mount.
  void handleGeolocation();

  return (
    <>
      <Title>Connexion - {APP_NAME}</Title>
      <header class="sticky top-0 z-10 mb-6 flex items-center justify-start gap-2 border-b-2 border-b-latteSubtext1 bg-latteBase px-2 py-4">
        <A class="flex items-center justify-center px-4 py-2 text-xl" href="/app">
          <IconMdiArrowLeft />
        </A>

        <h1 class="text-lg font-semibold sm:text-2xl">
          choisir une instance.
        </h1>
      </header>

      <main class="flex flex-col items-center gap-6 px-4">
        <form class="group max-w-lg w-full flex"
          onSubmit={async (event) => {
            event.preventDefault();
            await handleInstance();
          }}
        >
          <Input.Text
            type="url"
            value={state.pronote_url}
            onInput={value => setState("pronote_url", value)}
            placeholder="URL Pronote"
            autocomplete="pronote-url"
            removeRightBorder
          />

          <button
            type="submit"
            disabled={state.pronote_url.trim().length === 0}
            class="border-2 border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-lg text-latteBase outline-none group-focus-within:border-latte-rosewater"
          >
            <div class="rounded-md bg-latte-rosewater p-1 transition-opacity"
              classList={{
                "opacity-0": state.pronote_url.trim().length === 0,
                "opacity-100": state.pronote_url.trim().length > 0
              }}
            >
              <IconMdiLoginVariant />
            </div>
          </button>
        </form>

        <div class="max-w-[1280px] w-full flex items-center justify-between gap-4">
          <p class="px-2 font-semibold">proche de chez vous.</p>
          <hr class="flex-grow-1" />
          <button type="button" class="rounded-full bg-latteText p-2 text-latteBase disabled:(animate-spin opacity-60)"
            disabled={state.loading_geolocation}
            onClick={async () => await handleGeolocation()}
          >
            <IconMdiRefresh />
          </button>
        </div>

        <div class="max-w-[1280px] w-full flex flex-wrap justify-center gap-2 p-4 pb-8">
          <Show when={state.geolocation_data}>
            {instances => (
              <For each={instances()}>
                {instance => (
                  <button type="button" class="w-full flex flex-col border border-gray-300 rounded-lg px-4 py-2 text-left outline-none transition-colors duration-150 md:max-w-[364px] focus:(border-latte-rosewater text-latte-rosewater) hover:(border-latte-rosewater text-latte-rosewater)"
                    onClick={async () => await handleInstance(instance.url)}
                  >
                    <h3 class="w-full truncate text-sm font-bold md:text-lg">
                      {instance.name}
                    </h3>
                    <p class="w-full truncate text-sm opacity-80">
                      Situé dans le {instance.postal_code} à {(instance.distance / 1000).toFixed(2)}km.
                    </p>
                    <p class="mt-1 w-full truncate text-xs font-light opacity-60 md:text-sm">
                      {instance.url}
                    </p>
                  </button>
                )}
              </For>
            )}
          </Show>
        </div>
      </main>
    </>
  );
};

export default Page;
