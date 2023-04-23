import type { Component } from "solid-js";
import type { ApiUserData } from "@/types/api";

import { A } from "solid-start";

import {
  type LANGUAGES,
  FULLNAME_LANGUAGE_LIST,

  useLocale,
  switchLanguage
} from "@pawnote/i18n";

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
    <div class="bg-brand-primary text-brand-white dark:bg-brand-dark min-h-screen flex flex-col justify-between gap-12 px-6 py-4">
      <header class="w-full flex flex-col items-center justify-start md:flex-row md:justify-between">
        <div class="flex flex-col items-center md:items-start">
          <h1 class="text-3xl font-bold">{APP_NAME}</h1>
          <p class="text-brand-light dark:text-brand-white mb-4 text-lg dark:text-opacity-60">{t("PAGES.INDEX.DESCRIPTION")}</p>
        </div>

        <div class="flex gap-2">
          <select
            class="bg-brand-dark border-brand-dark dark:bg-brand-dark dark:text-brand-white dark:hover:bg-brand-primary dark:border-brand-white dark:hover:border-brand-primary flex appearance-none items-center gap-2 border-2 rounded-md px-3 py-1 outline-none transition-colors dark:hover:bg-opacity-40"
            onChange={(event) => {
              const lang_name = event.currentTarget.value as keyof typeof LANGUAGES;
              switchLanguage(lang_name);
            }}
          >
            <For each={Object.keys(FULLNAME_LANGUAGE_LIST)}>
              {lang_name => <option selected={FULLNAME_LANGUAGE_LIST[lang_name] === locale()} value={FULLNAME_LANGUAGE_LIST[lang_name]}>{lang_name}</option>}
            </For>
          </select>
        </div>

      </header>
      <section class="mx-auto max-w-md w-full flex flex-col items-center justify-center gap-4 px-4">
        <Show keyed
          when={availableSessions()}
          fallback={
            <p class="bg-brand-white text-brand-primary dark:bg-brand-primary dark:text-brand-light rounded-full px-4 py-1">{t("PAGES.INDEX.LOADING")}</p>
          }
        >
          {sessions => (
            <Show
              when={sessions.length > 0}
              fallback={
                <A href="/link" class="bg-brand-light border-brand-primary text-brand-primary dark:bg-brand-primary dark:border-brand-primary dark:text-brand-light border-2 rounded-full px-4 py-2 text-center font-medium dark:border-2 dark:bg-opacity-20">
                  {t("PAGES.INDEX.LINK_FIRST")}
                </A>
              }
            >
              <For each={sessions}>
                {session => (
                  <A class="w-full" href={`/app/${session.slug}`}>
                    <div
                      class="bg-brand-white dark:bg-brand-primary cursor-pointer rounded-full px-8 py-4 transition-colors hover:bg-opacity-80 hover:shadow-sm"
                    >
                      <h2 class="text-md text-brand-primary dark:text-brand-white font-semibold">
                        {session.user_name}
                      </h2>
                      <p class="text-brand-dark dark:text-brand-light text-sm">
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

      <footer class="w-full flex items-center justify-between text-sm">
        <span class="block opacity-40">Pornote v{APP_VERSION} (BETA)</span>
        <div class="flex gap-4">
          <a
            class="text-brand-light dark:text-brand-white font-medium text-opacity-60 transition-colors dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
            href="https://discord.gg/qwJu57chBE"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>
          <a
            class="text-brand-light dark:text-brand-white font-medium text-opacity-60 transition-colors dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
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

