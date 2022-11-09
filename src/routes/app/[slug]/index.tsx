import type { Component } from "solid-js";
import { PronoteApiOnglets } from "@/types/pronote";

import app from "@/stores/app";
import { A } from "@solidjs/router";

import {
  getCurrentWeekNumber,
  getDayNameFromDayNumber,
  getDefaultPeriodOnglet,

  parseHomeworks
} from "@/utils/client";

const AppHome: Component = () => {
  const week_number = getCurrentWeekNumber();
  const period_grades = getDefaultPeriodOnglet(PronoteApiOnglets.Grades);

  const homeworks_endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${week_number}`];
  const homeworks = () => homeworks_endpoint()
    ? parseHomeworks(homeworks_endpoint()!.donnees)
    : null;

  return (
    <div class="flex flex-col gap-4 px-4">
      <Show keyed
        fallback={<A href="timetable">L'emploi du temps n'a pas encore été récupéré.</A>}
        when={app.current_user.slug !== null && app.current_user.endpoints[`/user/timetable/${week_number}`]}
      >
        {timetable => (
          <A href="timetable">Vous avez {timetable.donnees.ListeCours.length} cours cette semaine.</A>
        )}
      </Show>

      <Show keyed
        fallback={<A href="homeworks">Les devoirs n'ont pas encore été récupérés.</A>}
        when={app.current_user.slug !== null && homeworks()}
      >
        {homeworks => (
          <>
            <A href="homeworks">Voir les devoirs de cette semaine.</A>
            <For each={Object.keys(homeworks)}>
              {day_number => (
                <h4>{getDayNameFromDayNumber(day_number)}</h4>
              )}
            </For>
          </>
        )}
      </Show>

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
      </Show>
    </div>
  );
};

export default AppHome;
