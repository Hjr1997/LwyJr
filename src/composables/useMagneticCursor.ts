import { onMounted, onUnmounted } from 'vue'

const handlerMap = new WeakMap<HTMLElement, { onMove: (e: MouseEvent) => void; onLeave: () => void }>()

export function useMagneticCursor(selector: string, strength = 8) {
  const items: HTMLElement[] = []

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
    handlerMap.set(el, { onMove, onLeave })
  }

  onMounted(() => {
    document.querySelectorAll<HTMLElement>(selector).forEach(bind)
  })

  onUnmounted(() => {
    items.forEach((el) => {
      const handlers = handlerMap.get(el)
      if (handlers) {
        el.removeEventListener('mousemove', handlers.onMove)
        el.removeEventListener('mouseleave', handlers.onLeave)
        handlerMap.delete(el)
      }
    })
    items.length = 0
  })
}
