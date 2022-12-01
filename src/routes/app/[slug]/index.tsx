import type { Accessor, Component } from "solid-js";
import type { ApiUserGrades } from "@/types/api";

import {
  type TimetableLesson,

  getTimeFormattedDiff,
  getCurrentPeriod,

  callUserGradesAPI
} from "@/utils/client";

import { PronoteApiOnglets } from "@/types/pronote";

import app from "@/stores/app";

import { unwrap } from "solid-js/store";
import { A } from "@solidjs/router";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,
  getLabelOfPosition,

  callUserHomeworksAPI,
  callUserTimetableAPI,

  parseHomeworks,
  parseTimetableLessons
} from "@/utils/client";

import dayjs from "dayjs";
import dayjsCustomParse from "dayjs/plugin/customParseFormat";
dayjs.extend(dayjsCustomParse);

const AppHome: Component = () => {
  onMount(() => console.groupCollapsed("dashboard"));
  onCleanup(() => console.groupEnd());

  const day_number = dayjs().day();
  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  /** Prevent the week number to go under the limit given by the API. */
  const sanitizeWeekNumber = (number: number) => {
    const first_week = app.current_user.endpoints?.["/login/informations"].donnees.General?.numeroPremiereSemaine;
    if (typeof first_week !== "number") {
      if (number < 0) return 0;
      return number;
    }

    if (number < first_week) return first_week;
    return number;
  };

  const sanitizeDayNumber = (number: number) => {
    if (number > 6) return 0;
    if (number < 0) return 6;

    return number;
  };

  const [homeworksDayNumber, setHomeworksDayNumber] = createSignal(day_number);
  const homeworks_endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${weekNumber()}`];
  const homeworks_full = createMemo(() => homeworks_endpoint()
    ? parseHomeworks(homeworks_endpoint()!.donnees)
    : null
  );
  const homeworks = () => homeworks_full()?.[homeworksDayNumber()]
    // Only show not done homework.
    ?.filter(homework => !homework.done);

  const [timetableDayNumber, setTimetableDayNumber] = createSignal(day_number);
  const timetable_endpoint = () => app.current_user.endpoints?.[`/user/timetable/${weekNumber()}`];
  const timetable_lessons_full = createMemo(() => timetable_endpoint()
    ? parseTimetableLessons(timetable_endpoint()!.donnees.ListeCours)
    : null
  );
  const timetable_lessons = () => timetable_lessons_full()?.[timetableDayNumber()];

  // Call to renew the APIs when the week has changed.
  createEffect(on(weekNumber, async (week) => {
    console.info(`-> Week: ${week}`);
    await callUserHomeworksAPI(week);
    await callUserTimetableAPI(week);
  }));

  // TODO: Fix typings safety (mostly ! on gradesCurrentPeriod)
  const gradesPeriods = () => app.current_user.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;
  const gradesCurrentPeriod = () => getCurrentPeriod(gradesPeriods()!);

  const grades_endpoint = () => app.current_user.endpoints?.[`/user/grades/${gradesCurrentPeriod()?.N}`];
  const grades = () => grades_endpoint()
    ? grades_endpoint()!.donnees
    : null;

  const sorted_grades = () => {
    console.info("[debug] sort grades");
    const current_grades = [...unwrap(grades()!.listeDevoirs.V)];

    // Sort the grades by the date.
    current_grades.sort(
      (a, b) => dayjs(a.date.V, "DD-MM-YYYY").isBefore(dayjs(b.date.V, "DD-MM-YYYY")) ? 1 : -1
    );

    // Keep the 5 latest grades.
    // TODO: Make this customizable?
    current_grades.splice(5);

    return current_grades;
  };

  // Call to renew the API when the user data has changed.
  createEffect(on(gradesCurrentPeriod, async () => {
    if (!gradesCurrentPeriod()) return;

    console.info(`-> Grades Period: ${gradesCurrentPeriod()!.N}`);
    await callUserGradesAPI(gradesCurrentPeriod as unknown as Accessor<ApiUserGrades["request"]["period"]>);
  }));

  return (
    <>
      <nav class="flex justify-center items-center gap-2 mt mb-8">
        <button
          class="flex"
          onClick={() => setWeekNumber(prev => sanitizeWeekNumber(--prev))}
        >
          <IconMdiArrowLeft />
        </button>
        <h2 class="text-lg font-medium">Semaine {weekNumber()}</h2>
        <button
          class="flex"
          onClick={() => setWeekNumber(prev => sanitizeWeekNumber(++prev))}
        >
          <IconMdiArrowRight />
        </button>
      </nav>

      <div class="flex flex-col items-center md:flex-row-reverse md:justify-end md:items-start gap-4 px-4 pb-8">
        <Show
          fallback={<A href="homeworks">Les devoirs n'ont pas encore été récupérés.</A>}
          when={app.current_user.slug !== null && homeworks() !== null}
        >
          <div class="flex flex-col shadow rounded-md w-full md:w-xs max-w-md text-brand-dark bg-brand-primary py-2">
            <div class="flex gap-1 justify-between items-center px-6 py-2">
              <div class="flex flex-col">
                <A href="homeworks">
                  <h4 class="font-medium text-xl text-brand-white">Devoirs non faits</h4>
                </A>

                <span class="text-sm text-brand-light">
                  {getDayNameFromDayNumber(homeworksDayNumber())}
                </span>
              </div>

              <div class="flex gap-1.5">
                <button
                  onClick={() => setHomeworksDayNumber(prev => sanitizeDayNumber(--prev))}
                  class="py-1 px-2 bg-brand-light text-brand-dark rounded-full flex"
                >
                  <IconMdiArrowLeft />
                </button>
                <button
                  onClick={() => setHomeworksDayNumber(prev => sanitizeDayNumber(++prev))}
                  class="py-1 px-2 bg-brand-light text-brand-dark rounded-full flex"
                >
                  <IconMdiArrowRight />
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 py-2 px-4">
              <Show keyed when={homeworks()} fallback={
                <div class="flex justify-center items-center gap-4 text-brand-white bg-brand-light text-sm p-2 rounded bg-opacity-20">
                  <IconMdiCheck />
                  <p>Aucun devoir pour ce jour!</p>
                </div>
              }>

                <For each={homeworks()} fallback={
                  <div class="flex justify-center items-center gap-4 text-brand-white bg-brand-light text-sm p-2 rounded bg-opacity-20">
                    <IconMdiCheck />
                    <p>Tous les devoirs ont été faits!</p>
                  </div>
                }>
                  {homework => (
                    <div class="bg-brand-white rounded py-2 px-4">
                      <h5 class="font-medium">{homework.subject_name}</h5>
                      <div innerHTML={homework.description} />
                    </div>
                  )}
                </For>
              </Show>
            </div>

          </div>
        </Show>

        <Show keyed
          fallback={<A href="timetable">L'emploi du temps n'a pas encore été récupéré.</A>}
          when={app.current_user.slug !== null && timetable_lessons()}
        >
          {lessons => (
            <div class="flex flex-col shadow rounded-md w-full md:w-xs max-w-md bg-brand-primary text-brand-dark py-2">
              <div class="flex gap-1 justify-between items-center px-6 py-2">
                <div class="flex flex-col">
                  <A href="timetable">
                    <h4 class="font-medium text-xl text-brand-white">EDT</h4>
                  </A>

                  <span class="text-sm text-brand-light">
                    {getDayNameFromDayNumber(timetableDayNumber())}
                  </span>
                </div>

                <div class="flex gap-1.5">
                  <button
                    onClick={() => setTimetableDayNumber(prev => sanitizeDayNumber(--prev))}
                    class="py-1 px-2 bg-brand-light text-brand-dark rounded-full flex"
                  >
                    <IconMdiArrowLeft />
                  </button>
                  <button
                    onClick={() => setTimetableDayNumber(prev => sanitizeDayNumber(++prev))}
                    class="py-1 px-2 bg-brand-light text-brand-dark rounded-full flex"
                  >
                    <IconMdiArrowRight />
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-3 py-2 px-4">
                <For each={lessons} fallback={
                  <div class="flex justify-center items-center gap-4 text-brand-white bg-brand-light text-sm p-2 rounded bg-opacity-20">
                    <IconMdiCheck />
                    <p>Aucun cours de la journée!</p>
                  </div>
                }>
                  {lesson_raw => (
                    <div class="relative">
                      <Switch>
                        <Match keyed when={lesson_raw.type === "break" && lesson_raw}>
                          {lesson => (
                            <div style={{
                              "height": (32 * (lesson.to - lesson.from)) + "px"
                            }}
                            class="bg-brand-white bg-opacity-20 border-2 border-brand-white flex items-center justify-center rounded m-2"
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
                        <Match keyed when={lesson_raw.type === "lesson" && lesson_raw as TimetableLesson}>
                          {lesson => (
                            <>
                              <span class="absolute -top-2 bg-brand-light px-4 py-0.5 text-sm rounded w-max left-0 -right-2 ml-auto">{getLabelOfPosition(lesson.position)}</span>
                              <Show when={lesson?.status}>
                                <span class="absolute py-1 z-10 -top-2.5 border border-brand-light bg-brand-light font-medium px-2 -left-1 rounded text-xs w-max leading-none mr-auto">{lesson.status}</span>
                              </Show>
                              <div
                                style={{
                                  "border-color": lesson.color,
                                  "height": (32 * lesson.duration) + "px"
                                }}
                                class="border-l-4 border-l-brand-primary bg-brand-white rounded py-2 px-4"
                              >
                                <h5 class="truncate font-medium text-lg">{lesson.name}</h5>
                                <span class="block text-sm">{lesson.room} - {lesson.teacher}</span>
                              </div>
                            </>
                          )}
                        </Match>
                      </Switch>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>

        <Show
          fallback={<A href="grades">Les notes n'ont pas encore été récupérées.</A>}
          when={app.current_user.slug !== null && grades()}
        >
          <div class="flex flex-col shadow rounded-md w-full md:w-xs max-w-md text-brand-dark bg-brand-primary py-2">
            <div class="flex gap-1 justify-between items-center px-6 py-2">
              <div class="flex flex-col">
                <A href="grades">
                  <h4 class="font-medium text-xl text-brand-white">Dernières notes</h4>
                </A>

                <span class="text-sm text-brand-light">
                  {gradesCurrentPeriod()?.L}
                </span>
              </div>

              <div class="flex flex-col m-0 ml-auto">
                <h4 class="text-right font-medium text-xl text-brand-white">
                  {grades()?.moyGenerale.V}
                </h4>
                <span class="text-right text-sm text-brand-light">
                Classe: {grades()?.moyGeneraleClasse.V}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2 py-2 px-4">
              <Show when={grades() && grades()!.listeDevoirs.V.length > 0} fallback={

                <div class="flex justify-center items-center gap-4 text-brand-white bg-brand-light text-sm p-2 rounded bg-opacity-20">
                  <IconMdiCheck />
                  <p>Aucune note!</p>
                </div>
              }>
                <For each={sorted_grades()}>
                  {grade => (
                    <div class="border-l-4 border-l-brand-primary bg-brand-white rounded py-2 px-4"
                      style={{
                        "border-color": grade.service.V.couleur
                      }}
                    >
                      <div class="flex justify-between gap-4">
                        <h5 class="font-medium break-all">{grade.service.V.L}</h5>
                        <h5 class="font-medium">{grade.note.V}/{grade.bareme.V}</h5>
                      </div>
                      <p class="text-xs opacity-80">Coef. {grade.coefficient} / Classe: {grade.moyenne.V}</p>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppHome;
