import type { Component } from "solid-js";

import { A, useNavigate, Navigate } from "solid-start";

import { useLocale } from "@pawnote/i18n";
import { ListSessions } from "@pawnote/client";

import version from "@/utils/version";

const Page: Component = () => {
  const [t] = useLocale();
  const navigate = useNavigate();

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
        <ListSessions
          loading={
            <p class="bg-brand-white text-brand-primary dark:bg-brand-primary dark:text-brand-light rounded-full px-4 py-1">
              {t("PAGES.INDEX.LOADING")}
            </p>
          }
          onDone={(sessions) => {
            if (sessions.length === 0) {
              navigate("/app/link");
            }
          }}
        >
          {sessions => (
            <>
              <For each={sessions()} fallback={<Navigate href="/app/link" />}>
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
        </ListSessions>
      </section>

      <footer class="w-full flex items-center justify-between text-sm">
        <p class="block max-w-[200px] truncate opacity-40">
          {APP_NAME} {version()}
        </p>
        <div class="flex gap-4">
          <a
            class="text-brand-light dark:text-brand-white font-medium text-opacity-60 transition-colors dark:text-opacity-40 hover:text-opacity-80 dark:hover:text-opacity-60"
            href="https://github.com/catto-labs/pawnote"
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
