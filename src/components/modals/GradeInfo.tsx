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
      <div class="flex flex-col bg-brand-light text-brand-dark p-4 rounded-lg mb-4 dark:(bg-dark-200 text-brand-white)">
        <h4 class="text-center text-2xl font-medium">{subject()?.name}</h4>
        <Show keyed when={grade()?.description}>
          {description => (
            <p class="text-center text-md opacity-80 mb-2">{description}</p>
          )}
        </Show>
        <span class="block text-center text-sm opacity-60">Le {grade()?.date.toDate().toLocaleDateString()}</span>
      </div>

      <div class="flex flex-col gap-4 bg-brand-white dark:bg-dark-100 p-4 rounded-lg shadow">
        <div class="text-brand-dark dark:text-brand-white p-2 rounded-md">
          <h4 class="text-center text-2xl font-medium">{typeof grade()?.user === "string"
            ? grade()?.user
            : <>{grade()?.user}/{grade()?.maximum}</>
          }</h4>
          <span class="block text-center text-sm opacity-80">Coef. {grade()?.ratio}</span>
        </div>

        <div class="flex items-center justify-center gap-2">
          <div class="py-2 px-4 rounded-md bg-brand-light bg-opacity-60 text-brand-dark dark:(text-brand-white bg-dark-300)">
            <span class="block text-center text-xs opacity-80 mb-1">Min.</span>
            <h4 class="text-center text-md font-medium">{typeof grade()?.user_min === "string"
              ? grade()?.user_min
              : <>{grade()?.user_min}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="py-4 px-4 rounded-md border-2 border-brand-primary bg-brand-light text-brand-dark dark:(text-brand-white bg-dark-100)">
            <span class="block text-center text-xs opacity-80 mb-1">Moy. Classe</span>
            <h4 class="text-center text-xl font-medium">{typeof grade()?.average === "string"
              ? grade()?.average
              : <>{grade()?.average}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="py-2 px-4 rounded-md bg-brand-light bg-opacity-60 text-brand-dark dark:(text-brand-white bg-dark-50)">
            <span class="block text-center text-xs opacity-80 mb-1">Max.</span>
            <h4 class="text-center text-xl font-medium">{typeof grade()?.user_max === "string"
              ? grade()?.user_max
              : <>{grade()?.user_max}/{grade()?.maximum}</>
            }</h4>
          </div>
        </div>

        <Show when={true}>
          <div class="bg-brand-primary dark:bg-dark-200 px-4 py-2 rounded-md">
            <p class="text-sm font-medium text-center text-brand-white">Cette note est facultative.</p>
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
