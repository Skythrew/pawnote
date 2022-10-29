import type { Component } from "solid-js";
import type { ApiUserData } from "@/types/api";

import { A } from "solid-start";

import settings from "@/stores/settings";
import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";

interface AvailableSession {
  slug: string;
  user_name: string;
  instance_name: string;
}

const RootHomePage: Component = () => {
  const [availableSessions, setAvailableSessions] = createSignal<AvailableSession[] | null>(null);

  onMount(async () => {
    const available_sessions: AvailableSession[] = [];

    const slugs = await sessions.keys();
    for (const slug of slugs) {
      const user_data = await endpoints.get<ApiUserData>(slug, "/user/data");
      if (!user_data) continue;

      const user_name = user_data.donnees.ressource.L;
      const instance_name = user_data.donnees.listeInformationsEtablissements.V[0].L;

      available_sessions.push({ slug, user_name, instance_name });
    }

    setAvailableSessions([...available_sessions]);
  });

  return (
    <div class="h-screen w-screen bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header class="fixed top-0 w-full py-4 flex flex-col items-center justify-start">
        <h1 class="font-bold text-3xl dark:text-brand-primary">{APP_NAME}</h1>
        <p class="text-lg text-brand-light mb-4">Client Pronote non-officiel.</p>

        <button onClick={settings.toggleGlobalThemeMode}>
          {settings.globalThemeMode() === "dark" ? "Mode Clair" : "Mode Sombre"}
        </button>
      </header>

      <section class="h-full w-full flex items-center justify-center py-32 px-4">
        <Show keyed
          when={availableSessions()}
          fallback={
            <p>Chargement des comptes...</p>
          }
        >
          { sessions => (
            <Show
              when={sessions.length > 0}
              fallback={
                <div class="
                  flex flex-col justify-center items-center gap-4 max-w-md p-6 rounded-lg

                  dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary
                  bg-brand-dark bg-opacity-20 border-2 border-brand-dark
                ">
                  <p class="text-sm sm:text-base opacity-100 text-center">
                    Aucun compte sauvegardé localement !
                  </p>
                  <A href="/link">
                    Ajouter un compte Pronote
                  </A>
                </div>
              }
            >
              <div class="flex flex-col gap-4">
                <For each={sessions}>
                  {session => (
                    <A href={`/app/${session.slug}`}>
                      <div
                        class="
                          bg-brand-white rounded-xl text-brand-primary
                          p-4 cursor-pointer hover:bg-opacity-80 transition-colors
                          hover:shadow-sm
                        "
                      >
                        <h2 class="font-semibold">
                          {session.user_name}
                        </h2>
                        <p class="text-opacity-60">
                          {session.instance_name}
                        </p>
                      </div>
                    </A>
                  )}
                </For>
                <A href="/link">
                  Ajouter un autre compte Pronote
                </A>
              </div>
            </Show>
          )}
        </Show>
      </section>

      <footer class="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a
          class="font-medium text-brand-light dark:text-brand-white hover:text-opacity-60 transition-colors"
          href="https://github.com/Vexcited/pornote"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};

export default RootHomePage;

