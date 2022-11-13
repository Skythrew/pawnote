import type { Component } from "solid-js";

import {
  callUserHomeworksAPI,
  getCurrentWeekNumber,

  parseHomeworks
} from "@/utils/client";

import app from "@/stores/app";

const AppHomeworks: Component = () => {
  onMount(() => console.groupCollapsed("homeworks"));
  onCleanup(() => console.groupEnd());

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  const endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${weekNumber()}`];

  /** Renew the homeworks when needed. */
  createEffect(on(weekNumber, async (week) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserHomeworksAPI(week);
  }));

  const homeworks = () => endpoint() ? parseHomeworks(endpoint()!.donnees) : null;

  return (
    <div>
      <h2>Devoirs de la semaine {weekNumber()} !</h2>

      <button onClick={() => setWeekNumber(prev => prev - 1)}>Avant</button>
      <button onClick={() => setWeekNumber(prev => prev + 1)}>Après</button>

      <Show keyed when={homeworks()}>
        {homeworks => (
          <pre>{JSON.stringify(homeworks)}</pre>
        )}
      </Show>
    </div>
  );
};

export default AppHomeworks;

