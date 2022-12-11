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
      <nav class="flex mt mb-8 gap-2 justify-center items-center">
        <button
          class="flex"
          onClick={() => setWeekNumber(prev => sanitizeWeekNumber(--prev))}
        >
          <IconMdiArrowLeft />
        </button>
        <h2 class="font-medium text-lg">Semaine {weekNumber()}</h2>
        <button
          class="flex"
          onClick={() => setWeekNumber(prev => sanitizeWeekNumber(++prev))}
        >
          <IconMdiArrowRight />
        </button>
      </nav>

      <div class="flex flex-col px-4 pb-8 gap-4 items-center md:flex-row-reverse md:justify-end md:items-start">
        <Show
          fallback={<A href="homeworks">Les devoirs n'ont pas encore été récupérés.</A>}
          when={app.current_user.slug !== null && homeworks_full() !== null}
        >
          <div class="bg-brand-primary rounded-md flex flex-col max-w-md shadow text-brand-dark w-full py-2 md:w-xs">
            <div class="flex py-2 px-6 gap-1 justify-between items-center">
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
                  class="bg-brand-light rounded-full flex text-brand-dark py-1 px-2"
                >
                  <IconMdiArrowLeft />
                </button>
                <button
                  onClick={() => setHomeworksDayNumber(prev => sanitizeDayNumber(++prev))}
                  class="bg-brand-light rounded-full flex text-brand-dark py-1 px-2"
                >
                  <IconMdiArrowRight />
                </button>
              </div>
            </div>

            <div class="flex flex-col py-2 px-4 gap-2">
              <Show keyed when={homeworks()} fallback={
                <div class="bg-brand-light rounded flex bg-opacity-20 text-brand-white text-sm p-2 gap-4 justify-center items-center">
                  <IconMdiCheck />
                  <p>Aucun devoir pour ce jour!</p>
                </div>
              }>

                <For each={homeworks()} fallback={
                  <div class="bg-brand-light rounded flex bg-opacity-20 text-brand-white text-sm p-2 gap-4 justify-center items-center">
                    <IconMdiCheck />
                    <p>Tous les devoirs ont été faits!</p>
                  </div>
                }>
                  {homework => (
                    <div class="bg-brand-white rounded py-2 px-4">
                      <div class="flex justify-between items-center">
                        <h5 class="font-medium text-md">{homework.subject_name}</h5>
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

                      <div class="p-2 break-all" innerHTML={homework.description} />
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
            <div class="bg-brand-primary rounded-md flex flex-col max-w-md shadow text-brand-dark w-full py-2 md:w-xs">
              <div class="flex py-2 px-6 gap-1 justify-between items-center">
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
                    class="bg-brand-light rounded-full flex text-brand-dark py-1 px-2"
                  >
                    <IconMdiArrowLeft />
                  </button>
                  <button
                    onClick={() => setTimetableDayNumber(prev => sanitizeDayNumber(++prev))}
                    class="bg-brand-light rounded-full flex text-brand-dark py-1 px-2"
                  >
                    <IconMdiArrowRight />
                  </button>
                </div>
              </div>

              <div class="flex flex-col py-2 px-4 gap-3">
                <For each={lessons} fallback={
                  <div class="bg-brand-light rounded flex bg-opacity-20 text-brand-white text-sm p-2 gap-4 justify-center items-center">
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
                            class="bg-brand-white border-brand-white rounded flex bg-opacity-20 border-2 m-2 items-center justify-center"
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
                              <span class="bg-brand-light rounded ml-auto text-sm w-max py-0.5 px-4 -top-2 -right-2 left-0 absolute">{getLabelOfPosition(lesson.position)}</span>
                              <Show when={lesson?.status}>
                                <span class="bg-brand-light border border-brand-light rounded font-medium mr-auto text-xs leading-none w-max py-1 px-2 -top-2.5 -left-1 z-10 absolute">{lesson.status}</span>
                              </Show>
                              <div
                                style={{
                                  "border-color": lesson.color,
                                  "height": (32 * lesson.duration) + "px"
                                }}
                                class="bg-brand-white border-l-brand-primary rounded border-l-4 py-2 px-4"
                              >
                                <h5 class="font-medium text-lg truncate">{lesson.name}</h5>
                                <span class="text-sm block">{[lesson.room, lesson.teacher].filter(Boolean).join(" - ")}</span>
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
          <div class="bg-brand-primary rounded-md flex flex-col max-w-md shadow text-brand-dark w-full py-2 md:w-xs">
            <div class="flex py-2 px-6 gap-1 justify-between items-center">
              <div class="flex flex-col">
                <A href="grades">
                  <h4 class="font-medium text-xl text-brand-white">Dernières notes</h4>
                </A>

                <span class="text-sm text-brand-light">
                  {gradesCurrentPeriod()?.L}
                </span>
              </div>

              <div class="flex flex-col ml-auto m-0">
                <h4 class="font-medium text-right text-xl text-brand-white">
                  {grades_endpoint()!.donnees?.moyGenerale.V}
                </h4>
                <span class="text-right text-sm text-brand-light">
                Classe: {grades_endpoint()!.donnees?.moyGeneraleClasse.V}
                </span>
              </div>
            </div>

            <div class="flex flex-col py-2 px-4 gap-2">
              <Show when={grades() && grades_endpoint()!.donnees.listeDevoirs.V.length > 0} fallback={

                <div class="bg-brand-light rounded flex bg-opacity-20 text-brand-white text-sm p-2 gap-4 justify-center items-center">
                  <IconMdiCheck />
                  <p>Aucune note !</p>
                </div>
              }>
                <For each={sorted_grades()}>
                  {grade => (
                    <div
                      class="bg-brand-white border-l-brand-primary rounded border-l-4 py-2 px-4"
                      style={{
                        "border-color": grade.subject_color
                      }}
                    >
                      <div class="flex gap-4 justify-between">
                        <h5 class="font-medium break-all">{grade.subject_name}</h5>
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
