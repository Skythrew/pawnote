import type { Component, JSX } from "solid-js";

import type { PronoteApiAccountId } from "@/types/pronote";
import type { ApiInstance, ApiLoginInformations, ApiUserData } from "@/types/api";

import Modal from "@/components/Modal";
import { DialogDescription, DialogTitle } from "solid-headless";

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

  const [loading, setLoading] = createSignal(false);

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
      setLoading(true);

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

      batch(() => {
        setModalVisibility(false);
        setLoading(false);
      });

      if (app.current_user.slug) {
        await saveIntoSlug(app.current_user.slug, data);
        app.setCurrentState({ restoring_session: false });
        return;
      }

      // Save the data for first-time users, so they can define their slug.
      setSlugModalData(data);
    }
    catch (err) {
      setLoading(false);
      console.error(err);
      alert("Une erreur s'est produite lors de la connexion au compte.");
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

    setLoading(true);
    await saveIntoSlug(slug, data);

    batch(() => {
      setLoading(false);
      setSlugModalData(null);
      app.setCurrentState({ restoring_session: false });

      navigate("/");
    });
  };

  return (
    <>
      <Modal open={visibility()} onClose={() => setModalVisibility(false)}>
        <div class="bg-brand-white border-brand-primary rounded-md max-w-md border-2 shadow-xl my-8 text-left w-full p-6 inline-block overflow-hidden align-middle">
          <DialogTitle
            as="h3"
            class="font-medium text-center text-lg text-brand-dark leading-6"
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
            class="flex flex-col mt-6 w-full gap-3"
            onSubmit={processUserAuthentication}
          >
            <Show when={props.ent_url}>
              <label
                class="border rounded-full flex mx-auto mb-2 py-1 px-3 transition gap-1 inline items-center justify-center"
                classList={{
                  "bg-brand-light border-brand-primary text-brand-primary": credentials.use_ent,
                  "text-brand-dark border-brand-dark": !credentials.use_ent
                }}
              >
                {credentials.use_ent ? <IconMdiCheck /> : <IconMdiClose />} ENT
                <input
                  type="checkbox"
                  checked={credentials.use_ent}
                  onChange={event => setCredentials("use_ent", event.currentTarget.checked)}
                  hidden
                />
              </label>
            </Show>

            <Show when={!credentials.use_ent && !app.current_user.slug}>
              <label class="text-brand-dark">Espace à utiliser
                <select
                  class="bg-brand-white border border-brand-dark rounded-md outline-none text-brand-dark w-full py-1 px-2 appearance-none focus:(border-brand-primary bg-brand-light) "
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

            <label class="text-brand-dark">
              Nom d'utilisateur
              <input
                class="bg-brand-white border border-brand-dark rounded-md outline-none text-brand-dark w-full py-1 px-2 focus:(border-brand-primary bg-brand-light) "
                type="text"
                value={credentials.username}
                onChange={event => setCredentials("username", event.currentTarget.value)}
                autocomplete="username"
              />
            </label>
            <label class="text-brand-dark">
              Mot de passe
              <input
                class="bg-brand-white border border-brand-dark rounded-md outline-none text-brand-dark w-full py-1 px-2 focus:(border-brand-primary bg-brand-light) "
                type="password"
                value={credentials.password}
                onChange={event => setCredentials("password", event.currentTarget.value)}
                autocomplete="current-password"
              />
            </label>

            <label
              class="border rounded-full mx-auto my-2 py-1 px-3 transition inline"
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
              disabled={loading()}
              class="bg-brand-primary rounded-md mt-2 text-brand-light w-full p-2 disabled:opacity-40"
              type="submit"
            >
              {loading() ? "Connexion en cours..." : "Connexion !"}
            </button>
          </form>
        </div>
      </Modal>


      <Modal
        open={slugModalData() !== null}
        onClose={() => batch(() => {
          setSlugModalData(null);
          app.setCurrentState({ restoring_session: false });
        })}
      >
        <div class="bg-brand-white border-brand-primary rounded-md max-w-md border-2 shadow-xl my-8 text-left w-full p-6 inline-block overflow-hidden align-middle">
          <DialogTitle
            as="h3"
            class="font-medium text-center text-lg text-brand-dark leading-6"
          >
            Connexion établie !
          </DialogTitle>
          <DialogDescription
            as="p"
            class="text-sm text-brand-dark text-opacity-80"
          >
            Vous êtes connecté en tant que {slugModalData()?.endpoints["/user/data"].donnees.ressource.L} à l'instance {slugModalData()?.endpoints["/user/data"].donnees.ressource.Etablissement.V.L.trim()}.
          </DialogDescription>

          <p class="my-4 text-brand-dark">Entrez un nom d'utilisateur local. Celui-ci va être utilisé en interne pour stocker vos données.</p>

          <form onSubmit={processSlugSave}>
            <input
              type="text"
              class="bg-brand-white border border-brand-dark rounded-md outline-none text-brand-dark w-full py-1 px-2 focus:(border-brand-primary bg-brand-light) "
              value={credentials.slug}
              onInput={event => {
                const cleanedValue = event.currentTarget.value
                // Clean-up the value to make sure it's a slug.
                  .toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                return setCredentials("slug", cleanedValue);
              }}
            />
            <button
              type="submit"
              disabled={loading()}
              class="bg-brand-primary rounded-md mt-2 text-brand-light w-full p-2 disabled:opacity-40"
            >
              {loading() ? "Sauvegarde..." : "Sauvegarder la session"}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default {
  Component: SessionFromScratchModal,
  show: (value = true) => batch(() => {
    app.setCurrentState({ restoring_session: value });
    setModalVisibility(value);
  })
};
