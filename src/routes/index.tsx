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
    <div class="min-h-screen py-4 px-6 flex flex-col justify-between gap-12 bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header class="w-full flex flex-col items-center justify-start md:justify-between md:flex-row">
        <div class="flex flex-col items-center md:items-start">
          <h1 class="font-bold text-3xl">{APP_NAME}</h1>
          <p class="text-lg text-brand-light mb-4 dark:(text-brand-white text-opacity-60)">{t("PAGES.INDEX.description")}</p>
        </div>

        <div class="flex gap-2">
          <select
            class="rounded-md py-1 px-3 flex items-center gap-2 transition-colors outline-none border-2 bg-brand-dark border-brand-dark dark:(border-brand-white bg-brand-dark hover:(border-brand-primary bg-brand-primary bg-opacity-40) text-brand-white)"
            onChange={(event) => switchLanguage(event.currentTarget.value as keyof typeof languages)}
          >
            <For each={Object.keys(fullNameLanguages)}>
              {lang_name => <option  selected={fullNameLanguages[lang_name] === locale()} value={fullNameLanguages[lang_name]}>{lang_name}</option>}
            </For>
          </select>
        </div>

      </header>
      <section class="w-full flex flex-col gap-4 items-center justify-center px-4 max-w-md mx-auto">
        <Show keyed
          when={availableSessions()}
          fallback={
            <p class="bg-brand-white text-brand-primary rounded-full px-4 py-1 dark:bg-brand-primary dark:text-brand-light">{t("PAGES.INDEX.loading_accounts")}</p>
          }
        >
          {sessions => (
            <Show
              when={sessions.length > 0}
              fallback={
                <A href="/link" class="text-center font-medium px-4 py-2 rounded-full dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary bg-brand-light text-brand-primary dark:text-brand-light border-2 border-brand-primary">
                  {t("PAGES.INDEX.link_account")}
                </A>
              }
            >
              <For each={sessions}>
                {session => (
                  <A class="w-full" href={`/app/${session.slug}`}>
                    <div
                      class="bg-brand-white rounded-full py-4 px-8 cursor-pointer hover:bg-opacity-80 dark:bg-brand-primary transition-colors hover:shadow-sm"
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
                {t("PAGES.INDEX.link_new_account")}
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

