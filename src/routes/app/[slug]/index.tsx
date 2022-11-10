import type { Component } from "solid-js";
import { PronoteApiOnglets } from "@/types/pronote";

import app from "@/stores/app";
import { A } from "@solidjs/router";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,
  getDefaultPeriodOnglet,

  parseHomeworks,
  parseTimetableLessons
} from "@/utils/client";

import dayjs from "dayjs";

const AppHome: Component = () => {
  const day_number = dayjs().day();
  const week_number = getCurrentWeekNumber();
  const period_grades = getDefaultPeriodOnglet(PronoteApiOnglets.Grades);

  const sanitizeDayNumber = (number: number) => {
    if (number < 0) return 6;
    if (number > 6) return 0;
    return number;
  };

  const [homeworksDayNumber, setHomeworksDayNumber] = createSignal(day_number);
  const homeworks_endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${week_number}`];
  const homeworks = () => homeworks_endpoint()
    ? parseHomeworks(homeworks_endpoint()!.donnees)[homeworksDayNumber()]
      // Only show not done homework.
      ?.filter(homework => !homework.done)
    : null;

  const [timetableDayNumber, setTimetableDayNumber] = createSignal(day_number);
  const timetable_endpoint = () => app.current_user.endpoints?.[`/user/timetable/${week_number}`];
  const timetable_lessons = () => timetable_endpoint()
    ? parseTimetableLessons(timetable_endpoint()!.donnees.ListeCours)[timetableDayNumber()]
    : null;

  return (
    <div class="flex flex-col items-center md:flex-row-reverse md:justify-end md:items-start gap-4 px-4 pb-8">
      <Show
        fallback={<A href="homeworks">Les devoirs n'ont pas encore été récupérés.</A>}
        when={app.current_user.slug !== null && homeworks() !== null}
      >
        <div class="flex flex-col shadow rounded-md w-full md:w-xs max-w-md bg-brand-primary py-2">
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
          <div class="flex flex-col shadow rounded-md w-full md:w-xs max-w-md bg-brand-primary py-2">
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


            <div class="flex flex-col gap-2 py-2 px-4">
              <For each={lessons} fallback={
                <div class="flex justify-center items-center gap-4 text-brand-white bg-brand-light text-sm p-2 rounded bg-opacity-20">
                  <IconMdiCheck />
                  <p>Aucun cours de la journée!</p>
                </div>
              }>
                {lesson_raw => (
                  <Show keyed when={lesson_raw}>
                    {lesson => (
                      <div
                        style={{
                          "border-color": lesson.color,
                          "height": (32 * lesson.duration) + "px"
                        }}
                        class="border-l-4 border-l-brand-primary bg-brand-white rounded py-2 px-4"
                      >
                        <h5 class="font-medium text-lg">{lesson.name}</h5>
                        <span class="block text-sm">{lesson.room} - {lesson.teacher}</span>
                      </div>
                    )}
                  </Show>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>

      {/*
      <Show
        fallback={<A href="ressources">Les ressources pédagogiques n'ont pas encore été récupérées.</A>}
        when={app.current_user.slug !== null && app.current_user.endpoints[`/user/ressources/${week_number}`]}
      >
        <A href="ressources">Voir les ressources pédagogiques de cette semaine.</A>
      </Show>

      <Show
        fallback={<A href="grades">Les notes n'ont pas encore été récupérées.</A>}
        when={app.current_user.slug !== null && app.current_user.endpoints[`/user/grades/${period_grades.N}`]}
      >
        <A href="grades">Voir les notes du {period_grades.L}.</A>
      </Show>*/}
    </div>
  );
};

export default AppHome;
