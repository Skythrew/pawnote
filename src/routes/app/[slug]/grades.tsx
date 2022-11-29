import type { Component } from "solid-js";
import { PronoteApiOnglets } from "@/types/pronote";

import {
  getDefaultPeriodOnglet,
  callUserGradesAPI,

  parseGrades
} from "@/utils/client";

import app from "@/stores/app";

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
    <div class="flex flex-col items-center gap-2 px-4">
      <div class="flex pl-4 rounded-full border-2 border-brand-light bg-brand-light">
        <h2 class="text-lg font-medium pr-2">Notes du</h2>
        <select class="text-brand-dark bg-brand-white rounded-full px-2" onChange={(event) => {
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
        <div class="rounded-full border-2 border-brand-primary bg-brand-primary flex items-center justify-between pl-4 gap-2">
          <p class="text-brand-white">Moyenne Générale</p>
          <div class="text-brand-primary font-medium bg-brand-light rounded-full py-1 px-6">{endpoint()?.donnees.moyGenerale.V ?? "??"}</div>
        </div>
        <div class="rounded-full border border-brand-primary bg-brand-white flex items-center justify-between pl-4 gap-2">
          <p class="text-brand-primary">Moyenne Classe</p>
          <div class="text-brand-primary font-medium bg-brand-light rounded-full py-1 px-6">{endpoint()?.donnees.moyGeneraleClasse.V ?? "??"}</div>
        </div>
      </div>

      <Show keyed when={grades()}
        fallback={
          <p>Les notes n'ont pas encore été récupérées</p>
        }
      >
        {subjects => (
          <div class="w-full max-w-md flex flex-col gap-4 pb-8">
            <For each={Object.values(subjects)}>
              {subject => (
                <div class="flex flex-col">
                  <div class="px-4 py-2 w-full text-brand-white bg-brand-primary rounded-t-md border border-brand-primary border-b-0 flex justify-between items-center gap-2">
                    <h3 class="text-lg font-medium">{subject.name}</h3>
                    <h3 class="px-4 bg-brand-white text-brand-primary font-medium rounded-full">{subject.user_average}</h3>
                  </div>
                  <div class="px-4 py-1 w-full text-brand-dark rounded-b-md border border-brand-primary border-t-0">
                    <For each={subject.grades}>
                      {grade => (
                        <div class="py-2 px-4 w-full">
                          <h4 class="text-lg font-medium">{grade.user}/{grade.maximum}</h4>
                          <p>{grade.description}</p>
                          <span class="text-sm">{grade.date.toDate().toLocaleDateString()}</span>
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
  );
};

export default AppGrades;
