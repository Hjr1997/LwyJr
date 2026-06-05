<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  console.error('[ErrorBoundary]', err)
  return false // prevent propagation
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <slot v-if="!hasError" />
  <div v-else class="error-fallback" role="alert" aria-live="assertive">
    <div class="error-icon">⚠️</div>
    <h2>出了点问题</h2>
    <p>页面加载遇到了意外错误，请尝试刷新。</p>
    <button class="btn btn-outline" @click="retry">🔄 重试</button>
  </div>
</template>

<style scoped>
.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px 24px;
  text-align: center;
  gap: 16px;
}
.error-icon { font-size: 3rem; }
.error-fallback h2 { font-size: 1.5rem; font-weight: 700; }
.error-fallback p { color: var(--text-secondary); font-size: 0.95rem; max-width: 400px; }
</style>
