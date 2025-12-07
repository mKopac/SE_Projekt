import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)        // loads translations from /public/locales
  .use(LanguageDetector)   // detects language (localStorage, navigator, etc.)
  .use(initReactI18next)   // connects with React
  .init({
    fallbackLng: "en",     // default eng
    supportedLngs: ["sk", "en"],
    load: "currentOnly",
    debug: false,

    ns: ["shared", "dashboard", "profile", "faq"],
    defaultNS: "shared",

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;
