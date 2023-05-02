import type { Component } from "solid-js";
import type { Grade, GradeSubject } from "@/utils/client";

import Modal from "@/components/atoms/Modal";

const [visibility, setVisibility] = createSignal(false);
const [informations, setInformations] = createSignal<{
  grade: Grade;
  subject: GradeSubject;
} | null>(null);

const GradeInfoModal: Component = () => {
  const grade = () => informations()?.grade;
  const subject = () => informations()?.subject;

  return (
    <Modal open={visibility() && informations() !== null} onOpenChange={setVisibility}>
      <div class="text-brand-dark dark:text-brand-white bg-brand-light mb-4 flex flex-col rounded-lg p-4 dark:(bg-dark-200)">
        <h4 class="text-center text-2xl font-medium">{subject()?.name}</h4>
        <Show keyed when={grade()?.description}>
          {description => (
            <p class="text-md mb-2 text-center opacity-80">{description}</p>
          )}
        </Show>
        <span class="block text-center text-sm opacity-60">Le {grade()?.date.toDate().toLocaleDateString()}</span>
      </div>

      <div class="bg-brand-white flex flex-col gap-4 rounded-lg p-4 shadow dark:bg-dark-100">
        <div class="text-brand-dark dark:text-brand-white rounded-md p-2">
          <h4 class="text-center text-2xl font-medium">{typeof grade()?.user === "string"
            ? grade()?.user
            : <>{grade()?.user}/{grade()?.maximum}</>
          }</h4>
          <span class="block text-center text-sm opacity-80">Coef. {grade()?.ratio}</span>
        </div>

        <div class="flex items-center justify-center gap-2">
          <div class="bg-brand-light text-brand-dark dark:text-brand-white rounded-md bg-opacity-60 px-4 py-2 dark:(bg-dark-300)">
            <span class="mb-1 block text-center text-xs opacity-80">Min.</span>
            <h4 class="text-md text-center font-medium">{typeof grade()?.user_min === "string"
              ? grade()?.user_min
              : <>{grade()?.user_min}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="bg-brand-light text-brand-dark dark:text-brand-white border-brand-primary border-2 rounded-md px-4 py-4 dark:(bg-dark-100)">
            <span class="mb-1 block text-center text-xs opacity-80">Moy. Classe</span>
            <h4 class="text-center text-xl font-medium">{typeof grade()?.average === "string"
              ? grade()?.average
              : <>{grade()?.average}/{grade()?.maximum}</>
            }</h4>
          </div>
          <div class="bg-brand-light text-brand-dark dark:text-brand-white rounded-md bg-opacity-60 px-4 py-2 dark:(bg-dark-50)">
            <span class="mb-1 block text-center text-xs opacity-80">Max.</span>
            <h4 class="text-center text-xl font-medium">{typeof grade()?.user_max === "string"
              ? grade()?.user_max
              : <>{grade()?.user_max}/{grade()?.maximum}</>
            }</h4>
          </div>
        </div>

        <Show when={grade()?.optional}>
          <div class="bg-brand-primary rounded-md px-4 py-2 dark:bg-dark-200">
            <p class="text-brand-white text-center text-sm font-medium">Cette note est facultative.</p>
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
