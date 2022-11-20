import type { Component } from "solid-js";

import {
  callUserHomeworksAPI,
  getCurrentWeekNumber,

  getDayNameFromDayNumber,

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
    <div class="flex flex-col items-center gap-2">
      <h2>Devoirs de la semaine {weekNumber()}</h2>
      <div class="flex gap-2 justify-center items-center">
        <button
          class="px-4 py-1 rounded-full bg-brand-light flex"
          onClick={() => setWeekNumber(prev => prev - 1)}
        >
          <IconMdiArrowLeft />
        </button>
        <button
          class="px-4 py-1 rounded-full bg-brand-light flex"
          onClick={() => setWeekNumber(prev => prev + 1)}
        >
          <IconMdiArrowRight />
        </button>
      </div>

      <Show keyed when={homeworks()}
        fallback={
          <div>
            <p>Les devoirs sont en cours de récupération...</p>
          </div>
        }
      >
        {homeworks => (
          <div class="my-8 px-6 flex flex-col gap-2">
            <For each={Object.keys(homeworks).map(Number)}>
              {day_index => (
                <Show when={homeworks[day_index].length > 0}>
                  <div class="px-2 py-5 rounded-md bg-brand-primary max-w-md w-full flex flex-col gap-2 relative">
                    <h2 class="absolute bg-brand-light -left-4 -top-5 text-md font-medium text-brand-primary pl-6 right-4 py-1 rounded-full shadow">{getDayNameFromDayNumber(day_index)}</h2>
                    <For each={homeworks[day_index]}>
                      {homework => (
                        <div class="p-2 rounded bg-brand-white flex-col">
                          <div class="flex justify-between items-center">
                            <h3 class="font-medium">{homework.subject_name}</h3>
                            <input type="checkbox" checked={homework.done} />
                          </div>

                          <div innerHTML={homework.description} />
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

export default AppHomeworks;

