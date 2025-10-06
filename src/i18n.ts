import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// French translations
import frTranslations from '../public/locales/fr/translation.json';
import enTranslations from '../public/locales/en/translation.json';

i18n
  // Detect user language (but always fallback to French)
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: true, // Enable debug to see what's happening
    fallbackLng: 'fr', // French is the default
    lng: 'fr', // Force French as initial language
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order of detection methods - check localStorage first, then default to French
      order: ['localStorage', 'htmlTag'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng',
    },
    resources: {
      fr: {
        translation: frTranslations
      },
      en: {
        translation: enTranslations
      }
    }
  });

// Ensure French is set
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'fr');
  i18n.changeLanguage('fr');
}

export default i18n;

