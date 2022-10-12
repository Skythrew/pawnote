import type { Component, JSX } from "solid-js";
import type { ApiGeolocation } from "@/types/api";

import {
  HeadlessDisclosureChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from "solid-headless";

import {
  ApiError,
  apiPostGeolocation,
  apiPostInstance
} from "@/utils/api";

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const LinkPronoteAccount: Component = () => {
  const [state, setState] = createStore<{
    geolocation_data: ApiGeolocation["response"] | null;

    pronote_url: string;
    school_informations_commun: string | null;
  }>({
    geolocation_data: null,

    pronote_url: "",
    school_informations_commun: null
  });

  /**
   * Takes the pronote_url value and checks
   * if a school in the geolocation_data have
   * that URL stored.
   */
  const checkMatchPronoteUrl = () => state.geolocation_data && state.geolocation_data.find(
    instance => instance.url === state.pronote_url
  );

  const handleGeolocation = async () => {
    try {
      setState("geolocation_data", null);

      // TODO: use real lat and long.
      const data = await apiPostGeolocation({ latitude: 45.83, longitude: 1.26 });
      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a ete trouvee.");
        return;
      }

      setState({
        geolocation_data: data,
        pronote_url: data[0].url
      });
    }
    catch (err) {
      if (err instanceof ApiError) {
        console.error(err.message);
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
      const response = await apiPostInstance({
        pronote_url: state.pronote_url
      });
      console.log(response);

    }
    catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <header>
        <h1>Connexion à Pronote</h1>
        <p>Selectionnez l'instance Pronote de votre établissement.</p>
      </header>

      <main>
        <form onSubmit={processInformations}>
          <div class="flex">
            <Show keyed
              when={state.geolocation_data !== null}
            >
              <Listbox defaultOpen value={state.pronote_url} onSelectChange={instanceSelectChange}>
                <div class="relative mt-1">
                  <ListboxButton type="button" class="relative w-full py-2 pl-3 pr-10 text-left bg-brand-white rounded-lg rounded-r-none cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-brand-primary focus-visible:ring-offset-2 focus-visible:border-brand-primary sm:text-sm">
                    <span class="block truncate">{checkMatchPronoteUrl()?.name || state.pronote_url}</span>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      {/* <SelectorIcon
                        class="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      /> */}
                      {">"}
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
                        <ListboxOptions class="list-none p-0 absolute w-max py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          <For each={state.geolocation_data}>
                            {instance => (
                              <ListboxOption class="focus:outline-none group" value={instance.url}>
                                {({ isSelected }) => (
                                  <div
                                    class={classNames(
                                      isSelected() ? "text-brand-white bg-brand-primary" :
                                        "group-hover:text-brand-primary group-hover:bg-brand-light",
                                      "cursor-default select-none relative py-2 pl-10 pr-4",
                                      "transitions"
                                    )}
                                  >
                                    <span
                                      class={classNames(
                                        isSelected() ? "font-medium" : "font-normal",
                                        "block",
                                      )}
                                    >
                                      {instance.name}
                                    </span>
                                    {isSelected() ? (
                                      <span
                                        class="text-brand-white absolute inset-y-0 left-0 flex items-center pl-3"
                                      >
                                        OK
                                        {/* <CheckIcon class="w-5 h-5" aria-hidden="true" /> */}
                                      </span>
                                    ) : null}
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
              <button class="bg-brand-light p-2 rounded-lg rounded-l-none" type="button" onClick={() => setState("geolocation_data", null)}>
                Edit
              </button>
            </Show>
            <Show keyed
              when={state.geolocation_data === null}
            >
              <input
                type="url"
                value={state.pronote_url}
                onChange={event => setState("pronote_url", event.currentTarget.value)}
              />
              <button class="bg-brand-light p-2 rounded-lg rounded-l-none" type="button" onClick={handleGeolocation}>
                <IconMdiMapMarkerRadius />
              </button>
            </Show>
          </div>

          <button type="submit">
            Valider le choix
          </button>
        </form>
      </main>
    </div>
  );
};

export default LinkPronoteAccount;
