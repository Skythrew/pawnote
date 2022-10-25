import type { Component, JSX } from "solid-js";
import { ApiGeolocation, ApiInstance, ApiLoginAuthenticate, ApiLoginIdentify, ApiLoginInformations } from "@/types/api";

import {
  HeadlessDisclosureChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from "solid-headless";

import {
  classNames,
  getGeolocationPosition,
  callAPI,
  ApiError
} from "@/utils/client";

import forge from "node-forge";
import { aes } from "@/utils/globals";

import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

const LinkPronoteAccount: Component = () => {
  const [state, setState] = createStore<{
    geolocation_data: ApiGeolocation["response"] | null;

    pronote_url: string;
    school_informations_commun: ApiInstance["response"] | null;

    login: {
      account_type: number | null;
      username: string;
      password: string;
      use_ent: boolean;
    }
  }>({
    geolocation_data: null,

    pronote_url: "",
    school_informations_commun: null,

    login: {
      account_type: null,
      username: "",
      password: "",
      use_ent: false
    }
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
    setState("geolocation_data", null);

    try {
      const {
        coords: {
          latitude, longitude
        }
      } = await getGeolocationPosition();

      const data = await callAPI<ApiGeolocation>("/geolocation", { latitude, longitude });
      if (data.length <= 0) {
        alert("Aucune instance Pronote proche de votre location n'a été trouvée.");
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
      const response = await callAPI<ApiInstance>("/instance", {
        pronote_url: state.pronote_url
      });

      batch(() =>  {
        setState("school_informations_commun", response);
        setState("login", "account_type", response.received.donnees.espaces.V[0].G);
      });
    }
    catch (err) {
      console.error(err);
    }
  };

  const processUserAuthentication: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (evt) => {
    evt.preventDefault();

    if (!state.school_informations_commun) return;

    const account_type = state.login.account_type;
    if (account_type === null || !objectHasProperty(PRONOTE_ACCOUNT_TYPES, account_type)) return;

    try {
      const informations_response = await callAPI<ApiLoginInformations>("/login/informations", {
        account_type,
        pronote_url: state.school_informations_commun.pronote_url
      });

      let username = state.login.username;
      let password = state.login.password;

      // Updating the login credentials to use depending of the received response.
      if (informations_response.setup) {
        username = informations_response.setup.username;
        password = informations_response.setup.password;
      }

      const identify_response = await callAPI<ApiLoginIdentify>("/login/identify", {
        pronote_username: username,
        session: informations_response.session
      });

      if (identify_response.received.donnees.modeCompLog) {
        username = username.toLowerCase();
      }

      if (identify_response.received.donnees.modeCompMdp) {
        password = password.toLowerCase();
      }

      // Short-hand for later usage.
      const aesIvBuffer = forge.util.createBuffer(identify_response.session.encryption.aes.iv as string);

      /// Resolving the challenge - Part 1.
      /// Decoding the challenge from hex to bytes and decrypting it with AES.

      // Generate the hash for the AES key.
      const challengeAesKeyHash = forge.md.sha256.create()
        .update(informations_response.setup
          ? "" // When using generated credentials, we don't have to use `alea`.
          : identify_response.received.donnees.alea
        )
        .update(forge.util.encodeUtf8(password))
        .digest();

      const challengeAesKey = (informations_response.setup
        ? "" // When using generated credentials, we don't have to lowercase.
        : username.toLowerCase()
      ) +  challengeAesKeyHash.toHex().toUpperCase();

      const challengeAesKeyBuffer = forge.util.createBuffer(
        forge.util.encodeUtf8(challengeAesKey)
      );


      const challengeDecryptedBytes = aes.decrypt(identify_response.received.donnees.challenge, {
        iv: aesIvBuffer,
        key: challengeAesKeyBuffer
      });

      const challengeDecrypted = forge.util.decodeUtf8(challengeDecryptedBytes);

      /// Resolving the challenge - Part 2.
      /// Modifying the plain text by removing every second character.

      const challengeDecryptedUnscrambled = new Array(challengeDecrypted.length);
      for (let i = 0; i < challengeDecrypted.length; i += 1) {
        if (i % 2 === 0) {
          challengeDecryptedUnscrambled.push(challengeDecrypted.charAt(i));
        }
      }

      /// Resolving the challenge - Part 3.
      /// Encrypting the modified text back with AES and encoding it as hex.

      const challengeEncrypted = aes.encrypt(challengeDecryptedUnscrambled.join(""), {
        iv: aesIvBuffer,
        key: challengeAesKeyBuffer
      });

      // Send the resolved challenge.
      const authenticate_response = await callAPI<ApiLoginAuthenticate>("/login/authenticate", {
        solved_challenge: challengeEncrypted,
        session: identify_response.session
      });


    }
    catch (err) {
      console.error(err);
      alert("check logs.");
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
            <Show when={state.geolocation_data !== null}>
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
              <button class="bg-brand-light p-2 px-8 rounded-lg rounded-l-none" type="button" onClick={() => setState("geolocation_data", null)}>
                Edit
              </button>
            </Show>

            <Show when={!state.geolocation_data}>
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

        <Show when={state.school_informations_commun} keyed>
          {instance => (
            <form onSubmit={processUserAuthentication}>
              <Show when={instance.ent_url}>
                <input type="checkbox" checked={state.login.use_ent} />
              </Show>

              <select onChange={event => setState("login", "account_type", parseInt(event.currentTarget.value))}>
                <For each={instance.received.donnees.espaces.V}>
                  {espace => (
                    <option value={espace.G}>{espace.L}</option>
                  )}
                </For>
              </select>

              <input
                type="text"
                value={state.login.username}
                onChange={event => setState("login", "username", event.currentTarget.value)}
              />
              <input
                type="password"
                value={state.login.password}
                onChange={event => setState("login", "password", event.currentTarget.value)}
              />

              <button type="submit">Tester la connexion</button>
            </form>
          )}
        </Show>
      </main>
    </div>
  );
};

export default LinkPronoteAccount;
