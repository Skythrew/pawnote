import type { Component } from "solid-js";
import type { ApiUserTimetable } from "@/types/api";

import { callAPI } from "@/utils/client";
import app from "@/stores/app";

import dayjsCustomParse from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";

dayjs.extend(dayjsCustomParse);

const AppHome: Component = () => {
  onMount(async () => {
    const user = app.current_user;
    if (!user.loaded) return;

    const first_date_raw = user.endpoints["/login/informations"].donnees.General.PremiereDate.V;
    const first_date = dayjs(first_date_raw, "DD-MM-YYYY");
    const days_since_first = dayjs().diff(first_date, "days");

    const week_number = Math.floor(1 + days_since_first / 7);
    console.log(week_number);

    const timetable_response = await callAPI<ApiUserTimetable>("/user/timetable", {
      ressource: user.endpoints["/user/data"].donnees.ressource,
      session: user.session,
      week_number
    });


  });

  return (
    <div>
      <h1>EDT!</h1>
    </div>
  );
};

export default AppHome;
