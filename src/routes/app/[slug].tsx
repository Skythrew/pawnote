import type { Component } from "solid-js";
import type { ApiLoginInformations, ApiUserData, ApiUserTimetable } from "@/types/api";

import { A } from "solid-start";
import { appBannerMessageToString } from "@/i18n";

import app, { AppBannerMessage } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

const AppSlugLayout: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const slug = () => params.slug;

  createEffect(async () => {
    console.info("[[slug].tsx] new effect");
    onCleanup(() => app.cleanCurrentUser());

    const session = await sessions.get(slug());
    if (session === null) return navigate("/link");

    const user_data = await endpoints.get<ApiUserData>(slug(), "/user/data");
    if (!user_data) return navigate("/link");

    const login_informations = await endpoints.get<ApiLoginInformations>(slug(), "/login/informations");
    if (!login_informations) return navigate("/link");

    const user_timetable = await endpoints.get<ApiUserTimetable>(slug(), "/user/timetable");

    app.setCurrentUser({
      slug: slug(),
      session,
      endpoints: {
        "/login/informations": login_informations,
        "/user/data": user_data,

        // Not required endpoints.
        "/user/timetable": user_timetable ?? undefined
      }
    });
  });

  return (
    <>
      <Title>{slug()} - Pornote</Title>
      <Show keyed when={app.current_user.slug !== null && app.current_user}>
        {user => (
          <>
            <header class="fixed top-0 right-0 left-0 flex flex-col shadow">
              <nav class="flex justify-between items-center px-4 h-18 bg-brand-primary">
                <A href="/">
                  <div class="flex flex-col">
                    <h1 class="font-semibold text-lg text-brand-white">
                      {user.endpoints["/user/data"].donnees.ressource.L}
                    </h1>
                    <div class="flex items-center gap-2">
                      <span class="text-brand-light text-md font-medium">
                        {user.endpoints["/user/data"].donnees.listeInformationsEtablissements.V[0].L}
                      </span>
                      <span class="text-brand-light text-xs">
                        {user.endpoints["/user/data"].donnees.ressource.classeDEleve.L}
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
          </>
        )}
      </Show>
    </>
  );
};

export default AppSlugLayout;
