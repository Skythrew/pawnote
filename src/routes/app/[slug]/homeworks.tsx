import type { Component } from "solid-js";
import type { ApiUserHomeworks } from "@/types/api";

import {
  callUserHomeworksAPI,
  getCurrentWeekNumber
} from "@/utils/client";

const AppHomeworks: Component = () => {
  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());
  const [weekHomeworks, setWeekHomeworks] = createSignal<ApiUserHomeworks["response"]["received"] | null>(null);

  /**
   * Reload the homeworks depending
   * on the week number.
   */
  createEffect(on(weekNumber, async (week_number) => {
    const data = await callUserHomeworksAPI(week_number);
    setWeekHomeworks(data);
  }));

  return (
    <div>
      <h2>Devoirs de la semaine {weekNumber()} !</h2>

      <button onClick={() => setWeekNumber(prev => prev - 1)}>Avant</button>
      <button onClick={() => setWeekNumber(prev => prev + 1)}>Après</button>

      <Show keyed when={weekHomeworks()}>
        {homeworks => (
          <pre>{JSON.stringify(homeworks.donnees.ListeTravauxAFaire.V, null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};

export default AppHomeworks;
