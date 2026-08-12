import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGS = ['en', 'it', 'fr'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/** Key of the persisted UI store. Kept here to avoid importing the store, which
 *  would create a cycle: ui-store imports i18n. */
export const UI_STORE_KEY = 'react-mastery-ui';

export function isSupportedLang(value: unknown): value is SupportedLang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

/**
 * Read the language out of the persisted UI store before React mounts, so the
 * first paint is already in the reader's language.
 */
function storedLanguage(): SupportedLang {
  try {
    const raw = localStorage.getItem(UI_STORE_KEY);
    if (!raw) return 'en';
    const { state } = JSON.parse(raw);
    return isSupportedLang(state?.language) ? state.language : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    fr: { translation: fr },
  },
  lng: storedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/**
 * Keep `<html lang>` in step with the active language. Screen readers pick
 * pronunciation from it and search engines index on it, so a hard-coded
 * `lang="en"` mislabels every French and Italian page.
 */
function syncDocumentLang(lang: string) {
  document.documentElement.lang = lang;
}

syncDocumentLang(i18n.language);
i18n.on('languageChanged', syncDocumentLang);

export default i18n;
