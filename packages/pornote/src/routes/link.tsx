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
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
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

      if (err instanceof ApiError) {
        console.error(err.message);
        prompt("Une erreur est survenue. Vous pouvez copier le message d'erreur ci-dessous si vous souhaitez ouvrir un bug report.", err.message);
      }
    }
  };

  // When the page is closed, we force remove the modal just in case.
  onCleanup(() => SessionFromScratchModal.show(false));

  return (
    <>
      <Title>Connexion - {APP_NAME}</Title>
      <div class="bg-brand-primary min-h-screen dark:bg-brand-dark">
        <header class="p-4 pb-8">
          <A class="flex text-xl text-brand-light w-max p-2" href="/">
            <IconMdiArrowLeft />
          </A>
        </header>

        <main class="flex flex-col mx-auto max-w-md px-8">
          <div class="text-center mb-12">
            <h1 class="font-bold text-xl text-brand-white">
            Connexion à Pronote
            </h1>
            <button
              class="border-brand-light border-b-2 text-brand-light dark:border-brand-primary dark:text-brand-primary"
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
                class="inset-0 z-10 fixed overflow-y-auto"
                onClose={() => setState("info_dialog_open", false)}
              >
                <div class="flex min-h-screen px-4 items-center justify-center">
                  <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <DialogOverlay class="bg-brand-dark bg-opacity-50 inset-0 fixed" />
                  </TransitionChild>

                  {/* This element is to trick the browser into centering the modal contents. */}
                  <span
                    class="h-screen inline-block align-middle"
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
                    <DialogPanel class="bg-brand-white border-brand-primary rounded-md max-w-md border-2 shadow-xl my-8 text-left w-full p-6 inline-block overflow-hidden align-middle dark:bg-brand-dark">
                      <DialogTitle
                        as="h3"
                        class="font-semibold text-lg text-brand-primary text-center"
                      >
                      Comment se connecter?
                      </DialogTitle>
                      <div class="flex flex-col mt-2 text-brand-dark gap-2 dark:text-brand-white">
                        <p class="font-medium">Pour effectuer la première étape de votre connexion, vous allez devoir choisir une instance Pronote.</p>
                        <p>Pour cela, vous devez coller <b>l'URL de l'instance Pronote</b> dans la boite de texte.</p>
                        <p>Autrement, vous pouvez cliquer sur le bouton de <b>Géolocalisation</b> pour trouver les instances Pronote proche de votre localisation et directement les utiliser.</p>
                      </div>

                      <div class="mt-4">
                        <button
                          class="bg-brand-primary rounded-md text-brand-light w-full py-1 px-2"
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
                  <div class="w-full min-w-0 relative">
                    <ListboxButton type="button" class="bg-brand-white rounded-lg rounded-r-none cursor-default h-full text-left text-brand-dark w-full py-2 pr-10 pl-4 relative sm:text-sm focus:outline-none focus-visible:border-brand-primary focus-visible:ring-white focus-visible:ring-offset-brand-primary focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2">
                      <span class="text-sm block truncate">{checkMatchPronoteUrl()?.name || state.pronote_url}</span>
                      <span class="flex pr-2 inset-y-0 right-0 absolute items-center pointer-events-none">
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
                            class="bg-white rounded-md list-none h-[35vh] shadow-lg ring-black mt-1 text-base text-sm p-0 py-1 ring-1 ring-opacity-5 absolute overflow-auto md:text-base focus:outline-none"
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
                                      class="cursor-default py-2 pr-4 pl-10 select-none relative transitions"
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
                                          class="flex text-brand-white pl-3 inset-y-0 left-0 absolute items-center"
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
                  class="bg-brand-light rounded-lg rounded-l-none flex text-brand-dark p-2 px-4 dark:(bg-brand-primary text-brand-light)"
                  onClick={() => setState("show_geolocation_data", false)}
                >
                  <IconMdiPencil />
                </button>
              </Show>

              <Show when={!state.show_geolocation_data}>
                <input class="bg-brand-white rounded-lg rounded-r-none outline-none text-sm text-brand-dark w-full px-4"
                  type="url"
                  placeholder="URL Pronote"
                  value={state.pronote_url}
                  onChange={event => setState("pronote_url", event.currentTarget.value)}
                />

                <button disabled={state.loading_geolocation} class="bg-brand-light rounded-lg rounded-l-none flex text-brand-dark py-2 px-4 dark:(bg-brand-primary text-brand-light) disabled:opacity-60" type="button" onClick={handleGeolocation}>
                  {state.loading_geolocation
                    ? <IconMdiDotsHorizontal />
                    : <IconMdiMapMarkerRadius />
                  }
                </button>
              </Show>
            </div>

            <button disabled={!state.pronote_url || state.loading_instance} class="bg-brand-light rounded-lg w-full py-2 px-4 dark:(bg-brand-primary text-brand-light) disabled:opacity-40" type="submit">
              {state.loading_instance ? "Connexion..." : "Etablir une connexion"}
            </button>
          </form>

          <Show when={state.instance_data} keyed>
            {instance => <SessionFromScratchModal.Component
              available_accounts={instance.accounts}
              pronote_url={instance.pronote_url}
              ent_url={instance.ent_url}
            />}
          </Show>
        </main>
      </div>
    </>
  );
};

export default LinkPronoteAccount;

