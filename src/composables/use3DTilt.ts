import { onMounted, onUnmounted } from 'vue'

export interface TiltOptions {
  maxTilt?: number   // degrees, default 8
  perspective?: number // px, default 800
  scale?: number      // hover scale, default 1.02
  speed?: number      // transition duration in ms, default 400
}

export function use3DTilt(selector: string, opts: TiltOptions = {}) {
  const { maxTilt = 8, perspective = 800, scale = 1.02, speed = 400 } = opts
  const listeners: Array<{ el: HTMLElement; onMove: (e: MouseEvent) => void; onLeave: () => void }> = []

  function bind(el: HTMLElement) {
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        const tiltX = (y - 0.5) * -maxTilt
        const tiltY = (x - 0.5) * maxTilt
        el.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale},${scale},${scale})`
      })
    }

    const onLeave = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
      })
    }

    // preserve existing transition
    const prevTransition = el.style.transition
    el.style.transition = prevTransition
      ? `transform ${speed}ms cubic-bezier(.16,1,.3,1), ${prevTransition}`
      : `transform ${speed}ms cubic-bezier(.16,1,.3,1)`
    el.style.transformStyle = 'preserve-3d'
    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    listeners.push({ el, onMove, onLeave })
  }

  const cleanup = () => {
    listeners.forEach(({ el, onMove, onLeave }) => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    })
    listeners.length = 0
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) return
    document.querySelectorAll<HTMLElement>(selector).forEach(bind)
  })

  onUnmounted(cleanup)

  return { refresh: () => { cleanup(); document.querySelectorAll<HTMLElement>(selector).forEach(bind) } }
}
