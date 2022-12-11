import type { Component } from "solid-js";

import {
  getCurrentWeekNumber,
  callUserRessourcesAPI
} from "@/utils/client";

import app from "@/stores/app";

const AppRessources: Component = () => {
  onMount(() => console.groupCollapsed("ressources"));
  onCleanup(() => console.groupEnd());

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  const endpoint = () => app.current_user.endpoints?.[`/user/ressources/${weekNumber()}`];

  /** Renew the ressources when needed. */
  createEffect(on(weekNumber, async (week) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserRessourcesAPI(week);
  }));

  const ressources = () => endpoint() ? endpoint()!.donnees : null;

  return (
    <div class="flex flex-col gap-2 items-center">
      <h2>Ressources de la semaine {weekNumber()}</h2>
      <div class="flex gap-2 justify-center items-center">
        <button
          class="bg-brand-light rounded-full flex py-1 px-4"
          onClick={() => setWeekNumber(prev => prev - 1)}
        >
          <IconMdiArrowLeft />
        </button>
        <button
          class="bg-brand-light rounded-full flex py-1 px-4"
          onClick={() => setWeekNumber(prev => prev + 1)}
        >
          <IconMdiArrowRight />
        </button>
      </div>

      <Show keyed when={ressources()}
        fallback={
          <div>
            <p>Les ressources sont en cours de récupération...</p>
          </div>
        }
      >
        {ressources => (
          <pre>{JSON.stringify(ressources, null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};

export default AppRessources;