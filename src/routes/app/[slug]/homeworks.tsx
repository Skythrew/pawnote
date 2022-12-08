import type { Component } from "solid-js";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,

  callUserHomeworksAPI,
  callUserHomeworkDoneAPI,

  parseHomeworks,
  createExternalFileURL
} from "@/utils/client";

import app, { AppStateCode } from "@/stores/app";

const AppHomeworks: Component = () => {
  onMount(() => console.groupCollapsed("homeworks"));
  onCleanup(() => console.groupEnd());

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  const endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${weekNumber()}`];

  /** Renew the homeworks when needed. */
  createEffect(on([weekNumber, () => app.current_user.session], async () => {
    console.groupCollapsed(`Week ${weekNumber()}`);
    onCleanup(() => console.groupEnd());

    await callUserHomeworksAPI(weekNumber());
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
          <div class="w-full flex my-8 md:px-4 justify-center">
            <div class="hidden md:block max-w-72 w-full">
              <div class="sticky"
                classList={{
                  // Header is `h-18` and app state banner is `h-8`.
                  // We add `+2` padding on `md`.
                  "top-18 md:top-20": app.current_state.code === AppStateCode.Idle,
                  "top-26 md:top-28": app.current_state.code !== AppStateCode.Idle
                }}
              >
                <h4 class="font-medium w-max text-md bg-brand-light text-brand-primary px-8 py-2 rounded-full dark:(bg-dark-200 text-brand-light)">Filtres</h4>

                <div class="mt-4 flex flex-col gap-2">
                  <label class="rounded-full px-4 py-1 flex items-center gap-2 w-max text-brand-dark border border-brand-dark dark:(text-brand-white border-brand-white) cursor-pointer">
                    <input hidden type="checkbox" />
                    <IconMdiCheck /> Faits
                  </label>
                </div>

              </div>
            </div>

            <div class="w-full md:max-w-4xl flex flex-col">
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
                      <h2 class="z-20 sticky shadow-lg shadow-brand-white dark:shadow-brand-dark md:mb-4 dark:(bg-dark-200 text-brand-light) md:rounded-full py-2 bg-brand-light text-md font-medium text-brand-primary pl-6"
                        classList={{
                          // Header is `h-18` and app state banner is `h-8`.
                          // We add `+2` padding on `md`.
                          "top-18 md:top-20": app.current_state.code === AppStateCode.Idle,
                          "top-26 md:top-28": app.current_state.code !== AppStateCode.Idle
                        }}
                      >{getDayNameFromDayNumber(day_index)}</h2>
                      <For each={homeworks()![day_index]}>
                        {(homework, homework_index) => (
                          <div style={{ "border-color": homework.subject_color }}
                            class="relative py-3 px-4 md:(ml-8 mr-4 rounded-lg mb-2) bg-brand-dark/2 dark:(bg-dark-300/40 text-brand-white) dark:hover:bg-dark-300/50 transition-colors border-l-4 flex flex-col gap-2">
                            <div class="flex justify-between items-center">
                              <h3 class="text-md font-medium dark:font-semibold">{homework.subject_name}</h3>
                              <label class="cursor-pointer flex text-xs gap-2 rounded-full border px-3 py-1 items-center"
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
                                      class="text-xs px-2 py-1 bg-brand-light text-brand-dark rounded-md dark:(border border-brand-light bg-dark-300 text-brand-light)"
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
                              <span class="md:hidden z-10 h-[2px] absolute -bottom-[1px] left-0 right-0 bg-brand-dark opacity-5 dark:(bg-dark-200 opacity-100)" />
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppHomeworks;

