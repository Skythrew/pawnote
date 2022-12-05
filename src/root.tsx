// @refresh reload
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "virtual:windi.css";

import {
  Html,
  Head,
  Meta,
  Link,
  Body,
  Routes,
  Scripts,
  FileRoutes,
  ErrorBoundary
} from "solid-start";

import { Provider as LocalesProvider, context as locale } from "@/locales";

import PornoteUpdater from "@/components/modals/PornoteUpdater";
import { Toaster } from "solid-toast";

export default function Root () {
  const [t] = locale;

  // `window` doesn't exist on the server.
  const colorSchemeMatchMedia = !isServer ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [isDarkMode, setDarkMode] = createSignal(colorSchemeMatchMedia?.matches);
  onMount(() => colorSchemeMatchMedia?.addEventListener("change", evt => setDarkMode(evt.matches)));

  return (
    <Html
      lang="fr"
      classList={{ dark: isDarkMode() }}
    >
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

        <Link rel="icon" href="/favicon.ico" sizes="any" />
        <Title>{APP_NAME}</Title>

        <Meta name="color-scheme" content="dark light" />
        <Meta name="theme-color" content="#17AA67" />
      </Head>
      <Body>
        <LocalesProvider>
          <PornoteUpdater />
          <Toaster position="bottom-right" toastOptions={{
            className: "!bg-brand-white !text-brand-dark !dark:bg-dark-200 !dark:text-brand-white !border-2 !border-brand-primary"
          }} />

          <Suspense fallback={
            <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 bg-brand-primary dark:bg-brand-dark">
              <h2 class="font-medium text-md rounded-full text-brand-primary px-6 py-2 bg-brand-white dark:(bg-brand-primary text-brand-white)">{t("PAGES._.LOADING")}</h2>
              <span class="text-brand-light text-sm font-medium dark:(text-brand-white text-opacity-60)">v{APP_VERSION} - BETA</span>
            </div>
          }>
            <ErrorBoundary fallback={(error, reset) => (
              <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 px-4 bg-brand-primary dark:bg-brand-dark">
                <h2 class="font-medium text-xl text-brand-white">{t("PAGES._.ERROR")}</h2>
                <button class="font-medium text-md rounded-full text-brand-primary px-4 py-1 bg-brand-white dark:(bg-brand-primary text-brand-white)" onClick={reset}>
                  {t("PAGES._.RESTART")}
                </button>
                <pre class="text-sm opacity-60">{error}</pre>
              </div>
            )}>
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </LocalesProvider>

        <Scripts />
      </Body>
    </Html>
  );
}
