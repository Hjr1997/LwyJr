import { onMounted, onUnmounted } from 'vue'

/**
 * Magnetic cursor effect — elements gently "attract" the cursor position.
 * Applied sparingly to primary CTA buttons and interactive cards.
 *
 * @param selector CSS selector for elements to magnetize
 * @param strength Strength of attraction (px), default 8
 */
export function useMagneticCursor(selector: string, strength = 8) {
  const items: HTMLElement[] = []
  let rafId = 0

  function bind(el: HTMLElement) {
    el.style.transition = 'transform 0.35s cubic-bezier(.16,1,.3,1)'

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * (strength / (rect.width / 2))
      const dy = (e.clientY - cy) * (strength / (rect.height / 2))
      el.style.transform = `translate3d(${dx}px,${dy}px,0)`
    }

    const onLeave = () => {
      el.style.transform = 'translate3d(0,0,0)'
    }

    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)

    items.push(el)
    el._magHandlers = { onMove, onLeave }
  }

  onMounted(() => {
    document.querySelectorAll<HTMLElement>(selector).forEach(bind)
  })

  onUnmounted(() => {
    items.forEach((el) => {
      if (el._magHandlers) {
        el.removeEventListener('mousemove', el._magHandlers.onMove)
        el.removeEventListener('mouseleave', el._magHandlers.onLeave)
      }
    })
    items.length = 0
    cancelAnimationFrame(rafId)
  })
}

// Augment HTMLElement for handler storage
declare global {
  interface HTMLElement {
    _magHandlers?: { onMove: (e: MouseEvent) => void; onLeave: () => void }
  }
}
