import { ref, watchEffect } from 'vue'

/**
 * Respects the user's `prefers-reduced-motion` OS-level accessibility setting.
 * Returns a ref that is `true` when animations should be minimized or disabled.
 *
 * Usage:
 *   const reducedMotion = useReducedMotion()
 *   // Then gate animations: if (!reducedMotion.value) { animate() }
 */
export function useReducedMotion() {
  const prefersReducedMotion = ref(false)

  // SSR-safe
  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mql.matches

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mql.addEventListener('change', handler)

    // Cleanup not strictly necessary for singleton, but good practice
    // In a composable that lives as long as the app, it's fine.
  }

  return { prefersReducedMotion }
}
