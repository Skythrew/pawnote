import type { Component } from "solid-js";

import { useRegisterSW } from "virtual:pwa-register/solid";
import toast from "solid-toast";

import Modal from "@/components/atoms/Modal";

/**
 * Component allowing us to update Pawnote.
 * Relies on `vite-plugin-pwa` for service worker related stuff.
 */
export const PawnoteUpdater: Component = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered (registration) {
      console.info("[service-worker]", registration);
    },
    onRegisterError (error) {
      console.error("[service-worker]", error);
    },
    onOfflineReady () {
      toast(`${APP_NAME} est prêt à être utilisé hors-ligne !`);
    }
  });

  return (
    <Modal open={needRefresh()} onOpenChange={setNeedRefresh}>
      <Modal.Title class="text-md dark:text-brand-white text-brand-primary text-center font-medium">
        Nouvelle version disponible !
      </Modal.Title>

      <div class="flex flex-row justify-end gap-4 pt-4">
        <Modal.CloseButton
          class="dark:text-brand-white hover:bg-brand-light hover:text-brand-primary dark:hover:text-brand-white rounded bg-transparent px-6 py-2 font-medium outline-none transition dark:(text-opacity-60) dark:hover:(bg-dark-100 text-opacity-100)"
        >
          Plus tard
        </Modal.CloseButton>

        <button
          class="bg-brand-primary text-brand-white rounded px-6 py-2 font-medium outline-none transition"
          onClick={() => updateServiceWorker(true)}
        >
          Actualiser
        </button>
      </div>
    </Modal>
  );
};
