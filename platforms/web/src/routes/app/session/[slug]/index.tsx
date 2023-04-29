import type { Accessor, Component } from "solid-js";
import { A } from "@solidjs/router";

import type { ApiUserGrades } from "@/types/api";
import { PronoteApiOnglets } from "@/types/pronote";

import app from "@/stores/app";

import {
  type TimetableLesson,

  getDayNameFromDayNumber,
  getCurrentWeekNumber,
  getTimeFormattedDiff,
  getLabelOfPosition,
  getCurrentPeriod,

  callUserGradesAPI,
  callUserHomeworksAPI,
  callUserTimetableAPI,
  callUserHomeworkDoneAPI,

  parseGrades,
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
  createEffect(on([weekNumber, () => app.current_user.session], async () => {
    console.info(`-> Week: ${weekNumber()}`);
    await callUserHomeworksAPI(weekNumber());
    await callUserTimetableAPI(weekNumber());
  }));

  // TODO: Fix typings safety (mostly ! on gradesCurrentPeriod)
  const gradesPeriods = () => app.current_user.endpoints?.["/user/data"].donnees.ressource.listeOngletsPourPeriodes.V.find(
    onglet => onglet.G === PronoteApiOnglets.Grades
  )?.listePeriodes.V;
  const gradesCurrentPeriod = () => getCurrentPeriod(gradesPeriods()!);

  const grades_endpoint = () => app.current_user.endpoints?.[`/user/grades/${gradesCurrentPeriod()?.N}`];
  const grades = createMemo(() => grades_endpoint()
    ? parseGrades(grades_endpoint()!.donnees.listeDevoirs.V)
    : null
  );

  const sorted_grades = () => {
    if (!grades()) return null;

    console.info("[debug] sort grades");
    const current_grades = [...grades()!];

    // Sort the grades by the date.
    current_grades.sort(
      (a, b) => a.date.isBefore(b.date) ? 1 : -1
    );

    // TODO: Make this customizable?
    current_grades.splice(5);
    return current_grades;
  };

  // Call to renew the API when the user data has changed.
  createEffect(on([gradesCurrentPeriod, () => app.current_user.session], async () => {
    if (!gradesCurrentPeriod()) return;

    console.info(`-> Grades Period: ${gradesCurrentPeriod()!.N}`);
    await callUserGradesAPI(gradesCurrentPeriod as unknown as Accessor<ApiUserGrades["request"]["period"]>);
  }));

  return (
    <>
      <nav class="mb-8 mt flex items-center justify-center gap-2">
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

      <div class="flex flex-col items-center gap-4 px-4 pb-8 md:flex-row-reverse md:items-start md:justify-end">
        <Show
          fallback={<A href="homeworks">Les devoirs n'ont pas encore été récupérés.</A>}
          when={app.current_user.slug !== null && homeworks_full() !== null}
        >
          <div class="bg-brand-primary text-brand-dark max-w-md w-full flex flex-col rounded-md py-2 shadow md:w-xs">
            <div class="flex items-center justify-between gap-1 px-6 py-2">
              <div class="flex flex-col">
                <A href="homeworks">
                  <h4 class="text-brand-white text-xl font-medium">Devoirs non faits</h4>
                </A>

                <span class="text-brand-light text-sm">
                  {getDayNameFromDayNumber(homeworksDayNumber())}
                </span>
              </div>

              <div class="flex gap-1.5">
                <button
                  onClick={() => setHomeworksDayNumber(prev => sanitizeDayNumber(--prev))}
                  class="bg-brand-light text-brand-dark flex rounded-full px-2 py-1"
                >
                  <IconMdiArrowLeft />
                </button>
                <button
                  onClick={() => setHomeworksDayNumber(prev => sanitizeDayNumber(++prev))}
                  class="bg-brand-light text-brand-dark flex rounded-full px-2 py-1"
                >
                  <IconMdiArrowRight />
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 px-4 py-2">
              <Show keyed when={homeworks()} fallback={
                <div class="bg-brand-light text-brand-white flex items-center justify-center gap-4 rounded bg-opacity-20 p-2 text-sm">
                  <IconMdiCheck />
                  <p>Aucun devoir pour ce jour!</p>
                </div>
              }>

                <For each={homeworks()} fallback={
                  <div class="bg-brand-light text-brand-white flex items-center justify-center gap-4 rounded bg-opacity-20 p-2 text-sm">
                    <IconMdiCheck />
                    <p>Tous les devoirs ont été faits!</p>
                  </div>
                }>
                  {homework => (
                    <div class="bg-brand-white rounded px-4 py-2">
                      <div class="flex items-center justify-between">
                        <h5 class="text-md font-medium">{homework.subject_name}</h5>
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

                      <div class="break-all p-2" innerHTML={homework.description} />
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
            <div class="bg-brand-primary text-brand-dark max-w-md w-full flex flex-col rounded-md py-2 shadow md:w-xs">
              <div class="flex items-center justify-between gap-1 px-6 py-2">
                <div class="flex flex-col">
                  <A href="timetable">
                    <h4 class="text-brand-white text-xl font-medium">EDT</h4>
                  </A>

                  <span class="text-brand-light text-sm">
                    {getDayNameFromDayNumber(timetableDayNumber())}
                  </span>
                </div>

                <div class="flex gap-1.5">
                  <button
                    onClick={() => setTimetableDayNumber(prev => sanitizeDayNumber(--prev))}
                    class="bg-brand-light text-brand-dark flex rounded-full px-2 py-1"
                  >
                    <IconMdiArrowLeft />
                  </button>
                  <button
                    onClick={() => setTimetableDayNumber(prev => sanitizeDayNumber(++prev))}
                    class="bg-brand-light text-brand-dark flex rounded-full px-2 py-1"
                  >
                    <IconMdiArrowRight />
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-3 px-4 py-2">
                <For each={lessons} fallback={
                  <div class="bg-brand-light text-brand-white flex items-center justify-center gap-4 rounded bg-opacity-20 p-2 text-sm">
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
                            class="bg-brand-white border-brand-white m-2 flex items-center justify-center border-2 rounded bg-opacity-20"
                            >
                              <p class="text-brand-white text-center text-sm">Pause de {getLabelOfPosition(lesson.from)} à {getLabelOfPosition(lesson.to)} ({
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
                              <span class="bg-brand-light absolute left-0 ml-auto w-max rounded px-4 py-0.5 text-sm -right-2 -top-2">{getLabelOfPosition(lesson.position)}</span>
                              <Show when={lesson?.status}>
                                <span class="bg-brand-light border-brand-light absolute z-10 mr-auto w-max border rounded px-2 py-1 text-xs font-medium leading-none -left-1 -top-2.5">{lesson.status}</span>
                              </Show>
                              <div
                                style={{
                                  "border-color": lesson.color,
                                  "height": (32 * lesson.duration) + "px"
                                }}
                                class="bg-brand-white border-l-brand-primary border-l-4 rounded px-4 py-2"
                              >
                                <h5 class="truncate text-lg font-medium">{lesson.name}</h5>
                                <span class="block text-sm">{[lesson.room, lesson.teacher].filter(Boolean).join(" - ")}</span>
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
          <div class="bg-brand-primary text-brand-dark max-w-md w-full flex flex-col rounded-md py-2 shadow md:w-xs">
            <div class="flex items-center justify-between gap-1 px-6 py-2">
              <div class="flex flex-col">
                <A href="grades">
                  <h4 class="text-brand-white text-xl font-medium">Dernières notes</h4>
                </A>

                <span class="text-brand-light text-sm">
                  {gradesCurrentPeriod()?.L}
                </span>
              </div>

              <div class="m-0 ml-auto flex flex-col">
                <h4 class="text-brand-white text-right text-xl font-medium">
                  {grades_endpoint()!.donnees?.moyGenerale.V}
                </h4>
                <span class="text-brand-light text-right text-sm">
                Classe: {grades_endpoint()!.donnees?.moyGeneraleClasse.V}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2 px-4 py-2">
              <Show when={grades() && grades_endpoint()!.donnees.listeDevoirs.V.length > 0} fallback={

                <div class="bg-brand-light text-brand-white flex items-center justify-center gap-4 rounded bg-opacity-20 p-2 text-sm">
                  <IconMdiCheck />
                  <p>Aucune note !</p>
                </div>
              }>
                <For each={sorted_grades()}>
                  {grade => (
                    <div
                      class="bg-brand-white border-l-brand-primary border-l-4 rounded px-4 py-2"
                      style={{
                        "border-color": grade.subject_color
                      }}
                    >
                      <div class="flex justify-between gap-4">
                        <h5 class="break-all font-medium">{grade.subject_name}</h5>
                        <h5 class="font-medium">{typeof grade.user === "string"
                          ? grade.user
                          : <>{grade.user}/{grade.maximum}</>
                        }</h5>
                      </div>
                      <p class="text-xs opacity-80">Coef. {grade.ratio} / Classe: {grade.average}</p>
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
