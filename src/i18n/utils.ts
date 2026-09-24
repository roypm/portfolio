import { defaultLocale, ui, type Locale, type UiKey } from "./ui";

export function useTranslations(locale: Locale) {
  return function t(key: UiKey) {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}
