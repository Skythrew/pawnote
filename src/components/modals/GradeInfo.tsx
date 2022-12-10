import type { Component } from "solid-js";
import type { Grade, GradeSubject } from "@/utils/client";

import Modal from "@/components/Modal";

const [visibility, setVisibility] = createSignal(false);
const [informations, setInformations] = createSignal<{
  grade: Grade;
  subject: GradeSubject;
} | null>(null);

const GradeInfoModal: Component = () => {
  const grade = () => informations()?.grade;
  const subject = () => informations()?.subject;

  return (
    <Modal open={visibility() && informations() !== null} onClose={() => setVisibility(false)}>
      <div class="bg-brand-light rounded-lg flex flex-col text-brand-dark mb-4 p-4 dark:(bg-dark-200 text-brand-white) ">
        <h4 class="font-medium text-center text-2xl">{subject()?.name}</h4>
        <Show keyed when={grade()?.description}>
          {description => (
            <p class="text-center text-md mb-2 opacity-80">{description}</p>
          )}
        </Show>
        <span class="text-center text-sm opacity-60 block">Le {grade()?.date.toDate().toLocaleDateString()}</span>
      </div>

      <div class="bg-brand-white rounded-lg flex flex-col shadow p-4 gap-4 dark:bg-dark-100">
        <div class="rounded-md text-brand-dark p-2 dark:text-brand-white">
          <h4 class="font-medium text-center text-2xl">{typeof grade()?.user === "string"
            ? grade()?.user
            : <>{grade()?.user}/{grade()?.maximum}</>
          }</h4>
          <span class="text-center text-sm opacity-80 block">Coef. {grade()?.ratio}</span>
        </div>

        <div class="flex gap-2 items-center justify-center">
          <div class="bg-brand-light rounded-md bg-opacity-60 text-brand-dark py-2 px-4 dark:(text-brand-white bg-dark-300) ">
            <span class="text-center text-xs mb-1 opacity-80 block">Min.</span>
            <h4 class="font-medium text-center text-md">{typeof grade()?.user_min === "string"
              ? grade()?.user_min
              : <>{grade()?.user_min}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="bg-brand-light border-brand-primary rounded-md border-2 text-brand-dark py-4 px-4 dark:(text-brand-white bg-dark-100) ">
            <span class="text-center text-xs mb-1 opacity-80 block">Moy. Classe</span>
            <h4 class="font-medium text-center text-xl">{typeof grade()?.average === "string"
              ? grade()?.average
              : <>{grade()?.average}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="bg-brand-light rounded-md bg-opacity-60 text-brand-dark py-2 px-4 dark:(text-brand-white bg-dark-50) ">
            <span class="text-center text-xs mb-1 opacity-80 block">Max.</span>
            <h4 class="font-medium text-center text-xl">{typeof grade()?.user_max === "string"
              ? grade()?.user_max
              : <>{grade()?.user_max}/{grade()?.maximum}</>
            }</h4>
          </div>
        </div>

        <Show when={grade()?.optional}>
          <div class="bg-brand-primary rounded-md py-2 px-4 dark:bg-dark-200">
            <p class="font-medium text-sm text-center text-brand-white">Cette note est facultative.</p>
          </div>
        </Show>
      </div>
    </Modal>
  );
};

/**
 * @example
 * import type { Grade, GradeSubject } from "@/utils/client";
 * import GradeInfoModal from "@/components/modals/GradeInfo";
 *
 * const App: Component<{ grade: Grade, subject: GradeSubject }> = (informations) => {
 *   return (
 *     <>
 *       <GradeInfoModal.Component />
 *       <button onClick={GradeInfoModal.show(informations)}>Show Grade Infos</button>
 *     </>
 *   )
 * }
 */
export default {
  Component: GradeInfoModal,
  show: (informations: {
    grade: Grade,
    subject: GradeSubject
  }) => batch(() => {
    setInformations(informations);
    setVisibility(true);
  })
};
