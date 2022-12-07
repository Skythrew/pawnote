import type { Component } from "solid-js";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,

  callUserHomeworksAPI,
  callUserTimetableAPI,
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
    await callUserTimetableAPI(week);
  }));

  const homeworks = createMemo(() => endpoint()
    ? parseHomeworks(endpoint()!.donnees)
    : null
  );

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
          <div class="my-8 md:px-6 md:max-w-md w-full flex flex-col">
            <For each={Object.keys(homeworks()!).map(Number)}
              fallback={
                <div class="mx-auto w-max border-2 border-brand-primary px-4 py-2 rounded-md">
                  <p class="text-center">Aucun devoirs cette semaine !</p>
                </div>
              }
            >
              {day_index => (
                <Show when={homeworks()![day_index].length > 0}>
                  <div class="rounded-md flex flex-col relative">
                    <h2 class="dark:(bg-brand-primary text-brand-light) bg-brand-light md:(absolute -left-4 right-4 rounded-full -top-5) text-md font-medium text-brand-primary pl-6 py-1">{getDayNameFromDayNumber(day_index)}</h2>
                    <For each={homeworks()![day_index]}>
                      {(homework, homework_index) => (
                        <div style={{ "border-color": homework.subject_color }}
                          class="relative py-3 pl-4 mx-4 bg-brand-white dark:(bg-brand-dark text-brand-white) border-l-4 flex-col gap-2">
                          <div class="flex justify-between items-center mb-2">
                            <div>
                              <h3 class="text-md font-medium">{homework.subject_name}</h3>
                              <span>Pour {app.current_user.endpoints?.[`/user/timetable/${weekNumber()}`]?.donnees.ListeCours.find(
                                item => item.N === homework.subject_timetable_id
                              )?.DateDuCours.V ?? "EDT non récupéré"}
                              </span>
                            </div>
                            <label class="flex text-xs gap-2 rounded-full border px-3 py-1 items-center"
                              classList={{
                                "border-brand-primary bg-brand-light text-brand-primary dark:(bg-dark-200 text-brand-light border-transparent)": homework.done,
                                "border-brand-dark dark:border-brand-white": !homework.done
                              }}
                            >
                              {homework.done
                                ? <>Fait <IconMdiCheck /></>
                                : <>Non Fait <IconMdiClose /></>
                              }
                              <input
                                hidden
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
                            </label>
                          </div>

                          <div class="text-sm break-words" innerHTML={homework.description} />

                          <Show when={homework.attachments.length > 0}>
                            <div class="mt-2 flex flex-wrap gap-2">
                              <For each={homework.attachments}>
                                {attachment => (
                                  <a
                                    class="text-xs px-2 py-1 bg-brand-light rounded-md dark:text-brand-dark"
                                    href={createExternalFileURL(attachment)}
                                    target="_blank"
                                  >
                                    {attachment.name}
                                  </a>
                                )}
                              </For>
                            </div>
                          </Show>

                          <Show when={homeworks()![day_index].length - 1 !== homework_index()}>
                            <span class="z-10 h-[2px] absolute -bottom-[1px] left-2 right-0 bg-brand-dark opacity-20 dark:(bg-dark-200 opacity-100)" />
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

