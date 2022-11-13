import type { Component } from "solid-js";

import {
  type TimetableLesson,

  callUserTimetableAPI,
  getCurrentWeekNumber,
  parseTimetableLessons
} from "@/utils/client";

import app from "@/stores/app";

const AppTimetable: Component = () => {
  onMount(() => console.groupCollapsed("timetable"));
  onCleanup(() => console.groupEnd());

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  const endpoint = () => app.current_user.endpoints?.[`/user/timetable/${weekNumber()}`];

  /** Renew the timetable data when needed. */
  createEffect(on(weekNumber, async (week) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserTimetableAPI(week);
  }));

  const timetable = () => endpoint() ? parseTimetableLessons(endpoint()!.donnees.ListeCours) : null;

  return (
    <div>
      <h2>EDT de la semaine {weekNumber()} !</h2>

      <button onClick={() => setWeekNumber(prev => prev - 1)}>Avant</button>
      <button onClick={() => setWeekNumber(prev => prev + 1)}>Après</button>

      <Show keyed when={timetable()}
        fallback={
          <span>Récupération de l'emploi du temps...</span>
        }
      >
        {timetable_entries => (
          <div>
            <div class="flex">
              <For each={timetable_entries}>
                {days => (
                  <div class="flex flex-col">
                    <Index each={days}>
                      {(lesson_raw, pos) => (
                        <Switch>
                          <Match when={lesson_raw() === null}>
                            <p>Trou à {pos}</p>
                          </Match>
                          <Match keyed when={typeof lesson_raw() !== "number" && lesson_raw() as TimetableLesson}>
                            { lesson => (
                              <div class="mb-2">
                                à {lesson.date.format("HH[h]mm")}

                                <Show when={lesson.name}>
                                  <p>{lesson.name}</p>
                                </Show>
                                <Show when={lesson.teacher}>
                                  <p>{lesson.teacher}</p>
                                </Show>
                                <Show when={lesson.room}>
                                  <p>{lesson.room}</p>
                                </Show>

                              </div>
                            )}
                          </Match>
                        </Switch>
                      )}
                    </Index>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};

export default AppTimetable;

