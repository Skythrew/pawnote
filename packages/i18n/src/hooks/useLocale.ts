import type { Language } from "@/types/locale";
import { useI18n } from "@solid-primitives/i18n";

// Helpers typings.
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;

/**
 * Modified `useI18n` from `@solid-primitives/i18n` that includes typings and auto-completion.
 *
 * @example
 * import { useLocale } from "@pornote/i18n";
 * const [t, { add, locale, dict }] = useLocale();
 */
const useLocale: () => [
  template: (key: DotNestedKeys<Language>, params?: Record<string, string>, defaultValue?: string) => string,
  actions: {
    add: (lang: string, table: Language) => void;
    /**
     * @example
     * // Get current locale.
     * const current_locale = locale();
     *
     * // Set current locale.
     * locale("fr") // Sets locale to `fr`.
     */
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, unknown>>;
  }
] = useI18n;

export default useLocale;
