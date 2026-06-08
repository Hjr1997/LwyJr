/**
 * 统一 body scroll lock — 阻止弹窗/Sheet 打开时背景页面滚动穿透
 *
 * 方案: overflow:hidden on html + body
 * - 移动端 iOS Safari 上仅仅 overflow:hidden 不够
 * - 加 touch-action:none 在 overlay 上彻底阻止
 * - 不用 position:fixed（会导致布局跳动和 Teleport 到 body 的元素异常）
 *
 * 用法:
 *   const { lock, unlock } = useBodyScrollLock()
 *   lock()   // 打开弹窗时调用
 *   unlock() // 关闭弹窗时调用（等 leave 动画完成后）
 */
export function useBodyScrollLock() {
  function lock() {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }

  function unlock() {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }

  return { lock, unlock }
}
