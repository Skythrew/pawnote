import type { JSX } from "solid-js";

import { render } from "solid-js/web";
import { createSignal, onCleanup } from "solid-js";

import Modal from "@/components/atoms/Modal";

export const createModal = (createModalChildren: (components: {
  Title: typeof Modal["Title"],
  Description: typeof Modal["Description"],
  CloseButton: typeof Modal["CloseButton"]
}) => JSX.Element) => {
  const [open, setOpen] = createSignal(false);

  const portal = document.createElement("div");
  document.body.appendChild(portal);

  const dispose = render(() => (
    <Modal open={open()} onOpenChange={setOpen}>
      {createModalChildren({
        Title: Modal.Title,
        Description: Modal.Description,
        CloseButton: Modal.CloseButton
      })}
    </Modal>
  ), portal);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  onCleanup(() => {
    dispose();
    portal.remove();
  });

  return [show, hide] as const;
};
