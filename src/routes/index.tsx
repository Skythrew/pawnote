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
    console.log(slugs);
    for (const slug of slugs) {
      const user_data = await endpoints.get<ApiUserData>(slug, "/user/data", { force: true });
      console.log(user_data);
      if (!user_data) continue;

      const user_name = user_data.donnees.ressource.L;
      const instance_name = user_data.donnees.listeInformationsEtablissements.V[0].L;

      available_sessions.push({ slug, user_name, instance_name });
    }

    console.log(available_sessions);

    setAvailableSessions([...available_sessions]);
  });

  return (
    <div class="min-h-screen py-4 px-6 flex flex-col justify-between bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header class="w-full flex flex-col items-center justify-start">
        <h1 class="font-bold text-3xl dark:text-brand-primary">{APP_NAME}</h1>
        <p class="text-lg text-brand-light mb-4">Client Pronote non-officiel.</p>

        <button class="shadow-lg rounded-md px-2 py-1 bg-brand-dark dark:bg-brand-primary" onClick={settings.toggleGlobalThemeMode}>
          {settings.globalThemeMode() === "dark" ? "Mode Clair" : "Mode Sombre"}
        </button>
      </header>

      <section class="w-full flex flex-col gap-4 items-center justify-center px-4">
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
                <A href="/link" class="font-medium px-6 py-4 rounded-lg dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary bg-brand-light bg-opacity-20 border-2 border-brand-light">
                    Cliquez pour associer un compte Pronote!
                </A>
              }
            >
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
            </Show>
          )}
        </Show>
      </section>

      <footer class="w-full flex flex-col items-center justify-center">
        <a
          class="font-medium text-brand-light dark:text-brand-white dark:text-opacity-40 hover:text-opacity-60 transition-colors"
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

