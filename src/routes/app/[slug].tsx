import type { Component } from "solid-js";
import type { ApiUserData } from "@/types/api";

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
    onCleanup(() => app.cleanCurrentUser());

    const session = await sessions.get(slug());
    if (!session) return navigate("/link");

    const user_data = await endpoints.get<ApiUserData>(slug(), "/user/data");
    if (!user_data) return navigate("/link");

    app.setCurrentUser({
      loaded: true,
      session,
      endpoints: {
        "/user/data": user_data
      }
    });
  });

  return (
    <Show keyed when={app.current_user.loaded && app.current_user.endpoints}>
      {endpoints => (
        <>
          <header class="fixed top-0 right-0 left-0 flex flex-col shadow">
            <nav class="flex justify-between items-center px-4 h-18 bg-brand-primary">
              <A href="/">
                <div class="flex flex-col">
                  <h1 class="font-semibold text-lg text-brand-white">
                    {endpoints["/user/data"].donnees.ressource.L}
                  </h1>
                  <div class="flex items-center gap-2">
                    <span class="text-brand-light text-md font-medium">
                      {endpoints["/user/data"].donnees.listeInformationsEtablissements.V[0].L}
                    </span>
                    <span class="text-brand-light text-xs">
                      {endpoints["/user/data"].donnees.ressource.classeDEleve.L}
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
  );
};

export default AppSlugLayout;
