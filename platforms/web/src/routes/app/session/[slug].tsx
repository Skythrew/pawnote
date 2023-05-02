import type { Component } from "solid-js";
import type { ApiLoginInformations, ApiUserData } from "@/types/api";

import { A, useNavigate, useParams, Outlet } from "solid-start";
import { useLocale } from "@pawnote/i18n";

import app, { AppStateCode } from "@/stores/app";
import endpoints from "@/stores/endpoints";
import sessions from "@/stores/sessions";

import { renewAPIsSync } from "@/utils/client";

// import { createModal } from "@/primitives/modal";
// import { AuthenticateSessionModalContent } from "@/components/molecules/modals";

import { PronoteApiAccountId } from "@/types/pronote";

const AppLayout: Component = () => {
  const [t] = useLocale();
  const navigate = useNavigate();

  const params = useParams();
  const slug = () => params.slug;

  // const [showInstanceModal] = createModal(() => (
  //   <Show when={user().slug}>
  //     <AuthenticateSessionModalContent
  //       instance={{
  //         pronote_url: user().session!.instance.pronote_url as string,
  //         ent_url: user().session!.instance.ent_url ?? undefined,
  //         accounts: [],
  //         school_name: ""
  //       }}
  //       loading={false}
  //     />
  //   </Show>
  // ));

  const [loading, setLoading] = createSignal(true);
  createEffect(on(slug, async (slug) => {
    console.group(`=> ${slug}`);
    setLoading(true);

    onCleanup(() => {
      console.groupCollapsed("cleanup");

      batch(() => {
        setLoading(false);
        app.cleanCurrentUser();
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

    if (session.instance.account_type_id !== PronoteApiAccountId.Eleve) {
      alert("Seul le compte élève est disponible actuellement.");
      console.groupEnd();
      return navigate("/");
    }

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

    // We fetch all the APIs to cache them and renew them at
    // the same time - it also prevents session errors.
    if (navigator.onLine) {
      await renewAPIsSync();
    }

    console.groupEnd();
    setLoading(false);
  }));

  // Short-hand.
  const user = () => app.current_user;

  return (
    <>
      <Title>{slug()} - {APP_NAME}</Title>
      <Show when={user().slug && !loading()} fallback={
        <div class="bg-brand-primary dark:bg-brand-dark h-screen w-screen flex flex-col items-center justify-center gap-2 px-4">
          <h2 class="bg-brand-white text-md text-brand-primary dark:bg-brand-primary dark:text-brand-white rounded-full px-6 py-2 text-center font-medium">{t("PAGES.APP._.FETCHING")}</h2>
          <span class="text-brand-light dark:text-brand-white text-sm font-medium dark:text-opacity-60">{
            app.current_state.code === AppStateCode.Idle ? t("PAGES.APP._.WAIT") : t(`APP_STATE.${app.current_state.code}`)
          }</span>
        </div>
      }>
        <header class="fixed left-0 right-0 top-0 z-50 flex flex-col shadow dark:shadow-md">
          <nav class="bg-brand-primary h-18 flex items-center justify-between px-4">
            <A href={`/app/${user().slug}`}>
              <div class="flex flex-col">
                <h1 class="text-brand-white text-lg font-semibold">
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
              <div class="bg-brand-white text-brand-dark dark:bg-brand-light dark:text-brand-primary h-8 flex items-center justify-center px-2">
                <p class="text-center text-sm">{t(`APP_STATE.${code}`)}...</p>
              </div>
            )}
          </Show>
        </header>

        <main class="bg-brand-white dark:bg-brand-dark min-h-screen pt-30">
          <Outlet />
        </main>
      </Show>
    </>
  );
};

export default AppLayout;

