import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const saved = localStorage.getItem('theme-dark')
  const isDark = ref(saved === null ? true : saved === 'true')

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme-dark', String(isDark.value))
  }

  return { isDark, toggleTheme }
})
