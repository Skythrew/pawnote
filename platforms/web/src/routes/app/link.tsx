import type { Component, JSX } from "solid-js";
import type { ApiGeolocation, ApiInstance } from "@/types/api";

import { A } from "solid-start";

import {
  HeadlessDisclosureChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  DialogOverlay
} from "solid-headless";

import {
  callAPI,
  getGeolocationPosition,

  ApiError
} from "@/utils/client";

import SessionFromScratchModal from "@/components/modals/SessionFromScratch";

const LinkPronoteAccount: Component = () => {
  const [state, setState] = createStore<{
    loading_instance: boolean;

    pronote_url: string;
    instance_data: ApiInstance["response"] | null;
    geolocation_data: ApiGeolocation["response"] | null;
  }>({
    loading_instance: false,

    pronote_url: "",
    instance_data: null,
    geolocation_data: null
  });

  /**
   * Calls `/api/geolocation`.
   * Should be run in the `onMount` and on a refresh pull,
   * so users can directly see instances near them.
   */
  const handleGeolocation = async () => {
    try {
      const {
        coords: {
          latitude, longitude
        }
      } = await getGeolocationPosition();

      const data = await callAPI<ApiGeolocation>("/geolocation", () => ({ latitude, longitude }));

      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a été trouvée.");
        return;
      }

      setState("geolocation_data", data);
    }
    catch (err) {
      setState("geolocation_data", null);

      if (err instanceof ApiError) {
        console.error(err.message);
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
      }
    }
  };

  const handleInstance = async (url?: string) => {
    try {
      setState("loading_instance", true);

      const response = await callAPI<ApiInstance>("/instance", () => ({
        pronote_url: url ?? state.pronote_url
      }));

      batch(() =>  {
        setState({
          loading_instance: false,
          instance_data: response
        });

        SessionFromScratchModal.show();
      });
    }
    catch (err) {
      setState("loading_instance", false);

      if (err instanceof ApiError) {
        console.error(err.message);
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
      }
    }
  };

  onMount(() => handleGeolocation());

  // When the page is closed, we force remove the modal just in case.
  onCleanup(() => SessionFromScratchModal.show(false));

  return (
    <>
      <Title>Connexion - {APP_NAME}</Title>
      <header class="border-b-latteSubtext1 sticky top-0 z-10 mb-6 flex items-center justify-start gap-2 border-b-2 bg-latteBase px-2 py-4">
        <A class="flex items-center justify-center px-4 py-2 text-xl" href="/">
          <IconMdiArrowLeft />
        </A>

        <h1 class="text-lg font-semibold sm:text-2xl">
          choisir une instance.
        </h1>
      </header>

      <main class="flex flex-col items-center gap-6 px-4">

        <form class="max-w-lg w-full flex"
          onSubmit={(event) => {
            event.preventDefault();
            handleInstance();
          }}
        >
          <div class="relative w-full">
            <input type="url" id="_pronote_url" class="peer block w-full appearance-none border-2 border-r-0 border-gray-300 rounded-lg rounded-r-none bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-latteText focus:border-latteRosewater focus:outline-none focus:ring-0" placeholder=" "
              value={state.pronote_url}
              onChange={event => setState("pronote_url", event.currentTarget.value)}
            />
            <label for="_pronote_url" class="text-latteSubtext0 pointer-events-none absolute left-2 top-2 z-[1] origin-[0] scale-75 transform rounded-md bg-latteBase px-2 text-sm duration-150 peer-focus:top-2 peer-placeholder-shown:top-1/2 -translate-y-4 peer-focus:scale-75 peer-placeholder-shown:scale-100 peer-focus:bg-latteRosewater peer-focus:px-2 peer-focus:text-latteBase peer-focus:-translate-y-4 peer-placeholder-shown:-translate-y-1/2">
              URL Pronote
            </label>
          </div>

          <button
            type="submit"
            class="rounded-r-lg from-latteRosewater to-lattePink bg-gradient-to-r px-3 py-2 text-xl text-latteBase outline-none"
          >
            <IconMdiLoginVariant />
          </button>
        </form>

        <div class="max-w-[1280px] w-full flex items-center justify-between gap-4">
          <p class="px-2 font-semibold">proche de chez vous.</p>
          <hr class="flex-grow-1" />
          <button type="button" class="rounded-full bg-latteText p-2 text-latteBase"
            onClick={() => handleGeolocation()}
          >
            <IconMdiRefresh />
          </button>
        </div>

        <div class="max-w-[1280px] w-full flex flex-wrap justify-center gap-2 p-4 pb-8">
          <Show when={state.geolocation_data}>
            {instances => (
              <For each={instances()}>
                {instance => (
                  <button type="button" class="w-full flex flex-col border border-gray-300 rounded-lg px-4 py-2 text-left outline-none transition-colors duration-150 md:max-w-[364px] focus:(border-latteRosewater text-latteRosewater) hover:(border-latteRosewater text-latteRosewater)"
                    onClick={() => handleInstance(instance.url)}
                  >
                    <h3 class="w-full truncate text-sm font-bold md:text-lg">
                      {instance.name}
                    </h3>
                    <p class="opcity-80 w-full truncate text-sm">
                      Situé dans le {instance.postal_code} à {Math.floor(instance.distance / 1000)}km.
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

        {/* <div class="mb-12 text-center"> */}
        {/* <button
              class="text-brand-light dark:border-brand-primary border-brand-light dark:text-brand-primary border-b-2"
              onClick={() => setState("info_dialog_open", true)}
            >
              Comment faire ?
            </button> */}
        {/* </div> */}

        {/* <Portal>
            <Transition
              appear
              show={state.info_dialog_open}
            >
              <Dialog
                isOpen
                class="fixed inset-0 z-10 overflow-y-auto"
                onClose={() => setState("info_dialog_open", false)}
              >
                <div class="min-h-screen flex items-center justify-center px-4">
                  <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <DialogOverlay class="bg-brand-dark fixed inset-0 bg-opacity-50" />
                  </TransitionChild>

                  <span
                    class="inline-block h-screen align-middle"
                    aria-hidden="true"
                  >
                  &#8203;
                  </span>
                  <TransitionChild
                    class="transform"
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <DialogPanel class="bg-brand-white border-brand-primary dark:bg-brand-dark my-8 inline-block max-w-md w-full overflow-hidden border-2 rounded-md p-6 text-left align-middle shadow-xl">
                      <DialogTitle
                        as="h3"
                        class="text-brand-primary text-center text-lg font-semibold"
                      >
                      Comment se connecter?
                      </DialogTitle>
                      <div class="text-brand-dark dark:text-brand-white mt-2 flex flex-col gap-2">
                        <p class="font-medium">Pour effectuer la première étape de votre connexion, vous allez devoir choisir une instance Pronote.</p>
                        <p>Pour cela, vous devez coller <b>l'URL de l'instance Pronote</b> dans la boite de texte.</p>
                        <p>Autrement, vous pouvez cliquer sur le bouton de <b>Géolocalisation</b> pour trouver les instances Pronote proche de votre localisation et directement les utiliser.</p>
                      </div>

                      <div class="mt-4">
                        <button
                          class="bg-brand-primary text-brand-light w-full rounded-md px-2 py-1"
                          type="button"
                          onClick={() => setState("info_dialog_open", false)}
                        >
                        J'ai compris !
                        </button>
                      </div>
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </Dialog>
            </Transition>
          </Portal> */}



        {/* <form class="space-y-4" onSubmit={processInformations}>
          <div class="flex">
            <Show when={state.show_geolocation_data}>
              <Listbox defaultOpen value={state.pronote_url} onSelectChange={instanceSelectChange}>
                <div class="relative min-w-0 w-full">
                  <ListboxButton type="button" class="bg-brand-white text-brand-dark focus-visible:border-brand-primary focus-visible:ring-offset-brand-primary relative h-full w-full cursor-default rounded-lg rounded-r-none py-2 pl-4 pr-10 text-left sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <span class="block truncate text-sm">{checkMatchPronoteUrl()?.name || state.pronote_url}</span>
                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <IconMdiChevronRight
                        class="h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <HeadlessDisclosureChild>
                    {({ isOpen }) => (
                      <Transition
                        show={isOpen()}
                        enter="transition ease-in duration-100"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-out duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute mt-1 h-[35vh] list-none overflow-auto rounded-md bg-white p-0 py-1 text-base text-sm shadow-lg ring-1 ring-black ring-opacity-5 md:text-base focus:outline-none"
                        >
                          <For each={state.geolocation_data}>
                            {instance => (
                              <ListboxOption class="group focus:outline-none" value={instance.url}>
                                {({ isSelected }) => (
                                  <div
                                    classList={{
                                      "text-brand-white bg-brand-primary": isSelected(),
                                      "group-hover:(text-brand-primary bg-brand-light)": !isSelected()
                                    }}
                                    class="transitions relative cursor-default select-none py-2 pl-10 pr-4"
                                  >
                                    <span
                                      class="block"
                                      classList={{
                                        "font-medium text-brand-white": isSelected(),
                                        "font-normal text-brand-dark": !isSelected()
                                      }}
                                    >

                                    </span>
                                    <Show when={isSelected()}>
                                      <span
                                        class="text-brand-white absolute inset-y-0 left-0 flex items-center pl-3"
                                      >
                                        <IconMdiCheck class="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    </Show>
                                  </div>
                                )}
                              </ListboxOption>
                            )}
                          </For>
                        </ListboxOptions>
                      </Transition>
                    )}
                  </HeadlessDisclosureChild>
                </div>
              </Listbox>
              <button
                type="button"
                class="bg-brand-light text-brand-dark dark:bg-brand-primary dark:text-brand-light flex rounded-lg rounded-l-none p-2 px-4"
                onClick={() => setState("show_geolocation_data", false)}
              >
                <IconMdiPencil />
              </button>
            </Show>

            <Show when={!state.show_geolocation_data}>
              <input class="bg-brand-white text-brand-dark w-full rounded-lg rounded-r-none px-4 text-sm outline-none"
                type="url"
                placeholder="URL Pronote"
                value={state.pronote_url}
                onChange={event => setState("pronote_url", event.currentTarget.value)}
              />

              <button disabled={state.loading_geolocation} class="bg-brand-light text-brand-dark dark:bg-brand-primary dark:text-brand-light flex rounded-lg rounded-l-none px-4 py-2 disabled:opacity-60" type="button" onClick={handleGeolocation}>
                {state.loading_geolocation
                  ? <IconMdiDotsHorizontal />
                  : <IconMdiMapMarkerRadius />
                }
              </button>
            </Show>
          </div>

          <button disabled={!state.pronote_url || state.loading_instance} class="bg-brand-light dark:bg-brand-primary dark:text-brand-light w-full rounded-lg px-4 py-2 disabled:opacity-40" type="submit">
            {state.loading_instance ? "Connexion..." : "Etablir une connexion"}
          </button>
        </form> */}

        <Show when={state.instance_data}>
          {instance => <SessionFromScratchModal.Component
            available_accounts={instance().accounts}
            pronote_url={instance().pronote_url}
            ent_url={instance().ent_url}
          />}
        </Show>
      </main>
    </>
  );
};

export default LinkPronoteAccount;

