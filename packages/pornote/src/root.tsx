// @refresh reload
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@pornote/ui/style.css";

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
  type languages as availableLanguages,
  Provider as LocalesProvider,
  context as locale,

  findLanguageBasedOnBrowser,
  switchLanguage
} from "@/locales";

import PornoteUpdater from "@/components/modals/PornoteUpdater";
import { Toaster } from "solid-toast";

export default function Root () {
  const [t] = locale;

  /** Always default to `fr`. */
  const language = isServer ? "fr" :
    localStorage.getItem("lang") as keyof typeof availableLanguages || findLanguageBasedOnBrowser();

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
      <Body>
        <LocalesProvider>
          <PornoteUpdater />
          <Toaster position="bottom-right" toastOptions={{
            className: "!bg-brand-white !text-brand-dark !dark:bg-dark-200 !dark:text-brand-white !border-2 !border-brand-primary"
          }} />

          <Suspense fallback={
            <div class="bg-brand-primary flex flex-col h-screen w-screen gap-2 justify-center items-center dark:bg-brand-dark">
              <h2 class="bg-brand-white rounded-full font-medium text-md text-brand-primary py-2 px-6 dark:(bg-brand-primary text-brand-white) ">{t("PAGES._.LOADING")}</h2>
              <span class="font-medium text-brand-light text-sm dark:(text-brand-white text-opacity-60) ">v{APP_VERSION} - BETA</span>
            </div>
          }>
            <ErrorBoundary fallback={(error, reset) => (
              <div class="bg-brand-primary flex flex-col h-screen w-screen px-4 gap-2 justify-center items-center dark:bg-brand-dark">
                <h2 class="font-medium text-xl text-brand-white">{t("PAGES._.ERROR")}</h2>
                <button class="bg-brand-white rounded-full font-medium text-md text-brand-primary py-1 px-4 dark:(bg-brand-primary text-brand-white) " onClick={reset}>
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
