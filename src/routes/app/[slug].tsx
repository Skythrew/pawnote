import type { Component } from "solid-js";
import type { ApiLoginInformations, ApiUserData } from "@/types/api";

import { A } from "solid-start";
import { useLocale } from "@/locales";

import app, { AppStateCode } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

import { renewAPIsSync } from "@/utils/client";

import SessionFromScratchModal from "@/components/modals/SessionFromScratch";

const AppLayout: Component = () => {
  const [t] = useLocale();
  const navigate = useNavigate();

  const params = useParams();
  const slug = () => params.slug;

  const [loading, setLoading] = createSignal(true);
  createEffect(on(slug, async (slug) => {
    console.group(`=> ${slug}`);
    setLoading(true);

    onCleanup(() => {
      console.groupCollapsed("cleanup");

      batch(() => {
        setLoading(false);
        app.cleanCurrentUser();
        SessionFromScratchModal.show(false);
      });

      console.info("[debug]: cleaned 'app.current_user' and 'SessionFromScratchModal' state");
      console.groupEnd();

      console.groupEnd(); // Closes '=> {slug}'.
    });

    console.groupCollapsed("initialization");

    const session = await sessions.get(slug);
    if (!session) {
      console.error("[debug] no session found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got session");

    const user_data = await endpoints.get<ApiUserData>(slug, "/user/data");
    if (!user_data) {
      console.error("[debug] no endpoint '/user/data' found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got '/user/data'");

    const login_informations = await endpoints.get<ApiLoginInformations>(slug, "/login/informations");
    if (!login_informations) {
      console.error("[debug] no endpoint '/login/informations' found");
      console.groupEnd();
      return navigate("/link");
    }
    console.info("[debug]: got '/login/informations'");

    app.setCurrentUser({
      slug,
      session,
      endpoints: {
        "/login/informations": login_informations.data,
        "/user/data": user_data.data
      }
    });

    console.info("[debug]: defined `app.current_user`");
    console.groupEnd();

    // We fetch all the APIs to cache them and renew them at
    // the same time - it also prevents session errors.
    await renewAPIsSync();
    setLoading(false);
  }));

  // Short-hand.
  const user = () => app.current_user;

  return (
    <>
      <Title>{slug()} - {APP_NAME}</Title>
      <Show when={user().slug && !loading()} fallback={
        <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 px-4 bg-brand-primary dark:bg-brand-dark">
          <h2 class="text-center font-medium text-md rounded-full text-brand-primary px-6 py-2 bg-brand-white dark:(bg-brand-primary text-brand-white)">{t("PAGES.APP._.FETCHING")}</h2>
          <span class="text-brand-light text-sm font-medium dark:(text-brand-white text-opacity-60)">{
            app.current_state.code === AppStateCode.Idle ? t("PAGES.APP._.WAIT") : t(`APP_STATE.${app.current_state.code}`)
          }</span>
        </div>
      }>
        <header class="fixed z-50 top-0 right-0 left-0 flex flex-col shadow dark:shadow-md">
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

            <A class="text-brand-white hover:text-brand-light flex text-2xl" href="/">
              <IconMdiHome />
            </A>
          </nav>

          <Show keyed when={app.current_state.code !== AppStateCode.Idle && app.current_state.code}>
            {code => (
              <div class="flex items-center justify-center px-2 h-8 bg-brand-white text-brand-dark dark:(bg-brand-light text-brand-primary)">
                <p class="text-center text-sm">{t(`APP_STATE.${code}`)}...</p>
              </div>
            )}
          </Show>
        </header>

        <main class="min-h-screen bg-brand-white dark:bg-brand-dark pt-30">
          <Outlet />
        </main>
      </Show>

      <Show when={user().slug}>
        <SessionFromScratchModal.Component
          pronote_url={user().session!.instance.pronote_url as string}
          ent_url={user().session!.instance.ent_url ?? undefined}
        />
      </Show>
    </>
  );
};

export default AppLayout;

