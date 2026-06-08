import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAppStore } from '@/stores/app'
import './styles/main.css'
import './styles/animations.css'
import './styles/transitions.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// Listen for OS-level theme changes (e.g. user switches system dark mode)
// Only apply when the user hasn't set an explicit preference in localStorage
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
colorSchemeQuery.addEventListener('change', (e) => {
  const stored = localStorage.getItem('lwyjr-theme-preference')
  // If user hasn't set a preference, follow system
  if (!stored || stored === 'system') {
    const store = useAppStore()
    const target = e.matches
    if (store.isDark !== target) {
      store.toggleTheme()
    }
    // Don't persist — keep as 'system' so it stays dynamic
    localStorage.setItem('lwyjr-theme-preference', 'system')
  }
})
