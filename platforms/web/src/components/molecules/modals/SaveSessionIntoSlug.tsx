import type { Component, JSX } from "solid-js";

import { useNavigate } from "solid-start";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";

import { connectToPronote } from "@/utils/client";

import app from "@/stores/app";

interface Props {
  slugModalData: Awaited<ReturnType<typeof connectToPronote>> | null;
  onSubmit: (slug: string) => Promise<unknown>;
}

export const SaveSessionIntoSlugModalContent: Component<Props> = (props) => {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const [slug, setSlug] = createSignal("");

  const handleSlugSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();
    if (!slug()) return;

    setLoading(true);
    await props.onSubmit(slug());

    batch(() => {
      setLoading(false);
      app.setCurrentState({ restoring_session: false });

      navigate(`/app/session/${slug()}`);
    });
  };

  return (
    <Show when={props.slugModalData}>
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
            class="text-latteSubtext0 px-6 text-center text-sm"
          >
            Vous êtes connecté en tant que {data().endpoints["/user/data"].donnees.ressource.L} à l'instance {data().endpoints["/user/data"].donnees.ressource.Etablissement.V.L.trim()}.
          </Modal.Description>

          <p class="text-latteSubtext1 my-4 text-center text-sm">Entrez un nom d'utilisateur local. Celui-ci va être utilisé en interne pour stocker vos données.</p>

          <form onSubmit={handleSlugSubmit}>
            <Input.Text
              value={slug()}
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
              disabled={loading()}
              class="bg-brand-primary text-brand-light mt-2 w-full rounded-md p-2 disabled:opacity-40"
            >
              {loading() ? "Sauvegarde..." : "Sauvegarder la session"}
            </button>
          </form>
        </>
      )}
    </Show>
  );
};

export const SaveSessionIntoSlugModal: Component<ModalProps & Props> = (props) => (
  <Modal open={props.open} onOpenChange={props.onOpenChange}>
    <SaveSessionIntoSlugModalContent
      slugModalData={props.slugModalData}
      onSubmit={props.onSubmit}
    />
  </Modal>
);
