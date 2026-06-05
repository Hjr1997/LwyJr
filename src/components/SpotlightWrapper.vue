<template>
  <div class="spotlight-wrapper" ref="wrapperRef">
    <div class="spotlight-glow" ref="glowRef"></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const wrapperRef = ref<HTMLElement>()
const glowRef = ref<HTMLElement>()

let rafId = 0
let currentX = 0, currentY = 0
let targetX = 0, targetY = 0

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function animate() {
  const glow = glowRef.value
  if (!glow) return

  currentX = lerp(currentX, targetX, 0.08)
  currentY = lerp(currentY, targetY, 0.08)

  glow.style.background = `radial-gradient(600px circle at ${currentX}px ${currentY}px, rgba(0,113,227,0.08), rgba(88,86,214,0.04) 30%, transparent 70%)`
  rafId = requestAnimationFrame(animate)
}

function onMove(e: MouseEvent) {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  targetX = e.clientX - rect.left
  targetY = e.clientY - rect.top
}

onMounted(() => {
  currentX = window.innerWidth / 2
  currentY = window.innerHeight / 2
  targetX = currentX
  targetY = currentY
  animate()
  document.addEventListener('mousemove', onMove, { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  document.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.spotlight-wrapper {
  position: relative;
  overflow: hidden;
}
.spotlight-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s;
}
</style>
