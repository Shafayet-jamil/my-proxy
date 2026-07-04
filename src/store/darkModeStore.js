import { create } from 'zustand'

const getInitialDark = () => {
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const useDarkMode = create((set) => ({
  dark: getInitialDark(),
  toggle: () => set((s) => {
    const next = !s.dark
    localStorage.setItem('darkMode', next)
    document.documentElement.classList.toggle('dark', next)
    return { dark: next }
  }),
  init: () => {
    const dark = getInitialDark()
    document.documentElement.classList.toggle('dark', dark)
    return dark
  }
}))

export default useDarkMode
