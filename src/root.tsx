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
      <Body
        classList={{ "dark": settings.globalThemeMode() === "dark" }}
      >
        <Suspense>
          <ErrorBoundary>
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
