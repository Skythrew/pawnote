import type { Component } from "solid-js";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,

  callUserHomeworksAPI,
  callUserHomeworkDoneAPI,

  parseHomeworks,
  createExternalFileURL
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
    <>
      <Title>{app.current_user.slug} - Devoirs - {APP_NAME}</Title>
      <div class="flex flex-col items-center gap-2">
        <h2 class="font-medium text-xl">Devoirs de la semaine {weekNumber()}</h2>

        <div class="flex gap-2 justify-center items-center">
          <button
            class="px-4 py-1 rounded-full bg-brand-light dark:bg-brand-primary flex"
            onClick={() => setWeekNumber(prev => prev - 1)}
          >
            <IconMdiArrowLeft />
          </button>
          <button
            class="px-4 py-1 rounded-full bg-brand-light dark:bg-brand-primary flex"
            onClick={() => setWeekNumber(prev => prev + 1)}
          >
            <IconMdiArrowRight />
          </button>
        </div>

        <button onClick={() => callUserHomeworksAPI(weekNumber(), { force: true })}>Actualiser</button>

        <Show when={homeworks()}
          fallback={
            <div>
              <p>Les devoirs sont en cours de récupération...</p>
            </div>
          }
        >
          <div class="my-8 md:px-6 flex flex-col gap-2">
            <For each={Object.keys(homeworks()!).map(Number)}
              fallback={
                <div class="border-2 border-brand-primary px-4 py-2 rounded-md">
                  <p class="text-center">Aucun devoirs cette semaine !</p>
                </div>
              }
            >
              {day_index => (
                <Show when={homeworks()![day_index].length > 0}>
                  <div class="px-2 py-5 rounded-md md:max-w-md w-full flex flex-col relative">
                    <h2 class="absolute dark:(bg-brand-primary text-brand-light) bg-brand-light left-0 md:-left-4 -top-5 text-md font-medium text-brand-primary pl-6 right-0 md:right-4 py-1 md:rounded-full shadow">{getDayNameFromDayNumber(day_index)}</h2>
                    <For each={homeworks()![day_index]}>
                      {homework => (
                        <div style={{ "border-color": homework.subject_color }}
                          class="py-2 px-4 mx-2 bg-brand-white dark:(bg-brand-dark text-brand-white) border-l-4 flex-col gap-2">
                          <div class="flex justify-between items-center">
                            <h3 class="font-medium">{homework.subject_name}</h3>
                            <input
                              type="checkbox"
                              checked={homework.done}
                              onChange={(event) => {
                                callUserHomeworkDoneAPI({
                                  homework_id: homework.id,
                                  week_number: weekNumber(),
                                  done: event.currentTarget.checked
                                });
                              }}
                            />
                          </div>

                          <div class="text-sm break-words" innerHTML={homework.description} />

                          <Show when={homework.attachments.length > 0}>
                            <div class="mt-2 flex flex-wrap gap-2">
                              <For each={homework.attachments}>
                                {attachment => (
                                  <a
                                    class="text-xs px-2 py-1 bg-brand-light rounded-md"
                                    href={createExternalFileURL(attachment)}
                                    target="_blank"
                                  >
                                    {attachment.name}
                                  </a>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              )}
            </For>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppHomeworks;

