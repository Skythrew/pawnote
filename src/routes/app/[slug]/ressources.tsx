import type { Component } from "solid-js";

import {
  callUserRessourcesAPI,
  getCurrentWeekNumber
} from "@/utils/client";

const AppRessources: Component = () => {
  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  /** Renew the ressources when needed. */
  createEffect(on(weekNumber, async (week) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserRessourcesAPI(week);
  }));

  return (
    <div>
      <h2>Devoirs de la semaine {weekNumber()} !</h2>

      <button onClick={() => setWeekNumber(prev => prev - 1)}>Avant</button>
      <button onClick={() => setWeekNumber(prev => prev + 1)}>Après</button>

      <Show keyed when={weekRessources()}>
        {ressources => (
          <pre>{JSON.stringify(ressources.donnees, null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};

export default AppRessources;
