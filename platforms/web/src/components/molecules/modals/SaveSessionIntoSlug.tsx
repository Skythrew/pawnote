import type { Component, JSX } from "solid-js";

import { useNavigate } from "solid-start";

import Modal, { type ModalProps } from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";
import type { authenticate } from "@pawnote/client";

interface Props {
  slugModalData: Awaited<ReturnType<typeof authenticate>> | null
  onSubmit: (slug: string) => Promise<unknown>
}

export const SaveSessionIntoSlugModalContent: Component<Props> = (props) => {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const [slug, setSlug] = createSignal("");

  const handleSlugSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
    event.preventDefault();
    if (slug().length === 0) return;

    setLoading(true);
    await props.onSubmit(slug());

    batch(() => {
      setLoading(false);
      navigate("/app");
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
            class="px-6 text-center text-sm text-latteSubtext0"
          >
            Vous êtes connecté en tant que {data().endpoints["/user/data"].donnees.ressource.L} à l'instance {data().endpoints["/user/data"].donnees.ressource.Etablissement.V.L.trim()}.
          </Modal.Description>

          <p class="my-6 text-center text-sm text-latteSubtext1">Entrez un nom d'utilisateur local. Celui-ci va être utilisé en interne pour stocker vos données.</p>

          <form onSubmit={handleSlugSubmit} class="flex flex-col gap-4 px-2">
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
