/* @refresh reload */
import "@fontsource/comfortaa/300.css";
import "@fontsource/comfortaa/400.css";
import "@fontsource/comfortaa/500.css";
import "@fontsource/comfortaa/600.css";
import "@fontsource/comfortaa/700.css";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import type { Component } from "solid-js";
import { render } from "solid-js/web";

import { Router, useRoutes } from "@solidjs/router";

import {
  type LANGUAGES,
  LocaleProvider,

  findLanguageBasedOnBrowser,
  switchLanguage
} from "@pawnote/i18n";

import routes from "~solid-pages";

const Root: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <Routes />
    </Router>
  );
};

render(
  () => {
    /** Always default to `fr`. */
    const language = isServer
      ? "fr"
      : localStorage.getItem("lang") as keyof typeof LANGUAGES ?? findLanguageBasedOnBrowser();

    void switchLanguage(language);

    return (
      <LocaleProvider>
        <Root />
      </LocaleProvider>
    );
  },
  document.getElementById("root") as HTMLDivElement
);
