import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// eslint-disable-next-line import/no-unresolved
import en from './en.json'

i18n.use(initReactI18next).init({
  resources: {
    en,
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  cache: localStorage,
})

export default i18n
