import type { Component, JSX } from "solid-js";

import type { PronoteApiAccountId } from "@/types/pronote";
import type { ApiInstance, ApiLoginInformations, ApiUserData } from "@/types/api";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";

import { connectToPronote } from "@/utils/client";
import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import app from "@/stores/app";
import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";
import credentials_store from "@/stores/credentials";

import { createModal } from "@/primitives/modal";
import { SaveSessionIntoSlugModalContent } from "./SaveSessionIntoSlug";

interface Props {
  loading: boolean;
  instance: ApiInstance["response"] | null;
}

export const AuthenticateSessionModalContent: Component<Props> = (props) => {
  const first_account_type = () => props.instance ? props.instance.accounts?.[0].id as number : null;

  const [showSlugModal] = createModal(() => (
    <SaveSessionIntoSlugModalContent
      slugModalData={slugModalData()}
      onSubmit={(slug) => saveIntoSlug(slug, slugModalData())}
    />
  ));

  const [slugModalData, setSlugModalData] = createSignal<
    Awaited<ReturnType<typeof connectToPronote>> | null
  >(null);

  const [loading, setLoading] = createSignal(false);

  const [credentials, setCredentials] = createStore<{
    account_type: PronoteApiAccountId | null;
    use_ent: boolean;

    username: string;
    password: string;
    save: boolean;
  }>({
    use_ent: false,
    username: "",
    password: "",
    save: false,

    account_type: app.current_user.slug
      // We grab the account type from the old session when existing.
      ? app.current_user.session.instance.account_type_id
      // For first-time users, we'll select them
      // the first account type provided by default.
      : first_account_type()
  });

  const processUserAuthentication: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();

    if (!credentials.username || !credentials.password || !props.instance) return;

    const account_type = credentials.account_type;
    if (account_type === null || !objectHasProperty(PRONOTE_ACCOUNT_TYPES, account_type)) return;

    try {
      setLoading(true);

      const data = await connectToPronote({
        pronote_url: props.instance.pronote_url,
        use_credentials: true,

        username: credentials.username,
        password: credentials.password,

        ...(credentials.use_ent
          ? {
            use_ent: true,
            ent_url: props.instance.ent_url as string
          }
          : {
            use_ent: false,
            account_type
          }
        )
      });

      setLoading(false);

      if (app.current_user.slug) {
        await saveIntoSlug(app.current_user.slug, data);
        app.setCurrentState({ restoring_session: false });
        return;
      }

      // Save the data for first-time users, so they can define their slug.
      setSlugModalData(data);
      showSlugModal();
    }
    catch (err) {
      setLoading(false);
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

  return (
    <Show when={props.instance}>
      {instance => (
        <>
          <Modal.Title
            as="h3"
            class="p-2 pb-2 text-center text-lg font-bold leading-6 text-latteText"
          >
            {app.current_user.slug
              ? "Connexion perdue!"
              : instance().school_name
            }
          </Modal.Title>
          <Modal.Description class="text-latteSubtext0 px-6 text-center text-sm">
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
          </Modal.Description>

          <form
            class="mt-6 w-full flex flex-col gap-3"
            onSubmit={processUserAuthentication}
          >
            <Show when={instance().ent_url}>
              <label
                class="mx-auto mb-2 inline flex items-center justify-center gap-1 border rounded-full px-3 py-1 transition"
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
              <Input.Select<PronoteApiAccountId>
                options={instance().accounts.map(instance => ({ label: instance.name, value: instance.id }))}
                placeholder="Espace à utiliser"
                triggerAriaLabel="Espace Pronote"
                onChange={({ value }) => setCredentials("account_type", value)}
              />
            </Show>

            <Input.Text
              placeholder="Nom d'utilisateur"
              value={credentials.username}
              onInput={value => setCredentials("username", value)}
              autocomplete="username"
            />

            <Input.Password
              placeholder="Mot de passe"
              value={credentials.password}
              onInput={value => setCredentials("password", value)}
              autocomplete="current-password"
            />

            <label
              class="mx-auto my-2 inline border rounded-full px-3 py-1 transition"
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
              class="mt-2 w-full rounded-md bg-latte-rosewater p-2 text-latte-base disabled:opacity-40"
              type="submit"
            >
              {loading() ? "Connexion en cours..." : "Connexion !"}
            </button>
          </form>
        </>
      )}
    </Show>
  );
};

export const AuthenticateSessionModal: Component<ModalProps & Props> = (props) => (
  <Modal open={props.open} onOpenChange={props.onOpenChange}>
    <AuthenticateSessionModalContent
      instance={props.instance}
      loading={props.loading}
    />
  </Modal>
);
