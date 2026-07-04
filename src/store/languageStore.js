import { create } from 'zustand'
import translations from '../lib/translations'

const useLanguage = create((set, get) => ({
  lang: localStorage.getItem('lang') || 'en',

  setLang: (lang) => {
    localStorage.setItem('lang', lang)
    set({ lang })
  },

  t: (path) => {
    const lang = get().lang
    const keys = path.split('.')
    let result = translations[lang]
    for (const key of keys) {
      result = result?.[key]
    }
    return result || path
  }
}))

export default useLanguage
