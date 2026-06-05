<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="ex-overlay" @click.self="close">
        <div class="ex-sheet">
          <!-- Handle -->
          <div class="ex-handle" />
          <!-- Header -->
          <div class="ex-header">
            <h3 class="ex-title">{{ data.title }}</h3>
            <button class="ex-close" @click="close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(128,128,128,0.2)"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <!-- Body -->
          <div class="ex-body">
            <!-- 代码块 -->
            <div class="ex-section">
              <h4 class="ex-section-h">💻 代码示例</h4>
              <div class="ex-code-wrap">
                <div class="ex-lang-badge">{{ data.language || 'code' }}</div>
                <pre class="ex-code"><code>{{ data.code }}</code></pre>
                <button class="ex-copy" @click="copyCode">📋 复制</button>
              </div>
            </div>

            <!-- 执行步骤 -->
            <div v-if="data.steps?.length" class="ex-section">
              <h4 class="ex-section-h">📝 执行步骤</h4>
              <ol class="ex-steps">
                <li v-for="(step, i) in data.steps" :key="i">{{ step }}</li>
              </ol>
            </div>

            <!-- 输出/结果 -->
            <div v-if="data.output" class="ex-section">
              <h4 class="ex-section-h">▸ 输出结果</h4>
              <pre class="ex-output">{{ data.output }}</pre>
            </div>

            <!-- 拓展知识点 -->
            <div v-if="data.expand?.length" class="ex-section">
              <h4 class="ex-section-h">🚀 拓展知识</h4>
              <ul class="ex-expand">
                <li v-for="(item, i) in data.expand" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IQExample } from '@/data/interview-questions'

const visible = ref(false)
const data = ref<IQExample>({ title: '', code: '' })

function open(example: IQExample) {
  data.value = example
  visible.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  visible.value = false
  document.body.style.overflow = ''
}

function copyCode() {
  navigator.clipboard.writeText(data.value.code).then(() => {
    // brief feedback handled by button text
  })
}

defineExpose({ open, close })
</script>

<style scoped>
.ex-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(8px);
  padding: 16px;
}
.ex-sheet {
  background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border, #2a2a3e);
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,.4);
}
.ex-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(128,128,128,.3);
  margin: 10px auto 0;
}
@media(min-width:768px){ .ex-handle{display:none} }
.ex-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  gap: 12px;
  flex-shrink: 0;
}
.ex-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text, #e0e0e0);
}
.ex-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #888);
  padding: 4px;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background .2s;
}
.ex-close:hover { background: rgba(128,128,128,.15) }
.ex-body { padding: 16px 20px 24px; overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; }

.ex-section { margin-bottom: 20px; }
.ex-section:last-child { margin-bottom: 0; }
.ex-section-h {
  font-size: .82rem;
  font-weight: 700;
  color: var(--primary, #0071e3);
  margin: 0 0 10px;
}

.ex-code-wrap {
  position: relative;
  border-radius: 10px;
  border: 1px solid var(--border, #2a2a3e);
  overflow: hidden;
  background: var(--bg, #111);
}
.ex-lang-badge {
  position: absolute;
  top: 8px;
  right: 48px;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: .65rem;
  font-weight: 600;
  background: rgba(0,113,227,.15);
  color: var(--primary, #0071e3);
  text-transform: uppercase;
}
.ex-code {
  margin: 0;
  padding: 16px;
  padding-top: 32px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: .8rem;
  line-height: 1.7;
  overflow-x: auto;
  color: #c8d3d5;
  tab-size: 2;
}
.ex-copy {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: .7rem;
  color: var(--text-secondary, #888);
  padding: 2px 6px;
  border-radius: 4px;
  transition: all .2s;
}
.ex-copy:hover { background: rgba(128,128,128,.15); color: var(--text, #e0e0e0) }

.ex-steps {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary, #aaa);
  font-size: .82rem;
  line-height: 2;
}
.ex-steps li { padding-left: 4px; }
.ex-steps li::marker { color: var(--primary, #0071e3); font-weight: 700; }

.ex-output {
  margin: 0;
  padding: 12px 16px;
  background: rgba(0,113,227,.06);
  border: 1px solid rgba(0,113,227,.15);
  border-radius: 8px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: .8rem;
  color: var(--success, #42d392);
  line-height: 1.6;
}

.ex-expand {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary, #aaa);
  font-size: .82rem;
  line-height: 2;
}
.ex-expand li { padding-left: 4px; }
.ex-expand li::marker { color: var(--warning, #ff9f0a); font-weight: 700; }

/* transition */
.modal-fade-enter-active { transition: all .25s ease-out; }
.modal-fade-leave-active { transition: all .2s ease-in; }
.modal-fade-enter-from { opacity: 0; }
.modal-fade-enter-from .ex-sheet { transform: translateY(20px) scale(.97); }
.modal-fade-leave-to { opacity: 0; }
.modal-fade-leave-to .ex-sheet { transform: translateY(10px) scale(.98); }

/* mobile bottom sheet */
@media(max-width:768px){
  .ex-overlay { align-items: flex-end; padding: 0; }
  .ex-sheet {
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
  }
}
</style>
