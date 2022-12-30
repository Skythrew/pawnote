import type { Component } from "solid-js";
import { PronoteApiOnglets } from "@/types/pronote";

import {
  getDefaultPeriodOnglet,
  callUserGradesAPI,

  parseGradesIntoSubjects
} from "@/utils/client";

import app from "@/stores/app";

import GradeInfoModal from "@/components/modals/GradeInfo";

const AppGrades: Component = () => {
  onMount(() => console.groupCollapsed("grades"));
  onCleanup(() => console.groupEnd());

  const [currentPeriod, setCurrentPeriod] = createSignal(getDefaultPeriodOnglet(PronoteApiOnglets.Grades));

  const periods = () => app.current_user?.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;

  const endpoint = () => app.current_user.endpoints?.[`/user/grades/${currentPeriod().N}`];

  /** Renew the grades when needed. */
  createEffect(on([currentPeriod, () => app.current_user.session], async () => {
    console.groupCollapsed(`Period ${currentPeriod().L} (${currentPeriod().N})`);
    onCleanup(() => console.groupEnd());

    await callUserGradesAPI(currentPeriod);
  }));

  const grades = createMemo(() => endpoint()
    ? parseGradesIntoSubjects(endpoint()!.donnees)
    : null
  );

  return (
    <>
      <Title>{app.current_user.slug} - Notes - {APP_NAME}</Title>
      <GradeInfoModal.Component />

      <div class="flex flex-col px-4 gap-2 items-center">
        <div class="bg-brand-light border-brand-light rounded-full flex border-2 pl-4 dark:(border-brand-primary bg-brand-primary) ">
          <h2 class="font-medium text-brand-dark text-lg pr-2 dark:text-brand-white">Notes du</h2>
          <select class="bg-brand-white rounded-full outline-none text-brand-dark px-2 appearance-none dark:(bg-brand-dark text-brand-white) " onChange={(event) => {
            const period = periods()?.find(period => period.N === event.currentTarget.value);
            if (!period) return;

            setCurrentPeriod(period);
          }}>
            <For each={periods()}>
              {period => (
                <option value={period.N} selected={currentPeriod().N === period.N}>{period.L}</option>
              )}
            </For>
          </select>
        </div>

        <button class="mt-2 mb-6" onClick={() => callUserGradesAPI(currentPeriod, { force: true })}>Actualiser</button>

        <div class="flex flex-col pb-4 gap-4 md:flex-row">
          <Show keyed when={endpoint()?.donnees.moyGenerale.V}>
            {value => (
              <div class="bg-brand-primary border-brand-primary rounded-full flex border-2 pl-4 gap-2 items-center justify-between">
                <p class="text-brand-white">Moyenne Générale</p>
                <div class="bg-brand-light rounded-full font-medium text-brand-primary py-1 px-6">{value}</div>
              </div>
            )}
          </Show>
          <Show keyed when={endpoint()?.donnees.moyGeneraleClasse.V}>
            {value => (
              <div class="bg-brand-white border border-brand-primary rounded-full flex pl-4 gap-2 items-center justify-between dark:bg-brand-dark">
                <p class="text-brand-primary">Moyenne Classe</p>
                <div class="bg-brand-light rounded-full font-medium text-brand-primary py-1 px-6">{value}</div>
              </div>
            )}
          </Show>
        </div>


        <Show keyed when={grades()}
          fallback={
            <p class="text-center py-2 px-4">Les notes n'ont pas encore été récupérées.</p>
          }
        >
          {subjects => (
            <div class="flex flex-col max-w-md w-full pb-8 gap-4">
              <For each={Object.values(subjects)}
                fallback={
                  <div class="border-brand-primary rounded-md border-2 py-2 px-4">
                    <p class="text-center">Aucune note dans cette période !</p>
                  </div>
                }
              >
                {subject => (
                  <div class="flex flex-col">
                    <div class="bg-brand-primary border border-brand-primary rounded-t-md flex border-b-0 text-brand-white w-full py-2 px-4 gap-2 justify-between items-center">
                      <h3 class="font-medium text-lg">{subject.name}</h3>
                      <h3 class="bg-brand-white rounded-full font-medium text-brand-primary px-4">{subject.user_average}</h3>
                    </div>
                    <div class="border border-brand-primary rounded-b-md border-t-0 text-brand-dark w-full py-2">
                      <For each={subject.grades}>
                        {grade => (
                          <div onClick={() => GradeInfoModal.show({ grade, subject })} class="cursor-pointer w-full py-2 px-8 transition-colors hover:bg-brand-light dark:hover:bg-brand-primary">
                            <h4 class="font-medium text-lg dark:text-brand-white">
                              {typeof grade.user === "string"
                                ? grade.user
                                : <>{grade.user}/{grade.maximum} <span class="text-sm opacity-80">Coef. {grade.ratio}</span></>
                              }
                            </h4>
                            <Show when={grade.description?.trim()}>
                              <p class="text-sm dark:(text-brand-white text-opacity-60) ">{grade.description}</p>
                            </Show>
                            <span class="text-xs dark:(text-brand-white text-opacity-40) ">Le {grade.date.toDate().toLocaleDateString()} ; Moy: {grade.average} ; Max: {grade.user_max} ; Min: {grade.user_min}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          )}
        </Show>
      </div>
    </>
  );
};

export default AppGrades;
