import { ref } from 'vue'

export function useReducedMotion() {
  const prefersReducedMotion = ref(false)
  const isMobile = ref(false)

  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mql.matches
    mql.addEventListener('change', (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    })

    const mobileMql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mobileMql.matches
    mobileMql.addEventListener('change', (e: MediaQueryListEvent) => {
      isMobile.value = e.matches
    })
  }

  return { prefersReducedMotion, isMobile }
}
