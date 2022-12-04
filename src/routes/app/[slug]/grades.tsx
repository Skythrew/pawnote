import type { Component } from "solid-js";
import { PronoteApiOnglets } from "@/types/pronote";

import {
  getDefaultPeriodOnglet,
  callUserGradesAPI,

  parseGrades
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
  createEffect(on(currentPeriod, async () => {
    console.groupCollapsed(`Period ${currentPeriod().L} (${currentPeriod().N})`);
    onCleanup(() => console.groupEnd());

    await callUserGradesAPI(currentPeriod);
  }));

  const grades = createMemo(() => endpoint()
    ? parseGrades(endpoint()!.donnees)
    : null
  );

  return (
    <>
      <Title>{app.current_user.slug} - Notes - Pornote</Title>
      <GradeInfoModal.Component />

      <div class="flex flex-col items-center gap-2 px-4">
        <div class="flex pl-4 rounded-full border-2 border-brand-light bg-brand-light dark:(border-brand-primary bg-brand-primary)">
          <h2 class="text-brand-dark text-lg font-medium pr-2 dark:text-brand-white">Notes du</h2>
          <select class="text-brand-dark bg-brand-white dark:(bg-brand-dark text-brand-white) appearance-none outline-none rounded-full px-2" onChange={(event) => {
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

        <div class="flex flex-col md:flex-row gap-4 pb-4 pt-6">
          <Show keyed when={endpoint()?.donnees.moyGenerale.V}>
            {value => (
              <div class="rounded-full border-2 border-brand-primary bg-brand-primary flex items-center justify-between pl-4 gap-2">
                <p class="text-brand-white">Moyenne Générale</p>
                <div class="text-brand-primary font-medium bg-brand-light rounded-full py-1 px-6">{value}</div>
              </div>
            )}
          </Show>
          <Show keyed when={endpoint()?.donnees.moyGeneraleClasse.V}>
            {value => (
              <div class="rounded-full border border-brand-primary bg-brand-white dark:bg-brand-dark flex items-center justify-between pl-4 gap-2">
                <p class="text-brand-primary">Moyenne Classe</p>
                <div class="text-brand-primary font-medium bg-brand-light rounded-full py-1 px-6">{value}</div>
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
            <div class="w-full max-w-md flex flex-col gap-4 pb-8">
              <For each={Object.values(subjects)}
                fallback={
                  <div class="border-2 border-brand-primary px-4 py-2 rounded-md">
                    <p class="text-center">Aucune note dans cette période !</p>
                  </div>
                }
              >
                {subject => (
                  <div class="flex flex-col">
                    <div class="px-4 py-2 w-full text-brand-white bg-brand-primary rounded-t-md border border-brand-primary border-b-0 flex justify-between items-center gap-2">
                      <h3 class="text-lg font-medium">{subject.name}</h3>
                      <h3 class="px-4 bg-brand-white text-brand-primary font-medium rounded-full">{subject.user_average}</h3>
                    </div>
                    <div class="py-2 w-full text-brand-dark rounded-b-md border border-brand-primary border-t-0">
                      <For each={subject.grades}>
                        {grade => (
                          <div onClick={() => GradeInfoModal.show({ grade, subject })} class="cursor-pointer hover:bg-brand-light dark:hover:bg-brand-primary transition-colors py-2 px-8 w-full">
                            <h4 class="text-lg font-medium dark:text-brand-white">
                              {typeof grade.user === "string"
                                ? grade.user
                                : <>{grade.user}/{grade.maximum} <span class="text-sm opacity-80">Coef. {grade.ratio}</span></>
                              }
                            </h4>
                            <Show when={grade.description?.trim()}>
                              <p class="text-sm dark:(text-brand-white text-opacity-60)">{grade.description}</p>
                            </Show>
                            <span class="text-xs dark:(text-brand-white text-opacity-40)">Le {grade.date.toDate().toLocaleDateString()} ; Moy: {grade.average} ; Max: {grade.user_max} ; Min: {grade.user_min}</span>
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
