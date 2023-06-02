import type { FlowComponent } from "solid-js";
import { Dialog } from "@kobalte/core";

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Modal: FlowComponent<ModalProps> & {
  Title: typeof Dialog["Title"]
  Description: typeof Dialog["Description"]
  CloseButton: typeof Dialog["CloseButton"]
} = (props) => (
  <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 z-50 animate-fade-out ui-expanded:animate-fade-in animate-duration-150 ui-expanded:animate-duration-150 bg-black/20" />
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <Dialog.Content class="z-50 m-[16px] max-w-[500px] w-full animate-scale-out ui-expanded:animate-scale-in animate-duration-200 ui-expanded:animate-duration-200 rounded-lg bg-latte-base p-[16px] shadow">
          {props.children}
        </Dialog.Content>
      </div>
    </Dialog.Portal>
  </Dialog.Root>
);

Modal.Title = Dialog.Title;
Modal.Description = Dialog.Description;
Modal.CloseButton = Dialog.CloseButton;

export default Modal;
