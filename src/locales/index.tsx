import type { FlowComponent } from "solid-js";

import { createI18nContext, I18nContext, useI18n } from "@solid-primitives/i18n";

// We import the French locale since it's the language by default.
import fr from "@/locales/fr";

export const available_languages = {
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

export const switchLanguage = async (lang: keyof typeof available_languages) => {
  const [, { add, locale }] = useI18n();

  // When the language is not available, use French.
  if (!available_languages[lang]) {
    locale("fr");
    return;
  }

  // Since French is already imported, we don't need to import it again.
  const dict = lang !== "fr" ?
    await available_languages[lang]()
    : available_languages[lang];

  add(lang, dict);
  locale(lang);
};
