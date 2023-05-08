import type { Component, JSX } from "solid-js";

import type { PronoteApiAccountId } from "@/types/pronote";
import type { ApiInstance, ApiLoginInformations, ApiUserData } from "@/types/api";

import { Select } from "@kobalte/core";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";

import { connectToPronote } from "@/utils/client";
import { objectHasProperty } from "@/utils/globals";
import { PRONOTE_ACCOUNT_TYPES } from "@/utils/constants";

import app from "@/stores/app";
import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";
import credentials_store from "@/stores/credentials";

interface Props {
  loading: boolean;
  instance: ApiInstance["response"] | null;
}

export const AuthenticateSessionModalContent: Component<Props> = (props) => {
  const first_account_type = () => props.instance ? props.instance.accounts?.[0].id as number : null;

  const [slugModalData, setSlugModalData] = createSignal<
    Awaited<ReturnType<typeof connectToPronote>> | null
  >(null);

  const [loading, setLoading] = createSignal(false);

  const [credentials, setCredentials] = createStore<{
    account_type: PronoteApiAccountId | null;
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
            class="text-brand-dark text-center text-lg font-medium leading-6"
          >
            {app.current_user.slug
              ? "Connexion perdue!"
              : instance().school_name
            }
          </Modal.Title>
          <Modal.Description class="text-brand-dark text-sm text-opacity-80">
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
              <Select.Root
                options={instance().accounts}
                optionValue="id"
                optionTextValue="name"
                placeholder="Sélectionner un compte…"
                itemComponent={props => (
                  <Select.Item item={props.item} class="relative h-[32px] w-full flex cursor-pointer items-center justify-between rounded-md ui-selected:bg-latteRosewater px-2 text-black outline-none hover:bg-latte-lavender">
                    <Select.ItemLabel>{props.item.textValue}</Select.ItemLabel>
                    <Select.ItemIndicator class="h-[20px] w-[20px] inline-flex items-center justify-center">
                      <IconMdiCheck/>
                    </Select.ItemIndicator>
                  </Select.Item>
                )}
              >
                <Select.Trigger class="w-full inline-flex items-center justify-between border rounded-lg bg-white py-2 pl-[16px] pr-[10px] outline-none" aria-label="Compte">
                  <Select.Value<{ name: string, id: PronoteApiAccountId }> class="overflow-hidden text-ellipsis whitespace-nowrap">
                    {state => state.selectedOption().name}
                  </Select.Value>
                  <Select.Icon class="h-[20px] w-[20px] flex-[0_0_20px]">
                    <IconMdiChevronDown />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content class="z-100 transform-origin-[var(--kb-select-content-transform-origin)] border rounded-lg bg-white shadow-md">
                    <Select.Listbox class="max-h-[360px] overflow-y-auto p-2" />
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              <label class="text-brand-dark">Espace à utiliser
                <select
                  class="bg-brand-white text-brand-dark border-brand-dark focus:border-brand-primary focus:bg-brand-light w-full appearance-none border rounded-md px-2 py-1 outline-none"
                  onChange={event => setCredentials("account_type", parseInt(event.currentTarget.value))}
                >
                  <For each={instance().accounts}>
                    {espace => (
                      <option value={espace.id}>{espace.name}</option>
                    )}
                  </For>
                </select>
              </label>
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

            {/* <label class="text-brand-dark">
              Mot de passe
              <input
                class="bg-brand-white border-brand-dark text-brand-dark focus:border-brand-primary focus:bg-brand-light w-full border rounded-md px-2 py-1 outline-none"
                type="password"
                value={credentials.password}
                onChange={event =>  event.currentTarget.value)}
                autocomplete="current-password"
              />
            </label> */}

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
              class="bg-brand-primary text-brand-light mt-2 w-full rounded-md p-2 disabled:opacity-40"
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
