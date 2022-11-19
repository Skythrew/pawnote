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

import settings from "@/stores/settings";

export default function Root () {
  createEffect(() => {
    // Make sure to use dark mode when user sets it.
    // Automatically defaults to light mode.
    document.body.classList.toggle("dark", settings.globalThemeMode() === "dark");
  });

  return (
    <Html lang="fr">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

        <Link rel="icon" href="/favicon.ico" sizes="any" />
        <Link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        <Meta name="color-scheme" content="light dark" />
        <Meta name="theme-color" content="#17AA67" />

        <Title>{APP_NAME}</Title>
        <Meta name="title" content={APP_NAME} />
        <Meta name="description" content={APP_DESCRIPTION} />
        <Link rel="canonical" href={APP_URL} />

        <Meta property="og:type" content="website" />
        <Meta property="og:url" content={APP_URL} />
        <Meta property="og:title" content={APP_NAME} />
        <Meta property="og:description" content={APP_DESCRIPTION} />
        {/* <Meta property="og:image" content="/banner.png" /> */}

        <Meta property="twitter:card" content="summary_large_image" />
        <Meta property="twitter:url" content={APP_URL} />
        <Meta property="twitter:title" content={APP_NAME} />
        <Meta property="twitter:description" content={APP_DESCRIPTION} />
        {/* <Meta property="twitter:image" content="/banner.png" /> */}
      </Head>
      <Body>
        <Suspense fallback={
          <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 bg-brand-primary dark:bg-brand-dark">
            <h2 class="font-medium text-md rounded-full text-brand-primary px-6 py-2 bg-brand-white">Chargement de Pornote...</h2>
            <span class="text-brand-light text-sm font-medium">v{APP_VERSION} - BETA</span>
          </div>
        }>
          <ErrorBoundary fallback={(error, reset) => (
            <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 bg-brand-primary dark:bg-brand-dark">
              <h2 class="font-medium text-xl text-brand-white">Une erreur critique est survenue!</h2>
              <button class="rounded-full px-4 py-1 bg-brand-light" onClick={reset}>
                  Redémarrer
              </button>
              <pre class="text-sm opacity-60">{error}</pre>
            </div>
          )}>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
