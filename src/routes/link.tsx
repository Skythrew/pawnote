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
    info_dialog_open: boolean;
    show_geolocation_data: boolean;

    loading_instance: boolean;
    loading_geolocation: boolean;

    pronote_url: string;
    instance_data: ApiInstance["response"] | null;
    geolocation_data: ApiGeolocation["response"] | null;
  }>({
    info_dialog_open: false,
    show_geolocation_data: false,

    loading_instance: false,
    loading_geolocation: false,

    pronote_url: "",
    instance_data: null,
    geolocation_data: null
  });

  /**
   * Takes the `pronote_url` value and checks
   * if a school in the `geolocation_data` have
   * that URL stored.
   */
  const checkMatchPronoteUrl = () => state.geolocation_data && state.geolocation_data.find (
    instance => instance.url === state.pronote_url
  );

  const handleGeolocation = async () => {
    if (state.geolocation_data) {
      setState("show_geolocation_data", true);
      return;
    }

    try {
      setState("loading_geolocation", true);

      const {
        coords: {
          latitude, longitude
        }
      } = await getGeolocationPosition();

      const data = await callAPI<ApiGeolocation>("/geolocation", () => ({ latitude, longitude }));

      setState("loading_geolocation", false);

      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a été trouvée.");
        return;
      }

      setState({
        geolocation_data: data,
        // Automatically select the first URL.
        pronote_url: data[0].url,

        show_geolocation_data: true
      });
    }
    catch (err) {
      setState("loading_geolocation", false);

      if (err instanceof ApiError) {
        console.error(err.message);
        alert("Une erreur est survenue. Vérifiez la console.");
      }
    }
  };

  const instanceSelectChange = (url?: string) => {
    if (!url) return;
    setState("pronote_url", url);
  };

  const processInformations: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (evt) => {
    evt.preventDefault();

    try {
      setState("loading_instance", true);

      const response = await callAPI<ApiInstance>("/instance", () => ({
        pronote_url: state.pronote_url
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
      console.error(err);
      alert("Une erreur est survenue pendant la connexion à l'instance choisie.");
    }
  };

  // When the page is closed, we force remove the modal just in case.
  onCleanup(() => SessionFromScratchModal.show(false));

  return (
    <div class="min-h-screen bg-brand-primary dark:bg-brand-dark">
      <header class="p-4 pb-8">
        <A class="flex w-max text-xl p-2 text-brand-light" href="/">
          <IconMdiArrowLeft />
        </A>
      </header>

      <main class="flex flex-col max-w-md mx-auto px-8">

        <div class="text-center mb-12">
          <h1 class="font-bold text-xl text-brand-white">
            Connexion à Pronote
          </h1>
          <button
            class="text-brand-light border-b-2 border-brand-light dark:text-brand-primary dark:border-brand-primary"
            onClick={() => setState("info_dialog_open", true)}
          >
            Comment faire ?
          </button>
        </div>

        <Portal>
          <Transition
            appear
            show={state.info_dialog_open}
          >
            <Dialog
              isOpen
              class="fixed inset-0 z-10 overflow-y-auto"
              onClose={() => setState("info_dialog_open", false)}
            >
              <div class="min-h-screen px-4 flex items-center justify-center">
                <TransitionChild
                  enter="ease-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <DialogOverlay class="fixed inset-0 bg-brand-dark bg-opacity-50" />
                </TransitionChild>

                {/* This element is to trick the browser into centering the modal contents. */}
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
                  <DialogPanel class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle border-2 border-brand-primary bg-brand-white dark:bg-brand-dark shadow-xl rounded-md">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-semibold text-brand-primary text-center"
                    >
                      Comment se connecter?
                    </DialogTitle>
                    <div class="mt-2 flex flex-col gap-2 text-brand-dark dark:text-brand-white">
                      <p class="font-medium">Pour effectuer la première étape de votre connexion, vous allez devoir choisir une instance Pronote.</p>
                      <p>Pour cela, vous devez coller <b>l'URL de l'instance Pronote</b> dans la boite de texte.</p>
                      <p>Autrement, vous pouvez cliquer sur le bouton de <b>Géolocalisation</b> pour trouver les instances Pronote proche de votre localisation et directement les utiliser.</p>
                    </div>

                    <div class="mt-4">
                      <button
                        class="w-full bg-brand-primary px-2 py-1 rounded-md text-brand-light"
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
        </Portal>

        <form class="space-y-4" onSubmit={processInformations}>
          <div class="flex">
            <Show when={state.show_geolocation_data}>
              <Listbox defaultOpen value={state.pronote_url} onSelectChange={instanceSelectChange}>
                <div class="relative w-full min-w-0">
                  <ListboxButton type="button" class="relative w-full h-full py-2 pl-4 pr-10 text-left bg-brand-white text-brand-dark rounded-lg rounded-r-none cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-brand-primary focus-visible:ring-offset-2 focus-visible:border-brand-primary sm:text-sm">
                    <span class="block truncate text-sm">{checkMatchPronoteUrl()?.name || state.pronote_url}</span>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <IconMdiChevronRight
                        class="w-5 h-5"
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
                          class="list-none p-0 absolute py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg h-[35vh] ring-1 ring-black ring-opacity-5 focus:outline-none text-sm md:text-base"
                        >
                          <For each={state.geolocation_data}>
                            {instance => (
                              <ListboxOption class="focus:outline-none group" value={instance.url}>
                                {({ isSelected }) => (
                                  <div
                                    classList={{
                                      "text-brand-white bg-brand-primary": isSelected(),
                                      "group-hover:(text-brand-primary bg-brand-light)": !isSelected()
                                    }}
                                    class="cursor-default select-none relative py-2 pl-10 pr-4 transitions"
                                  >
                                    <span
                                      class="block"
                                      classList={{
                                        "font-medium text-brand-white": isSelected(),
                                        "font-normal text-brand-dark": !isSelected()
                                      }}
                                    >
                                      {instance.name} ({Math.floor(instance.distance / 1000)}km)
                                    </span>
                                    <Show when={isSelected()}>
                                      <span
                                        class="text-brand-white absolute inset-y-0 left-0 flex items-center pl-3"
                                      >
                                        <IconMdiCheck class="w-5 h-5" aria-hidden="true" />
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
                class="bg-brand-light p-2 px-4 rounded-lg flex rounded-l-none text-brand-dark dark:(bg-brand-primary text-brand-light)"
                onClick={() => setState("show_geolocation_data", false)}
              >
                <IconMdiPencil />
              </button>
            </Show>

            <Show when={!state.show_geolocation_data}>
              <input class="w-full rounded-lg rounded-r-none outline-none px-4 text-sm bg-brand-white text-brand-dark"
                type="url"
                placeholder="URL Pronote"
                value={state.pronote_url}
                onChange={event => setState("pronote_url", event.currentTarget.value)}
              />

              <button disabled={state.loading_geolocation} class="bg-brand-light py-2 px-4 rounded-lg flex rounded-l-none text-brand-dark dark:(bg-brand-primary text-brand-light) disabled:opacity-60" type="button" onClick={handleGeolocation}>
                {state.loading_geolocation
                  ? <IconMdiDotsHorizontal />
                  : <IconMdiMapMarkerRadius />
                }
              </button>
            </Show>
          </div>

          <button disabled={!state.pronote_url || state.loading_instance} class="disabled:opacity-40 bg-brand-light px-4 py-2 rounded-lg w-full dark:(bg-brand-primary text-brand-light)" type="submit">
            {state.loading_instance ? "Connexion..." : "Etablir une connexion"}
          </button>
        </form>

        <Show when={state.instance_data} keyed>
          {instance => <SessionFromScratchModal.Component
            available_accounts={instance.received.donnees.espaces.V}
            pronote_url={instance.pronote_url}
            ent_url={instance.ent_url}
          />}
        </Show>
      </main>
    </div>
  );
};

export default LinkPronoteAccount;

