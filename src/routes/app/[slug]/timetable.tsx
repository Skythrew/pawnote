import type { Component } from "solid-js";

import {
  type TimetableLesson,
  type TimetableBreak,

  getCurrentWeekNumber,
  getLabelOfPosition,
  getTimeFormattedDiff,

  callUserTimetableAPI,
  parseTimetableLessons,
  getDayNameFromDayNumber
} from "@/utils/client";

import app from "@/stores/app";
import dayjs from "dayjs";

const AppTimetable: Component = () => {
  const NAVBAR_SIZE = 72;
  const [windowHeight, setWindowHeight] = createSignal(window.innerHeight - NAVBAR_SIZE);
  const windowResizeHandler = () => setWindowHeight(window.innerHeight - NAVBAR_SIZE);

  onMount(() => {
    console.groupCollapsed("timetable");
    window.addEventListener("resize", windowResizeHandler);
  });

  onCleanup(() => {
    console.groupEnd();
    window.removeEventListener("resize", windowResizeHandler);
  });

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());
  const [dayNumber, setDayNumber] = createSignal(dayjs().day());

  const sanitizeDayNumber = (number: number) => {
    if (number < 0) return 6;
    if (number > 6) return 0;
    return number;
  };

  const endpoint = () => app.current_user.endpoints?.[`/user/timetable/${weekNumber()}`];

  /** Renew the timetable data when needed. */
  createEffect(on(weekNumber, async (week) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserTimetableAPI(week);
  }));

  const timetable = () => endpoint() ? parseTimetableLessons(endpoint()!.donnees.ListeCours) : null;

  const item_height = () => windowHeight() / ((app.current_user.endpoints?.["/login/informations"].donnees.General.ListeHeures.V.length ?? 0) - 1);

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
          <div class="pt-2 pb-8 w-full flex flex-col justify-center items-center">
            <div class="flex gap-6">
              <For each={timetable_entries}>
                {(lessons, day_index) => (
                  <div
                    classList={{
                      "hidden md:flex": day_index() !== dayNumber(),
                      "md:hidden": lessons.length === 0
                    }}
                    class="flex flex-col pb-6 bg-brand-primary rounded-md"
                  >
                    <div class="px-4 flex justify-between items-center gap-4 py-4">
                      <button
                        onClick={() => setDayNumber(prev => sanitizeDayNumber(--prev))}
                        class="md:hidden flex px-2 py-1 rounded-full text-brand-light"
                      >
                        <IconMdiArrowLeft />
                      </button>
                      <h3 class="font-medium text-xl text-brand-light">{getDayNameFromDayNumber(day_index())}</h3>
                      <button
                        onClick={() => setDayNumber(prev => sanitizeDayNumber(++prev))}
                        class="md:hidden flex px-2 py-1 rounded-full text-brand-light"
                      >
                        <IconMdiArrowRight />
                      </button>
                    </div>

                    <Show when={lessons.length > 0}
                      fallback={<p>Aucun cours.</p>}
                    >
                      <Index each={lessons}>
                        {(lesson_raw, lesson_index) => (
                          <div class="relative w-full">
                            <Switch>
                              <Match keyed when={lesson_raw().type === "break" && lesson_raw() as TimetableBreak}>
                                {lesson => (
                                  <div
                                    class="bg-brand-white bg-opacity-20 flex items-center justify-center"
                                    style={{
                                      "height": item_height() * (lesson.to - lesson.from) + "px"
                                    }}
                                  >
                                    <p class="text-brand-white text-sm text-center">Pause de {getLabelOfPosition(lesson.from)} à {getLabelOfPosition(lesson.to)} ({
                                      getTimeFormattedDiff(
                                        { value: getLabelOfPosition(lesson.from) as string, format: "HH[h]mm" },
                                        { value: getLabelOfPosition(lesson.to) as string, format: "HH[h]mm" },
                                        "HH[h]mm"
                                      )
                                    })
                                    </p>
                                  </div>
                                )}
                              </Match>
                              <Match keyed when={lesson_raw().type === "lesson" && lesson_raw() as TimetableLesson}>
                                {lesson => (
                                  <>
                                    <span class="absolute z-10 -top-2.5 bg-brand-light px-4 py-0.5 text-sm rounded w-max left-0 -right-2 ml-auto">{getLabelOfPosition(lesson.position)}</span>
                                    <div
                                      style={{
                                        "border-left-color": lesson.color,
                                        "height": item_height() * lesson.duration + "px"
                                      }}
                                      class="border-l-4 border-l-brand-primary bg-brand-white px-4 py-2.5"
                                    >
                                      <h5 class="font-medium">{lesson.name}</h5>
                                      <span class="block text-sm">{lesson.room} - {lesson.teacher}</span>
                                    </div>
                                    <Show when={lesson_index === lessons.length - 1}>
                                      <span class="absolute -bottom-2.5 bg-brand-light px-4 py-0.5 text-sm rounded w-max left-0 -right-2 ml-auto">{getLabelOfPosition(lesson.position + lesson.duration)}</span>
                                    </Show>
                                  </>
                                )}
                              </Match>
                            </Switch>
                          </div>
                        )}
                      </Index>
                    </Show>
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

