import type { Component } from "solid-js";
import type { ApiLoginInformations, ApiUserData } from "@/types/api";

import { A } from "solid-start";
import { appBannerMessageToString } from "@/i18n";

import app, { AppBannerMessage } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

import SessionFromScratchModal from "@/components/modals/SessionFromScratch";

const AppLayout: Component = () => {
  const navigate = useNavigate();

  const params = useParams();
  const slug = () => params.slug;

  createEffect(async () => {
    console.group(`=> ${slug()}`);

    onCleanup(() => {
      console.groupCollapsed("cleanup");
      app.cleanCurrentUser();
      console.info("[debug]: cleaned 'app.current_user'");
      console.groupEnd();

      console.groupEnd(); // Closes '=> {slug}'.
    });

    console.groupCollapsed("initialization");

    app.setBannerMessage({
      message: AppBannerMessage.RestoringSession,
      is_loader: true
    });

    const session = await sessions.get(slug());
    if (session === null) {
      console.error("[debug] no session found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got session");

    const user_data = await endpoints.get<ApiUserData>(slug(), "/user/data");
    if (!user_data) {
      console.error("[debug] no endpoint '/user/data' found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got '/user/data'");

    const login_informations = await endpoints.get<ApiLoginInformations>(slug(), "/login/informations");
    if (!login_informations) {
      console.error("[debug] no endpoint '/login/informations' found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got '/login/informations'");

    batch(() => {
      app.setCurrentUser({
        slug: slug(),
        session,
        endpoints: {
          "/login/informations": login_informations.data,
          "/user/data": user_data.data
        }
      });

      app.setBannerToIdle();

      console.info("[debug]: defined `app.current_user`");
      console.groupEnd();
    });
  });

  // Short-hand.
  const user = () => app.current_user;

  return (
    <>
      <Title>{slug()} - Pornote</Title>
      <Show when={user().slug} fallback={
        <p>Récupération des données, veuillez patienter.</p>
      }>
        <header class="fixed z-50 top-0 right-0 left-0 flex flex-col shadow-md">
          <nav class="flex justify-between items-center px-4 h-18 bg-brand-primary">
            <A href={`/app/${user().slug}`}>
              <div class="flex flex-col">
                <h1 class="font-semibold text-lg text-brand-white">
                  {user().endpoints?.["/user/data"].donnees.ressource.L}
                </h1>
                <div class="flex items-center gap-2">
                  <span class="text-brand-light text-md font-medium">
                    {user().endpoints?.["/user/data"].donnees.ressource.Etablissement.V.L}
                  </span>
                  <span class="text-brand-light text-xs">
                    {user().endpoints?.["/user/data"].donnees.ressource.classeDEleve.L}
                  </span>
                </div>
              </div>
            </A>

          </nav>
          <Show when={app.banner_message.message !== AppBannerMessage.Idle}>
            <div class="flex items-center justify-center px-2 h-8 bg-brand-white">
              <p class="text-center text-sm">{appBannerMessageToString(app.banner_message.message)}</p>
            </div>
          </Show>
        </header>

        <main class="mt-26 pt-4">
          <Outlet />
        </main>

        <SessionFromScratchModal
          pronote_url={user().session?.instance.pronote_url as string}
          ent_url={user().session?.instance.ent_url ?? undefined}
        />
      </Show>
    </>
  );
};

export default AppLayout;

