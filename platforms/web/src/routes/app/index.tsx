import type { Component } from "solid-js";
import type { ApiUserData } from "@/types/api";

import { A, Navigate, useNavigate } from "solid-start";

import {
  type LANGUAGES,
  FULLNAME_LANGUAGE_LIST,

  useLocale,
  switchLanguage
} from "@pawnote/i18n";

import sessions from "@/stores/sessions";
import endpoints from "@/stores/endpoints";

import { classNames } from "@/utils/client";
import version from "@/utils/version";

interface AvailableSession {
  slug: string;
  user_name: string;
  instance_name: string;
}

const Page: Component = () => {
  const [t, { locale }] = useLocale();
  const navigate = useNavigate();

  const [availableSessions, setAvailableSessions] = createSignal<AvailableSession[] | null>(null);

  onMount(async () => {
    const available_sessions: AvailableSession[] = [];
    const slugs = await sessions.keys();

    // When no account is found, we directly ask the user to log in.
    if (slugs.length === 0) {
      navigate("/app/link");
      return;
    }

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
    <div class="h-full min-h-screen flex flex-col justify-between gap-12 p-10">
      <header class="w-full text-center">
        <h1 class="text-3xl font-bold">
          Sélectionner un compte
        </h1>

        {/* <div class="flex gap-2">
          <select
            class="dark:bg-brand-dark dark:text-brand-white bg-brand-dark border-brand-dark dark:border-brand-white dark:hover:bg-brand-primary dark:hover:border-brand-primary flex appearance-none items-center gap-2 border-2 rounded-md px-3 py-1 outline-none transition-colors dark:hover:bg-opacity-40"
            onChange={(event) => {
              const lang_name = event.currentTarget.value as keyof typeof LANGUAGES;
              switchLanguage(lang_name);
            }}
          >
            <For each={Object.keys(FULLNAME_LANGUAGE_LIST)}>
              {lang_name => <option selected={FULLNAME_LANGUAGE_LIST[lang_name] === locale()} value={FULLNAME_LANGUAGE_LIST[lang_name]}>{lang_name}</option>}
            </For>
          </select>
        </div> */}

      </header>
      <section class="mx-auto max-w-sm w-full flex flex-col items-center justify-center gap-6 px-4">
        <Show
          when={availableSessions()}
          fallback={
            <p class="bg-brand-white text-brand-primary dark:bg-brand-primary dark:text-brand-light rounded-full px-4 py-1">
              {t("PAGES.INDEX.LOADING")}
            </p>
          }
        >
          {sessions => (
            <>
              <For each={sessions()}
                fallback={
                  // When no account is found, we directly ask the user to log in.
                  <Navigate href="/app/link" />
                }
              >
                {session => (
                  <A class="w-full" href={`/app/session/${session.slug}`}>
                    <div
                      class="transform cursor-pointer border-2 border-latte-text/60 rounded-lg bg-transparent px-6 py-4 text-latte-text outline-none transition-all hover:(scale-105 border-transparent rounded-xl bg-latte-rosewater bg-opacity-80 text-latte-base shadow-sm)"
                    >
                      <h2 class="text-sm font-bold sm:text-base">
                        {session.user_name}
                      </h2>
                      <p class="text-xs font-medium opacity-80 sm:text-sm">
                        {session.instance_name}
                      </p>
                      <p class="text-xs opacity-40">
                        {session.slug}
                      </p>
                    </div>
                  </A>
                )}
              </For>

              <A href="/app/link" class="text-center text-latte-text text-opacity-50 underline underline-latte-text/50 underline-offset-4 underline-dotted hover:border-solid hover:underline-solid">
                {t("PAGES.INDEX.LINK_ANOTHER")}
              </A>
            </>
          )}
        </Show>
      </section>

      <footer class="w-full flex items-center justify-between text-sm">
        <p class="block max-w-[200px] truncate opacity-40">
          {APP_NAME} {version()}
        </p>
        <div class="flex gap-4">
          <a
            class="dark:text-brand-white text-brand-light font-medium text-opacity-60 transition-colors dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
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

export default Page;
