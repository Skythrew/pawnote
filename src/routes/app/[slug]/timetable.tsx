import type { Component } from "solid-js";

import {
  callUserTimetableAPI,
  getCurrentWeekNumber,
  TimetableLesson,
  parseTimetableLessons
} from "@/utils/client";

import { ApiUserTimetable } from "@/types/api";

const AppTimetable: Component = () => {
  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());
  const [weekTimetable, setWeekTimetable] = createSignal<ApiUserTimetable["response"]["received"] | null>(null);

  /**
   * Reload the timetable depending
   * on the week number.
   */
  createEffect(on(weekNumber, async (week_number) => {
    const data = await callUserTimetableAPI(week_number);
    setWeekTimetable(data);
  }));

  return (
    <div>
      <h2>EDT de la semaine {weekNumber()} !</h2>

      <button onClick={() => setWeekNumber(prev => prev - 1)}>Avant</button>
      <button onClick={() => setWeekNumber(prev => prev + 1)}>Après</button>

      <Show keyed when={weekTimetable()}
        fallback={
          <span>Récupération de l'emploi du temps...</span>
        }
      >
        {timetable => (
          <div>
            <p>Vous avez {timetable.donnees.ListeCours.length} cours cette semaine.</p>

            <div class="flex">
              <For each={parseTimetableLessons(timetable.donnees.ListeCours)}>
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
