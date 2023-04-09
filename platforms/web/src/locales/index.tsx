import type { FlowComponent } from "solid-js";
import { ClientErrorCode, ResponseErrorCode } from "@/types/errors";

import { createI18nContext, I18nContext, useI18n } from "@solid-primitives/i18n";

// We import the French locale since it's the language by default.
import fr from "@/locales/fr";
import {AppStateCode} from "@/stores/app";

export const fullNameLanguages: {
  [name: string]: keyof typeof languages
} = {
  "English": "en",
  "Français": "fr"
} as const;

export const languages = {
  en: () => import("./en"),
  fr
};

// By default, only add French so we can lazy load the other locales.
export const context = createI18nContext({ fr }, "fr");

export const Provider: FlowComponent = (props) => (
  <I18nContext.Provider value={context}>
    {props.children}
  </I18nContext.Provider>
);

/**
 * Helper function to switch current locale easily.
 * It also implements the lazy loading when needed.
 */
export const switchLanguage = async (lang: keyof typeof languages) => {
  const [, { add, locale }] = context;

  // When the language is not available, use French.
  if (!languages[lang]) {
    localStorage.setItem("lang", "fr");
    locale("fr");
    return;
  }

  // Since French is already imported, we don't need to import it again.
  const dict = lang !== "fr" ?
    await languages[lang]()
    : languages[lang];

  // Lazy load the language and switch to it.
  add(lang, dict);
  locale(lang);

  // Persist the language in the localStorage.
  localStorage.setItem("lang", lang);
};

export const findLanguageBasedOnBrowser = (): keyof typeof languages => {
  const browserLanguages = window.navigator.languages || [window.navigator.language].map(str => str.toLowerCase());

  // Try to find a match based on the first part of the available languages (i.e., match "en" for "en-US")
  for (const language of browserLanguages) {
    for (const availableLanguage of Object.keys(languages)) {
      if (language.startsWith(availableLanguage))
        return availableLanguage as keyof typeof languages;
    }
  }

  return "fr";
};

// Helpers typings.
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;

// Language interface to type check locales.
export interface Language {
  API_ERRORS: Record<ResponseErrorCode, string>;
  CLIENT_ERRORS: Record<ClientErrorCode, string>;
  APP_STATE: Omit<Record<AppStateCode, string>, AppStateCode.Idle>;
  PAGES: {
    /** Corresponds to `@/root.tsx` */
    _: Record<
      | "LOADING"
      | "ERROR"
      | "RESTART"
    , string>

    /** Corresponds to `@/routes/index.tsx` */
    INDEX: Record<
      | "DESCRIPTION"
      | "LINK_FIRST"
      | "LINK_ANOTHER"
      | "LOADING"
    , string>

    APP: {
      /** Corresponds to `@/routes/app/[slug].tsx` */
      _: Record<
        | "FETCHING"
        | "WAIT"
      , string>
    }
  }
}

// We re-export the `useI18n` function with typings support.
export const useLocale: () => [
  template: (key: DotNestedKeys<Language>, params?: Record<string, string>, defaultValue?: string) => string,
  actions: {
    add: (lang: string, table: Language) => void;
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, unknown>>;
  }
] = useI18n;
