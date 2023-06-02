import type { Component } from "solid-js";

import { useRegisterSW } from "virtual:pwa-register/solid";
import toast from "solid-toast";

import Modal from "@/components/atoms/Modal";

export const PawnoteUpdaterModalContent: Component<{
  updateServiceWorker: (refresh: boolean) => unknown
}> = (props) => (
  <>
    <Modal.Title class="pt-2 text-center text-lg font-bold text-latte-text">
      Nouvelle version disponible !
    </Modal.Title>

    <Modal.Description class="px-4 py-4 text-sm">
      Les changelogs ne sont pas encore disponible,
      mais vous pouvez en savoir plus sur les MAJs en vérifiant les salons <span class="font-medium">#updates</span> et <span class="font-medium">#github</span>{" "}
      du <a href="https://dsc.gg/pawnote" target="_blank" class="border-(b latte-rosewater dotted) font-semibold text-latte-rosewater hover:border-solid">serveur Discord de Pawnote</a>.

      <br /><br />
      Vous pouvez choisir de mettre à jour en rafraîchissant la page maintenant, ou plus tard.
    </Modal.Description>

    <div class="flex flex-col-reverse items-center justify-end gap-4 pb-2 pt-4 sm:flex-row sm:gap-8">
      <Modal.CloseButton
        onClick={() => props.updateServiceWorker(false)}
        class="text-sm text-latteOverlay1 opacity-80 transition-colors focus:opacity-90 hover:opacity-90"
      >
        Plus tard
      </Modal.CloseButton>

      <button
        class="w-full rounded-lg bg-latte-rosewater bg-opacity-5 px-6 py-2 font-medium text-latte-rosewater outline-none transition-colors sm:w-fit hover:(bg-opacity-10)"
        onClick={() => props.updateServiceWorker(true)}
      >
        Rafraichir
      </button>
    </div>
  </>
);

export const PawnoteUpdaterModal: Component = () => {
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
      <PawnoteUpdaterModalContent
        updateServiceWorker={updateServiceWorker}
      />
    </Modal>
  );
};
