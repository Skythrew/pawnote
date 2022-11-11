import type { Component } from "solid-js";
import type { ApiLoginInformations, ApiUserData } from "@/types/api";

import { A } from "solid-start";
import { appBannerMessageToString } from "@/i18n";

import app, { AppBannerMessage } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

import {
  getCurrentWeekNumber,
  getDefaultPeriodOnglet,

  callUserTimetableAPI,
  callUserHomeworksAPI,
  callUserRessourcesAPI,
  callUserGradesAPI
} from "@/utils/client";

import SessionFromScratchModal from "@/components/modals/SessionFromScratch";
import { PronoteApiOnglets } from "@/types/pronote";

const AppLayout: Component = () => {
  const navigate = useNavigate();

  const params = useParams();
  const slug = () => params.slug;

  createEffect(async () => {
    onCleanup(() => app.cleanCurrentUser());
    app.setBannerMessage({ message: AppBannerMessage.RestoringSession, is_loader: true });

    const session = await sessions.get(slug());
    if (session === null) return navigate("/link");

    const user_data = await endpoints.get<ApiUserData>(slug(), "/user/data");
    if (!user_data) return navigate("/link");

    const login_informations = await endpoints.get<ApiLoginInformations>(slug(), "/login/informations");
    if (!login_informations) return navigate("/link");

    app.setCurrentUser({
      slug: slug(),
      session,
      endpoints: {
        "/login/informations": login_informations.data,
        "/user/data": user_data.data
      }
    });

    const week_number = getCurrentWeekNumber();
    const grades_period = () => getDefaultPeriodOnglet(PronoteApiOnglets.Grades);

    // Just calling them will save into global store.
    await callUserTimetableAPI(week_number);
    await callUserHomeworksAPI(week_number);
    await callUserRessourcesAPI(week_number);
    await callUserGradesAPI(grades_period);

    app.setBannerToIdle();
  });

  return (
    <>
      <Title>{slug()} - Pornote</Title>
      <Show when={app.current_user.slug} fallback={
        <p>Récupération des données, veuillez patienter.</p>
      }>
        <header class="fixed z-20 top-0 right-0 left-0 flex flex-col shadow-md">
          <nav class="flex justify-between items-center px-4 h-18 bg-brand-primary">
            <A href={`/app/${app.current_user.slug}`}>
              <div class="flex flex-col">
                <h1 class="font-semibold text-lg text-brand-white">
                  {app.current_user.endpoints?.["/user/data"].donnees.ressource.L}
                </h1>
                <div class="flex items-center gap-2">
                  <span class="text-brand-light text-md font-medium">
                    {app.current_user.endpoints?.["/user/data"].donnees.ressource.Etablissement.V.L}
                  </span>
                  <span class="text-brand-light text-xs">
                    {app.current_user.endpoints?.["/user/data"].donnees.ressource.classeDEleve.L}
                  </span>
                </div>
              </div>
            </A>

          </nav>
          <Show when={app.banner_message.message !== AppBannerMessage.Idle}>
            <div class="flex items-center justify-center px-2 h-8">
              <p class="text-center">{appBannerMessageToString(app.banner_message.message)}</p>
            </div>
          </Show>
        </header>

        <main class="mt-26 pt-4">
          <Outlet />
        </main>

        <SessionFromScratchModal
          pronote_url={app.current_user.session?.instance.pronote_url as string}
          ent_url={app.current_user.session?.instance.ent_url ?? undefined}
        />
      </Show>
    </>
  );
};

export default AppLayout;
