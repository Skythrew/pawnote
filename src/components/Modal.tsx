import type { ParentComponent } from "solid-js";

import {
  Transition,
  TransitionChild,
  Dialog,
  DialogOverlay,
  DialogPanel
} from "solid-headless";

const Modal: ParentComponent<{
  open: boolean;
  onClose: () => void;
}> = (props) => {
  return (
    <Portal>
      <Transition
        appear
        show={props.open}
      >
        <Dialog
          isOpen
          class="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => props.onClose()}
        >
          <div class="min-h-screen p-4 flex items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogOverlay class="fixed inset-0 bg-brand-dark bg-opacity-60" aria-hidden="true" />
            </TransitionChild>

            <TransitionChild
              class="transform z-40"
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <DialogPanel>
                {props.children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </Portal>
  );
};

export default Modal;
