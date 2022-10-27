import type { Component } from "solid-js";
import type { ApiUserTimetable } from "@/types/api";

import { callAPI } from "@/utils/client";
import sessions from "@/stores/sessions";
import app from "@/stores/app";

import dayjsCustomParse from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import endpoints from "@/stores/endpoints";

dayjs.extend(dayjsCustomParse);

const AppHome: Component = () => {
  onMount(async () => {
    const user = app.current_user;
    if (!user.slug) return;

    if (!user.endpoints["/user/timetable"]) {
      const first_date_raw = user.endpoints["/login/informations"].donnees.General.PremierLundi.V;
      const first_date = dayjs(first_date_raw, "DD-MM-YYYY");
      const days_since_first = dayjs().diff(first_date, "days");
      const week_number = 1 + Math.round(days_since_first / 7);

      const timetable_response = await callAPI<ApiUserTimetable>("/user/timetable", {
        ressource: user.endpoints["/user/data"].donnees.ressource,
        session: user.session,
        week_number
      });

      await sessions.upsert(user.slug, timetable_response.session);
      await endpoints.upsert<ApiUserTimetable>(user.slug, "/user/timetable", timetable_response.received);

      app.setCurrentUser("endpoints", "/user/timetable", timetable_response.received);
    }
  });

  return (
    <div>
      <h1>EDT!</h1>
      <Show keyed when={app.current_user.slug !== null && app.current_user.endpoints["/user/timetable"]}>
        {timetable => (
          <p>Vous avez {timetable.donnees.ListeCours.length} cours cette semaine.</p>
        )}
      </Show>
    </div>
  );
};

export default AppHome;
