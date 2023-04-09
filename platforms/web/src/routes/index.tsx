import type { Component } from "solid-js";
import type { ApiUserData } from "@/types/api";

import { A } from "solid-start";

import {
  type languages,
  fullNameLanguages,

  useLocale,
  switchLanguage
} from "@/locales";

import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";

interface AvailableSession {
  slug: string;
  user_name: string;
  instance_name: string;
}

const RootHomePage: Component = () => {
  const [t, { locale }] = useLocale();
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
    <div class="bg-brand-primary flex flex-col min-h-screen text-brand-white py-4 px-6 gap-12 justify-between dark:bg-brand-dark">
      <header class="flex flex-col w-full items-center justify-start md:flex-row md:justify-between">
        <div class="flex flex-col items-center md:items-start">
          <h1 class="font-bold text-3xl">{APP_NAME}</h1>
          <p class="text-lg text-brand-light mb-4 dark:(text-brand-white text-opacity-60) ">{t("PAGES.INDEX.DESCRIPTION")}</p>
        </div>

        <div class="flex gap-2">
          <select
            class="bg-brand-dark border-brand-dark rounded-md flex outline-none border-2 py-1 px-3 transition-colors gap-2 appearance-none items-center dark:(border-brand-white bg-brand-dark text-brand-white) dark:hover:(border-brand-primary bg-brand-primary bg-opacity-40) "
            onChange={(event) => {
              const lang_name = event.currentTarget.value as keyof typeof languages;
              switchLanguage(lang_name);
            }}
          >
            <For each={Object.keys(fullNameLanguages)}>
              {lang_name => <option selected={fullNameLanguages[lang_name] === locale()} value={fullNameLanguages[lang_name]}>{lang_name}</option>}
            </For>
          </select>
        </div>

      </header>
      <section class="flex flex-col mx-auto max-w-md w-full px-4 gap-4 items-center justify-center">
        <Show keyed
          when={availableSessions()}
          fallback={
            <p class="bg-brand-white rounded-full text-brand-primary py-1 px-4 dark:bg-brand-primary dark:text-brand-light">{t("PAGES.INDEX.LOADING")}</p>
          }
        >
          {sessions => (
            <Show
              when={sessions.length > 0}
              fallback={
                <A href="/link" class="bg-brand-light border-brand-primary rounded-full font-medium border-2 text-center text-brand-primary py-2 px-4 dark:bg-brand-primary dark:border-brand-primary dark:bg-opacity-20 dark:border-2 dark:text-brand-light">
                  {t("PAGES.INDEX.LINK_FIRST")}
                </A>
              }
            >
              <For each={sessions}>
                {session => (
                  <A class="w-full" href={`/app/${session.slug}`}>
                    <div
                      class="bg-brand-white rounded-full cursor-pointer py-4 px-8 transition-colors dark:bg-brand-primary hover:bg-opacity-80 hover:shadow-sm"
                    >
                      <h2 class="font-semibold text-md text-brand-primary dark:text-brand-white">
                        {session.user_name}
                      </h2>
                      <p class="text-sm text-brand-dark dark:text-brand-light">
                        {session.instance_name}
                      </p>
                    </div>
                  </A>
                )}
              </For>
              <A href="/link">
                {t("PAGES.INDEX.LINK_ANOTHER")}
              </A>
            </Show>
          )}
        </Show>
      </section>

      <footer class="flex text-sm w-full items-center justify-between">
        <span class="opacity-40 block">Pornote v{APP_VERSION} (BETA)</span>
        <div class="flex gap-4">
          <a
            class="font-medium text-brand-light transition-colors text-opacity-60 dark:text-brand-white dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
            href="https://discord.gg/qwJu57chBE"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>
          <a
            class="font-medium text-brand-light transition-colors text-opacity-60 dark:text-brand-white dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
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

