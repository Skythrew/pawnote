import type { Component } from "solid-js";

import app from "@/stores/app";
import { A } from "@solidjs/router";
import { getCurrentWeekNumber } from "@/utils/client";

const AppHome: Component = () => {
  const week_number = getCurrentWeekNumber();

  return (
    <div>
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
        when={app.current_user.slug !== null && app.current_user.endpoints[`/user/homeworks/${week_number}`]}
      >
        {homeworks => (
          <A href="homeworks">Vous avez {homeworks.donnees.ListeTravauxAFaire.V.length} devoirs cette semaine.</A>
        )}
      </Show>

      <Show
        fallback={<A href="ressources">Les ressources pédagogiques n'ont pas encore été récupérés.</A>}
        when={app.current_user.slug !== null && app.current_user.endpoints[`/user/ressources/${week_number}`]}
      >
        <A href="ressources">Voir les ressources pédagogiques de cette semaine.</A>
      </Show>
    </div>
  );
};

export default AppHome;
