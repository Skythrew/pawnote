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

      <div class="flex flex-col items-center gap-2 px-4">
        <div class="bg-brand-light dark:bg-brand-primary border-brand-light dark:border-brand-primary flex border-2 rounded-full pl-4">
          <h2 class="text-brand-dark dark:text-brand-white pr-2 text-lg font-medium">Notes du</h2>
          <select class="bg-brand-white text-brand-dark dark:bg-brand-dark dark:text-brand-white appearance-none rounded-full px-2 outline-none" onChange={(event) => {
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

        <button class="mb-6 mt-2" onClick={() => callUserGradesAPI(currentPeriod, { force: true })}>Actualiser</button>

        <div class="flex flex-col gap-4 pb-4 md:flex-row">
          <Show keyed when={endpoint()?.donnees.moyGenerale.V}>
            {value => (
              <div class="bg-brand-primary border-brand-primary flex items-center justify-between gap-2 border-2 rounded-full pl-4">
                <p class="text-brand-white">Moyenne Générale</p>
                <div class="bg-brand-light text-brand-primary rounded-full px-6 py-1 font-medium">{value}</div>
              </div>
            )}
          </Show>
          <Show keyed when={endpoint()?.donnees.moyGeneraleClasse.V}>
            {value => (
              <div class="bg-brand-white border-brand-primary dark:bg-brand-dark flex items-center justify-between gap-2 border rounded-full pl-4">
                <p class="text-brand-primary">Moyenne Classe</p>
                <div class="bg-brand-light text-brand-primary rounded-full px-6 py-1 font-medium">{value}</div>
              </div>
            )}
          </Show>
        </div>


        <Show keyed when={grades()}
          fallback={
            <p class="px-4 py-2 text-center">Les notes n'ont pas encore été récupérées.</p>
          }
        >
          {subjects => (
            <div class="max-w-md w-full flex flex-col gap-4 pb-8">
              <For each={Object.values(subjects)}
                fallback={
                  <div class="border-brand-primary border-2 rounded-md px-4 py-2">
                    <p class="text-center">Aucune note dans cette période !</p>
                  </div>
                }
              >
                {subject => (
                  <div class="flex flex-col">
                    <div class="bg-brand-primary border-brand-primary text-brand-white w-full flex items-center justify-between gap-2 border border-b-0 rounded-t-md px-4 py-2">
                      <h3 class="text-lg font-medium">{subject.name}</h3>
                      <h3 class="bg-brand-white text-brand-primary rounded-full px-4 font-medium">{subject.user_average}</h3>
                    </div>
                    <div class="border-brand-primary text-brand-dark w-full border border-t-0 rounded-b-md py-2">
                      <For each={subject.grades}>
                        {grade => (
                          <div onClick={() => GradeInfoModal.show({ grade, subject })} class="hover:bg-brand-light dark:hover:bg-brand-primary w-full cursor-pointer px-8 py-2 transition-colors">
                            <h4 class="dark:text-brand-white text-lg font-medium">
                              {typeof grade.user === "string"
                                ? grade.user
                                : <>{grade.user}/{grade.maximum} <span class="text-sm opacity-80">Coef. {grade.ratio}</span></>
                              }
                            </h4>
                            <Show when={grade.description?.trim()}>
                              <p class="dark:text-brand-white text-sm dark:(text-opacity-60)">{grade.description}</p>
                            </Show>
                            <span class="dark:text-brand-white text-xs dark:(text-opacity-40)">Le {grade.date.toDate().toLocaleDateString()} ; Moy: {grade.average} ; Max: {grade.user_max} ; Min: {grade.user_min}</span>
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
