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
};

export const languages = {
  en: () => import("./en"),
  fr
};

// By default, only add French so we can lazy load the other locales.
const context = createI18nContext({ fr }, "fr");

export const Provider: FlowComponent = (props) => (
  <I18nContext.Provider value={context}>
    {props.children}
  </I18nContext.Provider>
);

export const switchLanguage = async (lang: keyof typeof languages) => {
  const [, { add, locale }] = context;

  // When the language is not available, use French.
  if (!languages[lang]) {
    locale("fr");
    return;
  }

  // Since French is already imported, we don't need to import it again.
  const dict = lang !== "fr" ?
    await languages[lang]()
    : languages[lang];

  add(lang, dict);
  locale(lang);
};

// Add typings for the `template` function.
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;

export interface Language {
  API_ERRORS: Record<ResponseErrorCode, string>;
  CLIENT_ERRORS: Record<ClientErrorCode, string>;
  APP_STATE: Record<AppStateCode, string>;
  PAGES: {
    INDEX: Record<
      | "dark"
      | "light"
      | "description"
      | "link_account"
      | "link_new_account"
      | "loading_accounts"
    , string>
  }
}

export const useLocale: () => [template: (key: DotNestedKeys<Language>, params?: Record<string, string>, defaultValue?: string) => string, actions: {
    add(lang: string, table: Language): void;
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, unknown>>;
}] = useI18n;

