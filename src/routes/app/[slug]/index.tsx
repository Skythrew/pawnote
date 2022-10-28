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

    </div>
  );
};

export default AppHome;
