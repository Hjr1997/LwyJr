import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

const THEME_KEY = 'lwyjr-theme-preference'
const PROGRESS_KEY = 'lwyjr-tutorial-progress'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getPersistedTheme(): boolean | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark') return true
    if (v === 'light') return false
    // 'system' or not set → use system preference
    return null
  } catch {
    return null
  }
}

function persistedIsDark(): boolean {
  const persisted = getPersistedTheme()
  // First visit → default dark; after that, respect saved preference
  return persisted !== null ? persisted : true
}

function applyTheme(isDark: boolean) {
  const theme = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  // Set color-scheme so native form controls and scrollbars match
  document.documentElement.style.colorScheme = theme
}

export const useAppStore = defineStore('app', () => {
  // Init from localStorage → system preference
  const isDark = ref(persistedIsDark())
  // Apply on init
  applyTheme(isDark.value)

  const activeSection = ref('hero')
  const tutorialProgress = ref(0)
  const tutorialState = reactive({
    completed: new Set<string>(
      (() => { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]') } catch { return [] } })()
    ),
    get size() { return this.completed.size },
  })

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  // Lamp → ChatBot event bridge
  const lampEvent = ref<'on' | 'off' | null>(null)
  function triggerLampEvent(dir: 'on' | 'off') {
    lampEvent.value = dir
    setTimeout(() => { lampEvent.value = null }, 100)
  }

  // Search open event (NavBar search btn → SearchModal)
  const searchEvent = ref(0)
  function triggerSearch() {
    searchEvent.value++
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    // Persist user preference
    try {
      localStorage.setItem(THEME_KEY, theme.value)
    } catch { /* quota exceeded, ignore */ }
  }

  function setSection(section: string) {
    activeSection.value = section
  }

  function markTutorialComplete(id: string) {
    if (tutorialState.completed.has(id)) {
      tutorialState.completed.delete(id)
    } else {
      tutorialState.completed.add(id)
    }
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...tutorialState.completed])) } catch {}
    const total = 30
    tutorialProgress.value = Math.round((tutorialState.completed.size / total) * 100)
  }

  function isTutorialDone(id: string): boolean {
    return tutorialState.completed.has(id)
  }

  return {
    isDark,
    activeSection,
    tutorialProgress,
    tutorialCompleted: tutorialState,
    theme,
    toggleTheme,
    setSection,
    markTutorialComplete,
    isTutorialDone,
    lampEvent,
    triggerLampEvent,
    searchEvent,
    triggerSearch,
  }
})
