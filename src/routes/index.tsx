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

      const user_name = user_data.data.donnees.ressource.L;
      const instance_name = user_data.data.donnees.listeInformationsEtablissements.V[0].L;

      available_sessions.push({ slug, user_name, instance_name });
    }

    setAvailableSessions([...available_sessions]);
  });

  return (
    <div class="min-h-screen py-4 px-6 flex flex-col justify-between bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header class="w-full flex flex-col items-center justify-start">
        <h1 class="font-bold text-3xl dark:text-brand-primary">{APP_NAME}</h1>
        <p class="text-lg text-brand-light mb-4">Client Pronote non-officiel.</p>
        <button class="shadow-lg rounded-md py-2 px-4 flex bg-brand-dark dark:bg-brand-primary items-center gap-2" onClick={settings.toggleGlobalThemeMode}>
          {settings.globalThemeMode() === "dark"
            ? <><IconRiMoonClearLine /> Sombre</>
            : <><IconRiSunLine /> Clair</>
          }
        </button>
      </header>

      <section class="w-full flex flex-col gap-4 items-center justify-center px-4">
        <Show keyed
          when={availableSessions()}
          fallback={
            <p class="bg-brand-white text-brand-primary rounded-full px-4 py-1 dark:bg-brand-primary dark:text-brand-light">Chargement des comptes...</p>
          }
        >
          { sessions => (
            <Show
              when={sessions.length > 0}
              fallback={
                <A href="/link" class="text-center font-medium px-4 py-2 rounded-full dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary bg-brand-light text-brand-primary dark:text-brand-light border-2 border-brand-primary">
                    Associer un compte Pronote !
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

      <footer class="w-full flex text-sm items-center justify-between">
        <span class="block opacity-40">Pornote v{APP_VERSION} (BETA)</span>
        <div class="flex gap-4">
          <a
            class="font-medium text-brand-light dark:text-brand-white text-opacity-60 hover:text-opacity-80 dark:text-opacity-40 dark:hover:text-opacity-60 transition-colors"
            href="https://discord.gg/qwJu57chBE"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>
          <a
            class="font-medium text-brand-light dark:text-brand-white text-opacity-60 hover:text-opacity-80 dark:text-opacity-40 dark:hover:text-opacity-60 transition-colors"
            href="https://github.com/Vexcited/pornote"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default RootHomePage;

