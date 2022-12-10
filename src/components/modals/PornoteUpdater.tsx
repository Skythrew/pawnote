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
      <div class="bg-brand-white border-brand-primary rounded-lg my-auto max-w-md border-2 mx-0 text-brand-dark w-full p-4 dark:bg-dark-200 dark:text-brand-white">
        <h4 class="font-medium text-md text-center text-brand-primary dark:text-brand-white">Nouvelle version disponible !</h4>

        <div class="flex flex-row pt-4 gap-4 justify-end">
          <button
            onClick={() => close()}
            class="bg-transparent rounded font-medium outline-none py-2 px-6 transition dark:(text-brand-white text-opacity-60) hover:(bg-brand-light text-brand-primary) dark:hover:(bg-dark-100 text-brand-white text-opacity-100) "
          >
            Plus tard
          </button>

          <button
            class="bg-brand-primary rounded font-medium outline-none text-brand-white py-2 px-6 transition"
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
