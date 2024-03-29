import type { Component, JSX } from "solid-js";
import { useNavigate } from "solid-start";

import type { ApiInstance, ApiLoginInformations, ApiUserData, PronoteApiAccountId } from "@pawnote/api";
import { PRONOTE_ACCOUNT_TYPES } from "@pawnote/api";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";

import { authenticate, sessions, credentials as credentials_store, endpoints } from "@pawnote/client";
import { fetcher } from "@/utils/client/requests/fetcher";

import { createModal } from "@/primitives/modal";

interface Props {
  instance: ApiInstance["response"]
}

type ReturnValueOfAuthenticate = Awaited<ReturnType<typeof authenticate>>;

export const AuthenticateSessionModalContent: Component<Props> = (props) => {
  const navigate = useNavigate();

  const first_account_type = (): number => props.instance.accounts?.[0].id;

  const [slug, setSlug] = createSignal("");
  const [slugModalData, setSlugModalData] = createSignal<ReturnValueOfAuthenticate | null>(null);

  const [showSlugModal] = createModal(Modal => (
    <Show when={slugModalData()}>
      {data => (
        <>
          <Modal.Title
            as="h3"
            class="p-2 pb-2 text-center text-lg font-bold leading-6 text-latteText"
          >
            Connexion établie !
          </Modal.Title>
          <Modal.Description
            as="p"
            class="px-6 text-center text-sm text-latteSubtext0"
          >
            Vous êtes connecté en tant que {data().endpoints["/user/data"].donnees.ressource.L} à l'instance {data().endpoints["/user/data"].donnees.ressource.Etablissement.V.L.trim()}.
          </Modal.Description>

          <p class="my-6 text-center text-sm text-latteSubtext1">Entrez un nom d'utilisateur local. Celui-ci va être utilisé en interne pour stocker vos données.</p>

          <form onSubmit={processSaveIntoSlug} class="flex flex-col gap-4 px-2">
            <Input.Text
              value={slug()}
              placeholder="Slug pour ce compte"
              onInput={value => {
                setSlug(
                  value
                    .toLowerCase()
                    // Clean-up the value to make sure it's a slug.
                    .replace(/[^a-z0-9-]+/g, "-")
                );
              }}
            />

            <button
              type="submit"
              disabled={loading() || slug().length === 0}
              class="mt-2 w-full rounded-md bg-latte-rosewater bg-opacity-100 p-2 text-latte-base outline-none transition-colors disabled:(bg-latte-text bg-opacity-5 text-latte-text text-opacity-80 focus:bg-opacity-10 hover:bg-opacity-10) focus:bg-opacity-90 hover:bg-opacity-90"
            >
              {loading() ? "Sauvegarde..." : "Sauvegarder la session"}
            </button>
          </form>
        </>
      )}
    </Show>
  ));

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
        showSlugModal();
      });
    }
    catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const processSaveIntoSlug: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();

    const data = slugModalData();
    if (slug().length === 0 || data === null) return false;

    try {
      setLoading(true);

      await sessions.upsert(
        slug(), data.session
      );

      await endpoints.upsert<ApiUserData>(
        slug(), "/user/data", data.endpoints["/user/data"]
      );

      await endpoints.upsert<ApiLoginInformations>(
        slug(), "/login/informations", data.endpoints["/login/informations"]
      );

      await credentials_store.upsert(slug(), data.credentials);

      navigate("/app");
    }
    catch (err) {
      console.error(err);
    }
    finally {
      setLoading(false);
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
