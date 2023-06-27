import type { Component, JSX } from "solid-js";

import type { ApiInstance, ApiLoginInformations, ApiUserData, PronoteApiAccountId } from "@pawnote/api";
import { PRONOTE_ACCOUNT_TYPES } from "@pawnote/api";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";

// import { connectToPronote } from "@/utils/client";

import { authenticate } from "@pawnote/client";
import { fetcher } from "@/utils/client/requests/fetcher";

// import app from "@/old_stores/app";
// import sessions from "@/old_stores/sessions";
// import endpoints from "@/old_stores/endpoints";
// import credentials_store from "@/old_stores/credentials";

// import { createModal } from "@/primitives/modal";
// import { SaveSessionIntoSlugModalContent } from "./SaveSessionIntoSlug";

interface Props {
  instance: ApiInstance["response"]
}

export const AuthenticateSessionModalContent: Component<Props> = (props) => {
  const first_account_type = (): number => props.instance.accounts?.[0].id;

  const handleSaveIntoSlugModalSubmit = async (slug: string): Promise<void> => {
    return await saveIntoSlug(slug, slugModalData());
  };

  // const [showSlugModal] = createModal(() => (
  //   <SaveSessionIntoSlugModalContent
  //     slugModalData={slugModalData()}
  //     onSubmit={handleSaveIntoSlugModalSubmit}
  //   />
  // ));

  const [slugModalData, setSlugModalData] = createSignal<
    Awaited<ReturnType<typeof authenticate>> | null
  >(null);

  const [loading, setLoading] = createSignal(false);

  const [credentials, setCredentials] = createStore<{
    account_type: PronoteApiAccountId
    use_ent: boolean

    username: string
    password: string
  }>({
    use_ent: false,
    username: "",
    password: "",

    account_type: first_account_type()
  });

  const processUserAuthentication: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();

    if (credentials.username.length === 0 || credentials.password.length === 0) return;
    if (!credentials.use_ent && (credentials.account_type === null || !(credentials.account_type in PRONOTE_ACCOUNT_TYPES))) return;

    try {
      setLoading(true);

      // Get unique identifier for the account.
      let deviceUUID = localStorage.getItem("device.uuid");
      if (deviceUUID === null) {
        deviceUUID = crypto.randomUUID();
        localStorage.setItem("device.uuid", deviceUUID);
      }

      const data = await authenticate(fetcher, {
        pronote_url: props.instance.pronote_url,
        use_credentials: true,

        username: credentials.username,
        password: credentials.password,
        account_type: credentials.account_type,

        device_uuid: deviceUUID,

        ...(credentials.use_ent
          ? {
            use_ent: true,
            ent_token: props.instance.ent_token as string,
            ent_url: props.instance.ent_url as string
          }
          : {
            use_ent: false
          }
        )
      });

      batch(() => {
        setLoading(false);

        setSlugModalData(data);
        // showSlugModal();
      });
    }
    catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const saveIntoSlug = async (slug: string, data: Awaited<ReturnType<typeof authenticate>>): Promise<void> => {
    if (slug.length === 0) return;

    // await sessions.upsert(
    //   slug, data.session
    // );

    // await endpoints.upsert<ApiUserData>(
    //   slug, "/user/data", data.endpoints["/user/data"]
    // );

    // await endpoints.upsert<ApiLoginInformations>(
    //   slug, "/login/informations", data.endpoints["/login/informations"]
    // );

    // await credentials_store.upsert(slug, {
    //   username: credentials.username,
    //   password: credentials.password
    // });
  };

  return (
    <Show when={props.instance}>
      {instance => (
        <>
          <Modal.Title
            as="h3"
            class="p-2 pb-2 text-center text-lg font-bold leading-6 text-latteText"
          >
            {instance().school_name}
          </Modal.Title>
          <Modal.Description class="px-6 text-center text-sm text-latteSubtext0">
            Créez une nouvelle session sur cette instance en entrant vos identifiants.
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

            <Input.Select<PronoteApiAccountId>
              options={instance().accounts.map(instance => ({ label: instance.name, value: instance.id }))}
              placeholder="Espace à utiliser"
              triggerAriaLabel="Espace Pronote"
              onChange={({ value }) => setCredentials("account_type", value)}
            />

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
    />
  </Modal>
);
