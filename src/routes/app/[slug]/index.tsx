import type { Component } from "solid-js";

import app from "@/stores/app";
import { A } from "@solidjs/router";

const AppHome: Component = () => {
  return (
    <div>
      <Show keyed
        fallback={<A href="timetable">L'emploi du temps n'a pas encore été récupéré.</A>}
        when={app.current_user.slug !== null && app.current_user.endpoints["/user/timetable"]}
      >
        {timetable => (
          <p>Vous avez {timetable.donnees.ListeCours.length} cours cette semaine.</p>
        )}
      </Show>

    </div>
  );
};

export default AppHome;
