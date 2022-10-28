import type { Component, JSX } from "solid-js";

import type { PronoteApiAccountId } from "@/types/pronote";
import type { ApiInstance, ApiLoginInformations, ApiUserData } from "@/types/api";

import { connectToPronote } from "@/utils/client";
import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import app from "@/stores/app";
import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";

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
  }>({
    use_ent: false,
    username: "",
    password: "",
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

      app.setModal("needs_scratch_session", false);

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
    <>
      <Show when={app.modal.needs_scratch_session}>
        <div>
          <h2>
            {app.current_user.slug
              ? "Connexion perdue!"
              : "Première connexion"
            }
          </h2>
          <p>
            {app.current_user.slug
              ? `
              Comme Pornote ne sauvegarde pas vos identifiants,
              vous devez les renseigner de nouveau lors d'une perte de connexion à une session.
            `
              : `
              Créez une nouvelle session sur cette instance en entrant vos identifiants.
              Souvenez vous que Pornote ne les retiendra pas et qu'il vous les redemandera plus tard
              si une perte de connexion a lieue.
            `
            }
          </p>

          <form onSubmit={processUserAuthentication}>
            <Show when={props.ent_url}>
              <input
                type="checkbox"
                checked={credentials.use_ent}
                onChange={event => setCredentials("use_ent", event.currentTarget.checked)}
              />
            </Show>

            <Show when={!credentials.use_ent && !app.current_user.slug}>
              <select onChange={event => setCredentials("account_type", parseInt(event.currentTarget.value))}>
                <For each={props.available_accounts}>
                  {espace => (
                    <option value={espace.G}>{espace.L}</option>
                  )}
                </For>
              </select>
            </Show>

            <input
              type="text"
              value={credentials.username}
              onChange={event => setCredentials("username", event.currentTarget.value)}
            />
            <input
              type="password"
              value={credentials.password}
              onChange={event => setCredentials("password", event.currentTarget.value)}
            />

            <button type="submit">Valider!</button>
          </form>
        </div>
      </Show>

      <Show keyed when={slugModalData()}>
        {data => (
          <div>
            <h4>Connexion établie!</h4>
            <p>Choissisez un nom d'utilisateur local pour facilement retrouver le compte (depuis l'URL par exemple)</p>
            <span>Vous êtes connecté en tant que {data.endpoints["/user/data"].donnees.ressource.L} à l'instance {data.endpoints["/user/data"].donnees.ressource.Etablissement.V.L}</span>

            <form onSubmit={processSlugSave}>
              <input
                type="text"
                value={credentials.slug}
                onInput={event => {
                  const cleanedValue = event.currentTarget.value
                  // Clean-up the value to make sure it's a slug.
                    .toLowerCase().replace(/[^a-z0-9-]+/g, "-");
                  return setCredentials("slug", cleanedValue);
                }}
              />
              <button type="submit">Sauvegarder la session!</button>
            </form>
          </div>
        )}
      </Show>
    </>
  );
};

export default SessionFromScratchModal;
