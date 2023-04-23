// @refresh reload
import "@fontsource/comfortaa/300.css";
import "@fontsource/comfortaa/400.css";
import "@fontsource/comfortaa/500.css";
import "@fontsource/comfortaa/600.css";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

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

import {
  type LANGUAGES,
  LocaleProvider,
  locale,

  findLanguageBasedOnBrowser,
  switchLanguage
} from "@pawnote/i18n";

import PawnoteUpdater from "@/components/modals/PawnoteUpdater";
import { Toaster } from "solid-toast";

export default function Root () {
  const [t] = locale;

  /** Always default to `fr`. */
  const language = isServer ? "fr" :
    localStorage.getItem("lang") as keyof typeof LANGUAGES || findLanguageBasedOnBrowser();

  onMount(() => switchLanguage(language));

  return (
    <Html lang={language}>
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

        <Link rel="icon" href="/favicon.ico" sizes="any" />
        <Title>{APP_NAME}</Title>

        <Meta name="color-scheme" content="dark light" />
        <Meta name="theme-color" content="#17AA67" />
      </Head>
      <Body class="font-sans bg-latteBase text-latteText dark:bg-frappeBase dark:text-frappeText">
        <LocaleProvider>
          <PawnoteUpdater />
          <Toaster position="bottom-right" toastOptions={{
            className: "!bg-brand-white !text-brand-dark !dark:bg-dark-200 !dark:text-brand-white !border-2 !border-brand-primary"
          }} />

          <Suspense fallback={
            <div class="bg-brand-primary dark:bg-brand-dark h-screen w-screen flex flex-col items-center justify-center gap-2">
              <h2 class="bg-brand-white text-md text-brand-primary dark:text-brand-white dark:bg-brand-primary rounded-full px-6 py-2 font-medium">{t("PAGES._.LOADING")}</h2>
              <span class="text-brand-light dark:text-brand-white text-sm font-medium dark:text-opacity-60">v{APP_VERSION} - BETA</span>
            </div>
          }>
            <ErrorBoundary fallback={(error, reset) => (
              <div class="bg-brand-primary dark:bg-brand-dark h-screen w-screen flex flex-col items-center justify-center gap-2 px-4">
                <h2 class="text-brand-white text-xl font-medium">{t("PAGES._.ERROR")}</h2>
                <button class="bg-brand-white text-md text-brand-primary dark:bg-brand-primary dark:text-brand-white rounded-full px-4 py-1 font-medium" onClick={reset}>
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
        </LocaleProvider>

        <Scripts />
      </Body>
    </Html>
  );
}
