import type { Component } from "solid-js";
import type { ApiUserGrades } from "@/types/api";

import { PronoteApiOnglets } from "@/types/pronote";
import app from "@/stores/app";

import {
  getDefaultPeriodOnglet,
  callUserGradesAPI
} from "@/utils/client";

const AppGrades: Component = () => {
  const [period, setPeriod] = createSignal(getDefaultPeriodOnglet(PronoteApiOnglets.Grades));
  const [periodGrades, setPeriodGrades] = createSignal<ApiUserGrades["response"]["received"] | null>(null);

  const periods = () => app.current_user?.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;

  /**
   * Reload the homeworks depending
   * on the week number.
   */
  createEffect(on(period, async (period) => {
    const data = await callUserGradesAPI(period);
    setPeriodGrades(data);
  }));

  return (
    <div>
      <h2>Notes de la période {period().L} !</h2>

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

      <Show keyed when={periodGrades()}>
        {grades => (
          <pre>{JSON.stringify(grades.donnees, null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};

export default AppGrades;
