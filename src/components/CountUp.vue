<template>
  <span class="stat-number">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{ end: number; suffix?: string; duration?: number }>(), {
  suffix: '',
  duration: 2000,
})

const display = ref('0')

onMounted(() => {
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(eased * props.end)
    display.value = current + props.suffix

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
})
</script>
