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

  createEffect(() => {
    if (offlineReady()) {
      toast("Pornote est prêt à être utilisé hors-ligne !");
    }
  });

  return (
    <Modal open={needRefresh()} onClose={close}>
      <h4 class="text-md font-medium text-center text-brand-primary dark:text-brand-white">Nouvelle version disponible !</h4>

      <div class="flex flex-row justify-end gap-4 pt-4">
        <button
          onClick={() => close()}
          class="
            px-6 py-2 rounded outline-none
            dark:(text-brand-white text-opacity-60)
            hover:(bg-brand-light text-brand-primary)
            dark:hover:(bg-dark-100 text-brand-white text-opacity-100)
            font-medium transition bg-transparent
          "
        >
          Plus tard
        </button>

        <button
          class="px-6 py-2 transition outline-none bg-brand-primary text-brand-white rounded font-medium"
          onClick={() => updateServiceWorker(true)}
        >
          Actualiser
        </button>
      </div>
    </Modal>
  );
};

export default PornoteUpdater;
