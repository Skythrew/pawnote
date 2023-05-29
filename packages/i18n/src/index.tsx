import type { FlowComponent } from "solid-js";
import { createI18nContext, I18nContext } from "@solid-primitives/i18n";

// We import the French locale since it's the language by default.
import fr from "@/locales/fr";
export const LANGUAGES = {
  en: async () => await import("@/locales/en"),
  fr
};

/**
 * A list containing list of available languages
 * in this form: `{ "FULL_NAME": "name" }`
 */
export const FULLNAME_LANGUAGE_LIST: {
  [name: string]: keyof typeof LANGUAGES
} = {
  English: "en",
  Français: "fr"
} as const;

// By default, only add French so we can lazy load the other locales.
const context = createI18nContext({ fr }, "fr");

export const LocaleProvider: FlowComponent = (props) => (
  <I18nContext.Provider value={context}>
    {props.children}
  </I18nContext.Provider>
);

export const findLanguageBasedOnBrowser = (): keyof typeof LANGUAGES => {
  // Try to find a match based on the first part of the available languages (i.e., match "en" for "en-US")
  for (const language of window.navigator.languages) {
    for (const availableLanguage of Object.keys(LANGUAGES)) {
      if (language.startsWith(availableLanguage)) {
        return availableLanguage as keyof typeof LANGUAGES;
      }
    }
  }

  return "fr";
};

/**
 * Helper function to switch current locale easily.
 * It also implements the lazy loading when needed.
 */
export const switchLanguage = async (lang: keyof typeof LANGUAGES): Promise<void> => {
  const { add, locale } = context[1]; // `[1]` since `context` is `[t, {...actions}]`

  // When the language is not available, default to French (`fr`).
  if (!(lang in LANGUAGES)) {
    localStorage.setItem("lang", "fr");
    locale("fr");
    return;
  }

  // Since French is already imported, we don't need to import it again.
  const dict = lang !== "fr"
    ? await LANGUAGES[lang]()
    : LANGUAGES[lang];

  // Add the language to locales.
  add(lang, dict);
  // Switch to this language.
  locale(lang);

  // Persist the language in the localStorage.
  localStorage.setItem("lang", lang);
};

export { context as locale };
export { default as useLocale } from "@/hooks/useLocale";
export { ClientErrorCode, ClientAppStateCode } from "@/types/client";
