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
            class="bg-brand-light rounded-full flex py-1 px-4 dark:bg-brand-primary"
            onClick={() => setWeekNumber(prev => prev - 1)}
          >
            <IconMdiArrowLeft />
          </button>
          <button
            class="bg-brand-light rounded-full flex py-1 px-4 dark:bg-brand-primary"
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
            <div class="flex flex-col w-full pt-4 pb-8 justify-center items-center">
              {/**
              100% - 20px because we remove 10px at left and right.
              Then we add 20px of gap so it fits.
             */}
              <div
                style={{
                  "width": windowWidth() >= 768 ? windowWidth() - 20 + "px" : "100%"
                }}
                class="flex max-w-md px-4 gap-[20px] justify-center md:max-w-none md:px-0">
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
                      class="bg-brand-primary rounded-md flex flex-col pb-6"
                    >
                      <div class="flex py-4 px-4 gap-4 justify-between items-center">
                        <button
                          onClick={() => setDayNumber(prev => sanitizeDayNumber(--prev))}
                          class="rounded-full flex text-brand-light py-1 px-2 md:hidden"
                        >
                          <IconMdiArrowLeft />
                        </button>
                        <h3 class="font-medium text-xl text-brand-light">{getDayNameFromDayNumber(day_index())}</h3>
                        <button
                          onClick={() => setDayNumber(prev => sanitizeDayNumber(++prev))}
                          class="rounded-full flex text-brand-light py-1 px-2 md:hidden"
                        >
                          <IconMdiArrowRight />
                        </button>
                      </div>

                      <Show when={lessons.length > 0}
                        fallback={
                          <div class="bg-brand-white w-full p-2 dark:bg-dark-200">
                            <span class="font-medium text-center block">
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
                                      class="bg-brand-white flex flex-col bg-opacity-20 items-center justify-center dark:(bg-dark-300 bg-opacity-20) "
                                      style={{
                                        "height": item_height() * (lesson.to - lesson.from) + "px"
                                      }}
                                    >
                                      <p class="text-brand-white text-sm text-center">
                                      Pause de {getLabelOfPosition(lesson.from)} à {getLabelOfPosition(lesson.to)}
                                      </p>
                                      <span
                                        class="text-brand-white text-xs text-opacity-80"
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
                                      <span class="bg-brand-light rounded ml-auto text-brand-dark text-sm w-max py-0.5 px-4 -top-2.5 -right-2 left-0 z-20 absolute">{getLabelOfPosition(lesson.position)}</span>
                                      <div
                                        style={{
                                          "border-left-color": lesson.color,
                                          "height": item_height() * lesson.duration + "px"
                                        }}
                                        class="bg-brand-white border-l-brand-primary border-l-4 py-3 px-4 dark:(bg-dark-200 text-brand-white) "
                                      >
                                        <Show when={lesson?.status}>
                                          <span class="bg-brand-light border border-brand-light rounded font-medium mr-auto text-brand-dark text-xs leading-none w-max py-1 px-2 -top-2.5 -left-1 z-10 absolute">{lesson.status}</span>
                                        </Show>
                                        <h5
                                          class="font-medium whitespace-nowrap truncate"
                                        >
                                          {lesson.name}
                                        </h5>
                                        <span
                                          classList={{ "hidden": (item_height() * lesson.duration) <= 60 }}
                                          class="text-sm truncate block dark:opacity-80">{[lesson.room, lesson.teacher].filter(Boolean).join(" - ")}
                                        </span>
                                      </div>
                                      <Show when={lesson_index === lessons.length - 1}>
                                        <span class="bg-brand-light rounded ml-auto text-brand-dark text-sm w-max py-0.5 px-4 -right-2 -bottom-2.5 left-0 absolute">{getLabelOfPosition(lesson.position + lesson.duration)}</span>
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

