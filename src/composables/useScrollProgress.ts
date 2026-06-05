import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollProgress() {
  const progress = ref(0)

  let rafId = 0
  let ticking = false

  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight
    progress.value = h > 0 ? Math.min(window.scrollY / h, 1) : 0
    ticking = false
  }

  function onScroll() {
    if (!ticking) {
      rafId = requestAnimationFrame(update)
      ticking = true
    }
  }

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(rafId)
  })

  return { progress }
}
