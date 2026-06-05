import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer: IntersectionObserver | null = null

  const revealCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
      }
    })
  }

  onMounted(() => {
    // 双 rAF 确保浏览器已完成首次绘制（paint 了 opacity:0 的初始状态），
    // 此时再创建 IntersectionObserver 才能正确触发 transition 动画。
    // 否则 observer 可能在首次 paint 前同步触发，
    // 导致浏览器跳过 opacity:0 → 1 的过渡，元素直接变为 revealed 态。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        observer = new IntersectionObserver(revealCallback, {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        })

        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach((el) => {
          observer!.observe(el)
        })
      })
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })
}
