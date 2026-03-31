import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import it from './locales/it.json';
import fr from './locales/fr.json';

const stored = localStorage.getItem('react-mastery-ui');
let savedLang = 'en';
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.language) savedLang = state.language;
  } catch { /* ignore */ }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    fr: { translation: fr },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
