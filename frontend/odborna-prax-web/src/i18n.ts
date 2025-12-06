import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)        // loads translations from /public/locales
  .use(LanguageDetector)   // detects language (localStorage, navigator, etc.)
  .use(initReactI18next)   // connects with React
  .init({
    fallbackLng: "en",     // default language - english
    debug: false,

    ns: ["shared", "dashboard", "profile"],
    defaultNS: "shared",

    backend: {
      // This is the default path for CRA/Vite when using public/
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },

    detection: {
      // Useful defaults: language stored in localStorage, then browser
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    },

    interpolation: {
      escapeValue: false // React already escapes
    }
  });

export default i18n;
