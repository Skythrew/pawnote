import type { Component } from "solid-js";
import { useRegisterSW } from "virtual:pwa-register/solid";

import Modal from "@/components/Modal";
import toast from "solid-toast";

const PornoteUpdater: Component = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered (registration) {
      console.info("[service-worker]", registration);
    },
    onRegisterError (error) {
      console.error("[service-worker]", error);
    }
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  createEffect(on(offlineReady, (isOfflineReady) => {
    if (isOfflineReady) {
      toast("Pornote est prêt à être utilisé hors-ligne !");
    }
  }));

  return (
    <Modal open={needRefresh()} onClose={close}>
      <div class="bg-brand-white border-brand-primary text-brand-dark dark:text-brand-white mx-0 my-auto max-w-md w-full border-2 rounded-lg p-4 dark:bg-dark-200">
        <h4 class="text-md dark:text-brand-white text-brand-primary text-center font-medium">Nouvelle version disponible !</h4>

        <div class="flex flex-row justify-end gap-4 pt-4">
          <button
            onClick={() => close()}
            class="dark:text-brand-white hover:bg-brand-light hover:text-brand-primary dark:hover:text-brand-white rounded bg-transparent px-6 py-2 font-medium outline-none transition dark:(text-opacity-60) dark:hover:(bg-dark-100 text-opacity-100)"
          >
            Plus tard
          </button>

          <button
            class="bg-brand-primary text-brand-white rounded px-6 py-2 font-medium outline-none transition"
            onClick={() => updateServiceWorker(true)}
          >
            Actualiser
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PornoteUpdater;
