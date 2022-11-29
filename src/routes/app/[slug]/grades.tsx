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

  const [period, setPeriod] = createSignal(getDefaultPeriodOnglet(PronoteApiOnglets.Grades));

  const periods = () => app.current_user?.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;

  const endpoint = () => app.current_user.endpoints?.[`/user/grades/${period().N}`];

  /** Renew the grades when needed. */
  createEffect(on(period, async () => {
    console.groupCollapsed(`Period ${period()}`);
    onCleanup(() => console.groupEnd());

    await callUserGradesAPI(period);
  }));

  const grades = createMemo(() => endpoint()
    ? parseGrades(endpoint()!.donnees)
    : null
  );

  return (
    <div class="flex flex-col items-center gap-2">
      <h2>Devoirs du {period().N}</h2>

      <select onChange={(event) => {
        const period = periods()?.find(period => period.N === event.currentTarget.value);
        if (!period) return;

        setPeriod(period);
      }}>
        <For each={periods()}>
          {period => (
            <option value={period.N}>{period.L}</option>
          )}
        </For>
      </select>

      <Show keyed when={grades()}
        fallback={
          <p>Les notes n'ont pas encore été récupérées</p>
        }
      >
        {subjects => (
          <For each={Object.values(subjects)}>
            {subject => (
              <div class="p-4">
                <h3>{subject.name}</h3>
                <For each={subject.grades}>
                  {grade => (
                    <div>
                      <h4>{grade.description}</h4>
                      <p>{grade.user}</p>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        )}
      </Show>
    </div>
  );
};

export default AppGrades;
