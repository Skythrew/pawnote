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
  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);

  const windowResizeHandler = () => batch(() => {
    setWindowHeight(window.innerHeight - NAVBAR_SIZE);
    setWindowWidth(window.innerWidth);
  });

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

  const timetable = createMemo(() => endpoint() ? parseTimetableLessons(endpoint()!.donnees.ListeCours) : null);

  const item_height = () => (windowWidth() >= 768
    ? /* Screen height on wider screens */ windowHeight()
    : /* Mobile view */ 768
  ) / ((app.current_user.endpoints?.["/login/informations"].donnees.General.ListeHeures.V.length ?? 0) - 1);

  const item_width = () => windowWidth() / (timetable() ?? []).filter(entries => entries.length > 0).length
  // 20px is for the gap and the 8px is for the margins,
  - 28;

  return (
    <>
      <Title>{app.current_user.slug} - EDT - Pornote</Title>
      <div class="flex flex-col gap-2 justify-center items-center">
        <h2 class="font-medium text-xl">EDT de la semaine {weekNumber()}</h2>

        <div class="flex gap-2 items-center justify">
          <button
            class="px-4 py-1 bg-brand-light dark:bg-brand-primary rounded-full flex"
            onClick={() => setWeekNumber(prev => prev - 1)}
          >
            <IconMdiArrowLeft />
          </button>
          <button
            class="px-4 py-1 bg-brand-light dark:bg-brand-primary rounded-full flex"
            onClick={() => setWeekNumber(prev => prev + 1)}
          >
            <IconMdiArrowRight />
          </button>
        </div>

        <button onClick={() => callUserTimetableAPI(weekNumber(), { force: true })}>Actualiser</button>

        <Show keyed when={timetable()}
          fallback={
            <span>Récupération de l'emploi du temps...</span>
          }
        >
          {timetable_entries => (
            <div class="pt-4 pb-8 w-full flex flex-col justify-center items-center">
              {/**
              100% - 20px because we remove 10px at left and right.
              Then we add 20px of gap so it fits.
             */}
              <div
                style={{
                  "width": windowWidth() >= 768 ? windowWidth() - 20 + "px" : "100%"
                }}
                class="max-w-md px-4 md:max-w-none md:px-0 flex gap-[20px] justify-center">
                <For each={timetable_entries}>
                  {(lessons, day_index) => (
                    <div
                      classList={{
                        "hidden md:flex": day_index() !== dayNumber(),
                        "md:hidden": lessons.length === 0
                      }}
                      style={{
                        "width": windowWidth() >= 768 ? item_width() + "px" : "100%"
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
                        fallback={
                          <div class="w-full bg-brand-white dark:bg-dark-200 p-2">
                            <span class="block text-center font-medium">
                            Aucun cours
                            </span>
                          </div>
                        }
                      >
                        <Index each={lessons}>
                          {(lesson_raw, lesson_index) => (
                            <div class="relative">
                              <Switch>
                                <Match keyed when={lesson_raw().type === "break" && lesson_raw() as TimetableBreak}>
                                  {lesson => (
                                    <div
                                      class="bg-brand-white bg-opacity-20 dark:(bg-dark-300 bg-opacity-20) flex flex-col items-center justify-center"
                                      style={{
                                        "height": item_height() * (lesson.to - lesson.from) + "px"
                                      }}
                                    >
                                      <p class="text-brand-white text-sm text-center">
                                      Pause de {getLabelOfPosition(lesson.from)} à {getLabelOfPosition(lesson.to)}
                                      </p>
                                      <span
                                        class="text-brand-white text-opacity-80 text-xs"
                                        classList={{
                                          "hidden": (item_height() * (lesson.to - lesson.from)) <= 60
                                        }}
                                      >
                                        (Durée: {
                                          getTimeFormattedDiff(
                                            { value: getLabelOfPosition(lesson.from) as string, format: "HH[h]mm" },
                                            { value: getLabelOfPosition(lesson.to) as string, format: "HH[h]mm" },
                                            "HH[h]mm"
                                          )
                                        })
                                      </span>
                                    </div>
                                  )}
                                </Match>
                                <Match keyed when={lesson_raw().type === "lesson" && lesson_raw() as TimetableLesson}>
                                  {lesson => (
                                    <>
                                      <span class="text-brand-dark absolute z-20 -top-2.5 bg-brand-light px-4 py-0.5 text-sm rounded w-max left-0 -right-2 ml-auto">{getLabelOfPosition(lesson.position)}</span>
                                      <div
                                        style={{
                                          "border-left-color": lesson.color,
                                          "height": item_height() * lesson.duration + "px"
                                        }}
                                        class="border-l-4 border-l-brand-primary bg-brand-white dark:(bg-dark-200 text-brand-white) px-4 py-3"
                                      >
                                        <Show when={lesson?.status}>
                                          <span class="text-brand-dark absolute py-1 z-10 -top-2.5 border border-brand-light bg-brand-light font-medium px-2 -left-1 rounded text-xs w-max leading-none mr-auto">{lesson.status}</span>
                                        </Show>
                                        <h5
                                          class="whitespace-nowrap truncate font-medium"
                                        >
                                          {lesson.name}
                                        </h5>
                                        <span
                                          classList={{ "hidden": (item_height() * lesson.duration) <= 60 }}
                                          class="truncate block text-sm dark:opacity-80">{[lesson.room, lesson.teacher].filter(Boolean).join(" - ")}
                                        </span>
                                      </div>
                                      <Show when={lesson_index === lessons.length - 1}>
                                        <span class="text-brand-dark absolute -bottom-2.5 bg-brand-light px-4 py-0.5 text-sm rounded w-max left-0 -right-2 ml-auto">{getLabelOfPosition(lesson.position + lesson.duration)}</span>
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
    </>
  );
};

export default AppTimetable;

