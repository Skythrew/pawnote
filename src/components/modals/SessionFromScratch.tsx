import type { Component, JSX } from "solid-js";

import type { PronoteApiAccountId } from "@/types/pronote";
import type { ApiInstance, ApiLoginInformations, ApiUserData } from "@/types/api";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  DialogOverlay,
  DialogDescription
} from "solid-headless";

import { connectToPronote } from "@/utils/client";
import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import app from "@/stores/app";
import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";
import credentials_store from "@/stores/credentials";

const [visibility, setModalVisibility] = createSignal(false);

const SessionFromScratchModal: Component<{
  pronote_url: string,
  ent_url?: string,

  /**
   * Only used for first connection, when user needs to select their account type.
   * That's only needed for not-ENT users though.
   */
  available_accounts?: ApiInstance["response"]["received"]["donnees"]["espaces"]["V"];
}> = (props) => {
  const first_account_type = () => props?.available_accounts?.[0].G as number;
  const navigate = useNavigate();

  const [slugModalData, setSlugModalData] = createSignal<
    Awaited<ReturnType<typeof connectToPronote>> | null
  >(null);

  const [credentials, setCredentials] = createStore<{
    account_type: PronoteApiAccountId;
    use_ent: boolean;

    /** Used only for first-time connections. */
    slug: string;

    username: string;
    password: string;
    save: boolean;
  }>({
    use_ent: false,
    username: "",
    password: "",
    save: false,

    slug: "",

    account_type: app.current_user.slug
      // We grab the account type from the old session when existing.
      ? app.current_user.session.instance.account_type_id
      // For first-time users, we'll select them
      // the first account type provided by default.
      : first_account_type()
  });

  const processUserAuthentication: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();

    if (!credentials.username || !credentials.password) return;

    const account_type = credentials.account_type;
    if (account_type === null || !objectHasProperty(PRONOTE_ACCOUNT_TYPES, account_type)) return;

    try {
      const data = await connectToPronote({
        pronote_url: props.pronote_url,
        use_credentials: true,

        username: credentials.username,
        password: credentials.password,

        ...(credentials.use_ent
          ? {
            use_ent: true,
            ent_url: props.ent_url as string
          }
          : {
            use_ent: false,
            account_type
          }
        )
      });

      setModalVisibility(false);

      if (app.current_user.slug) {
        await saveIntoSlug(app.current_user.slug, data);
        return;
      }

      // Save the data for first-time users, so they can define their slug.
      setSlugModalData(data);
    }
    catch (err) {
      console.error(err);
    }
  };

  const saveIntoSlug = async (slug: string, data: Awaited<ReturnType<typeof connectToPronote>>) => {
    if (!data) return;

    await sessions.upsert(
      slug, data.session
    );

    await endpoints.upsert<ApiUserData>(
      slug, "/user/data", data.endpoints["/user/data"]
    );

    await endpoints.upsert<ApiLoginInformations>(
      slug, "/login/informations", data.endpoints["/login/informations"]
    );

    // Make sure to delete the old credentials when
    // user don't want to save them.
    if (!credentials.save) await credentials_store.remove(slug);
    else {
      await credentials_store.upsert(slug, {
        username: credentials.username,
        password: credentials.password
      });
    }
  };

  const processSlugSave: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();

    const data = slugModalData();
    const slug = credentials.slug;

    if (!slug) return;
    await saveIntoSlug(slug, data);

    setSlugModalData(null);
    navigate("/");
  };

  return (
    <Portal>
      <Transition
        appear
        show={visibility()}
      >
        <Dialog
          isOpen
          class="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setModalVisibility(false)}
        >
          <div class="min-h-screen px-4 flex items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
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

              <DialogPanel class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle border-2 border-brand-primary bg-brand-white shadow-xl rounded-md">
                <DialogTitle
                  as="h3"
                  class="text-center text-lg font-medium leading-6 text-brand-dark"
                >
                  {app.current_user.slug
                    ? "Connexion perdue!"
                    : "Première connexion"
                  }
                </DialogTitle>
                <DialogDescription
                  as="p"
                  class="text-sm text-brand-dark text-opacity-80"
                >
                  {app.current_user.slug
                    ? `
                      Renseignez de nouveau vos identifiants pour créer
                      une nouvelle session en fonction de l'ancienne.
                      Vos données ne seront pas perdues.
                    `
                    : `
                      Créez une nouvelle session sur cette instance en entrant vos identifiants.
                    `
                  }

                </DialogDescription>

                <form
                  class="flex flex-col gap-3 mt-6 w-full"
                  onSubmit={processUserAuthentication}
                >
                  <Show when={props.ent_url}>
                    <label
                      class="inline mx-auto rounded-full px-3 py-1 border flex items-center justify-center gap-1 transition mb-2"
                      classList={{
                        "bg-brand-light border-brand-primary text-brand-primary": credentials.use_ent,
                        "text-brand-dark border-brand-dark": !credentials.use_ent
                      }}
                    >
                      <Show when={credentials.use_ent} fallback={<IconMdiClose />}><IconMdiCheck /></Show> ENT
                      <input
                        type="checkbox"
                        checked={credentials.use_ent}
                        onChange={event => setCredentials("use_ent", event.currentTarget.checked)}
                        hidden
                      />
                    </label>
                  </Show>

                  <Show when={!credentials.use_ent && !app.current_user.slug}>
                    <label>Espace à utiliser
                      <select
                        class="px-2 py-1 rounded-md border border-brand-dark w-full bg-brand-dark bg-opacity-0 hover:bg-opacity-10 outline-brand-primary focus:bg-brand-light focus:bg-opacity-100"
                        onChange={event => setCredentials("account_type", parseInt(event.currentTarget.value))}
                      >
                        <For each={props.available_accounts}>
                          {espace => (
                            <option value={espace.G}>{espace.L}</option>
                          )}
                        </For>
                      </select>
                    </label>
                  </Show>

                  <label>
                    Nom d'utilisateur
                    <input
                      class="px-2 py-1 rounded-md border border-brand-dark w-full bg-brand-dark bg-opacity-0 hover:bg-opacity-10 outline-brand-primary focus:bg-brand-light focus:bg-opacity-100"
                      type="text"
                      value={credentials.username}
                      onChange={event => setCredentials("username", event.currentTarget.value)}
                      autocomplete="username"
                    />
                  </label>
                  <label>
                    Mot de passe
                    <input
                      class="px-2 py-1 rounded-md border border-brand-dark w-full bg-brand-dark bg-opacity-0 hover:bg-opacity-10 outline-brand-primary focus:bg-brand-light focus:bg-opacity-100"
                      type="password"
                      value={credentials.password}
                      onChange={event => setCredentials("password", event.currentTarget.value)}
                      autocomplete="current-password"
                    />
                  </label>

                  <label
                    class="rounded-full border inline mx-auto px-3 py-1 my-2 transition"
                    classList={{
                      "bg-brand-light text-brand-primary border-brand-primary": credentials.save,
                      "border-brand-dark text-brand-dark":!credentials.save
                    }}
                  >
                    Se souvenir de mes identifiants
                    <input
                      type="checkbox"
                      checked={credentials.save}
                      onChange={(event) => setCredentials("save", event.currentTarget.checked)}
                      hidden
                    />
                  </label>

                  <button
                    class="w-full bg-brand-primary rounded-md text-brand-light p-2 mt-2"
                    type="submit"
                  >
                    Connexion !
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <Transition
        appear
        show={slugModalData() !== null}
      >
        <Dialog
          isOpen
          class="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setSlugModalData(null)}
        >
          <div class="min-h-screen px-4 flex items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
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

              <DialogPanel class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle border-2 border-brand-primary bg-brand-white shadow-xl rounded-md">
                <DialogTitle
                  as="h3"
                  class="text-center text-lg font-medium leading-6 text-brand-dark"
                >
                  Connexion établie !
                </DialogTitle>
                <DialogDescription
                  as="p"
                  class="text-sm text-brand-dark text-opacity-80"
                >
                  Vous êtes connecté en tant que {slugModalData()?.endpoints["/user/data"].donnees.ressource.L} à l'instance {slugModalData()?.endpoints["/user/data"].donnees.ressource.Etablissement.V.L.trim()}.
                </DialogDescription>

                <p class="my-4">Entrez un nom d'utilisateur local. Celui-ci va être utilisé en interne pour stocker vos données.</p>

                <form onSubmit={processSlugSave}>
                  <input
                    type="text"
                    class="px-2 py-1 rounded-md border border-brand-dark w-full bg-brand-dark bg-opacity-0 hover:bg-opacity-10 outline-brand-primary focus:bg-brand-light focus:bg-opacity-100"
                    value={credentials.slug}
                    onInput={event => {
                      const cleanedValue = event.currentTarget.value
                      // Clean-up the value to make sure it's a slug.
                        .toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                      return setCredentials("slug", cleanedValue);
                    }}
                  />
                  <button type="submit"
                    class="w-full bg-brand-primary rounded-md text-brand-light p-2 mt-2"
                  >
                    Sauvegarder la session
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </Portal>
  );
};

export default {
  show: () => setModalVisibility(true),
  Component: SessionFromScratchModal
};
