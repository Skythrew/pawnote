import type { Component } from "solid-js";
import type { ApiUserRessources } from "@/types/api";

import {
  callUserRessourcesAPI,
  getCurrentWeekNumber
} from "@/utils/client";

const AppRessources: Component = () => {
  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());
  const [weekRessources, setWeekRessources] = createSignal<ApiUserRessources["response"]["received"] | null>(null);

  /**
   * Reload the ressources depending
   * on the week number.
   */
  createEffect(on(weekNumber, async (week_number) => {
    const data = await callUserRessourcesAPI(week_number);
    setWeekRessources(data);
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
