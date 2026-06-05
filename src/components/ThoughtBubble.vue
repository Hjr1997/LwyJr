<template>
  <Teleport to="body">
    <transition name="bubble">
      <div v-if="visible" class="thought-bubble" :class="[`action-${thought?.action || 'idle'}`, { thinking: isThinking }]">
        <span class="bubble-tail"></span>
        <span class="bubble-text">{{ displayText }}</span>
        <span v-if="isThinking" class="bubble-dots">
          <i></i><i></i><i></i>
        </span>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  thought: { text: string; action: string } | null
  isThinking: boolean
}>()

const visible = ref(false)
const typedIdx = ref(0)

const displayText = computed(() => {
  if (!props.thought) return ''
  return props.thought.text.slice(0, typedIdx.value)
})

// Typewriter effect + show/hide
let typeTimer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.thought, (newVal, oldVal) => {
  // Cleanup
  if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }

  if (!newVal) {
    visible.value = false
    typedIdx.value = 0
    return
  }

  // Don't re-trigger for same thought
  if (oldVal && oldVal.text === newVal.text) return

  visible.value = true
  typedIdx.value = 0

  // Typewriter
  typeTimer = setInterval(() => {
    if (typedIdx.value < (newVal.text?.length || 0)) {
      typedIdx.value++
    } else {
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
    }
  }, 60)
})
</script>

<style scoped>
.thought-bubble {
  position: fixed;
  bottom: 16vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 260px;
  text-align: center;
  line-height: 1.5;
  pointer-events: none;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Theme-aware */
:root:not([data-theme="dark"]) .thought-bubble,
[data-theme="light"] .thought-bubble {
  background: rgba(255, 255, 255, 0.85);
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
[data-theme="dark"] .thought-bubble {
  background: rgba(30, 30, 32, 0.85);
  color: #f5f5f7;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Tail */
.bubble-tail {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
:root:not([data-theme="dark"]) .bubble-tail,
[data-theme="light"] .bubble-tail {
  background: rgba(255, 255, 255, 0.85);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
[data-theme="dark"] .bubble-tail {
  background: rgba(30, 30, 32, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* Action modifiers */
.action-wave .bubble-text { animation: waveShake 0.5s ease; }
.action-excited { animation: excitedBounce 0.4s ease; }
.action-think .bubble-text::after { content: ' 🤔'; }
.action-sleepy .bubble-text::after { content: ' 💤'; }
.action-nod .bubble-text::after { content: ' 👍'; }

@keyframes waveShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes excitedBounce {
  0% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.08); }
  100% { transform: translateX(-50%) scale(1); }
}

/* Thinking dots */
.bubble-dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
  vertical-align: middle;
}
.bubble-dots i {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  animation: dotPulse 1.2s ease infinite;
}
:root:not([data-theme="dark"]) .bubble-dots i,
[data-theme="light"] .bubble-dots i { background: #888; }
[data-theme="dark"] .bubble-dots i { background: #aaa; }
.bubble-dots i:nth-child(2) { animation-delay: 0.2s; }
.bubble-dots i:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

/* Transition */
.bubble-enter-active {
  transition: all 0.4s cubic-bezier(.34, 1.56, .64, 1);
}
.bubble-leave-active {
  transition: all 0.3s cubic-bezier(.4, 0, .2, 1);
}
.bubble-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px) scale(0.85);
}
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.9);
}
</style>
