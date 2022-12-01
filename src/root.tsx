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

import { Provider as LocalesProvider } from "@/locales";

export default function Root () {
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
        <Meta name="color-scheme" content="dark light" />
        <Meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

        <Link rel="icon" href="/favicon.ico" sizes="any" />
        <Link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        <Meta name="theme-color" content={isDarkMode()
          ? "#222222" // Dark
          : "#17AA67" // Light
        }/>

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
        <LocalesProvider>

          <Suspense fallback={
            <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 bg-brand-primary dark:bg-brand-dark">
              <h2 class="font-medium text-md rounded-full text-brand-primary px-6 py-2 bg-brand-white dark:(bg-brand-primary text-brand-white)">Chargement de Pornote...</h2>
              <span class="text-brand-light text-sm font-medium dark:(text-brand-white text-opacity-60)">v{APP_VERSION} - BETA</span>
            </div>
          }>
            <ErrorBoundary fallback={(error, reset) => (
              <div class="w-screen h-screen flex flex-col justify-center items-center gap-2 px-4 bg-brand-primary dark:bg-brand-dark">
                <h2 class="font-medium text-xl text-brand-white">Une erreur critique est survenue!</h2>
                <button class="font-medium text-md rounded-full text-brand-primary px-4 py-1 bg-brand-white dark:(bg-brand-primary text-brand-white)" onClick={reset}>
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
        </LocalesProvider>

        <Scripts />
      </Body>
    </Html>
  );
}
