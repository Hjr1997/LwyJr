<template>
  <div class="section-padding" style="padding-top: var(--nav-height);">
    <h2 class="section-title reveal-up">
      <span class="gradient-text">🎬 动画特效场</span>
    </h2>
    <p class="section-subtitle reveal-up">精选 20+ 顶级前端动画效果，点击卡片查看真实演示与可编辑源码</p>

    <div class="gallery-filters reveal-up">
      <button v-for="f in filters" :key="f.value" class="filter-btn" :class="{ active: activeFilter === f.value }" @click="activeFilter = f.value">{{ f.label }}</button>
    </div>

    <div class="gallery-grid">
      <div v-for="item in filteredAnimations" :key="item.id" class="gallery-card" @click="openModal(item)">
        <span class="card-icon">{{ item.icon }}</span>
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.desc }}</p>
        <div class="card-tags">
          <span class="tag tag-category">{{ item.category.toUpperCase() }}</span>
          <span class="tag tag-difficulty">🎯 {{ item.difficulty }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="selectedAnim" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content animate-bounce-in">
          <button class="modal-close" @click="closeModal">✕</button>
          <div class="modal-body">
            <div class="modal-preview-panel">
              <div class="panel-header">
                <span>🎬 实时演示</span>
                <button class="btn-run" @click="runPreview">▶ 运行</button>
              </div>
              <div class="preview-iframe-wrap">
                <iframe
                  :key="'preview-' + (selectedAnim?.id || 0)"
                  ref="modalPreviewFrame"
                  class="preview-iframe"
                  sandbox="allow-scripts allow-same-origin allow-modals"
                ></iframe>
              </div>
            </div>
            <div class="modal-code-panel">
              <h3>{{ selectedAnim.title }}</h3>
              <p class="modal-desc">{{ selectedAnim.desc }}</p>
              <div class="code-tabs">
                <button v-for="t in (['html','css','js'] as const)" :key="t" class="code-tab-btn" :class="{ active: activeCodeTab === t }" @click="activeCodeTab = t">{{ t.toUpperCase() }}</button>
              </div>
              <textarea v-model="editCode[activeCodeTab]" class="code-textarea" spellcheck="false"></textarea>
              <div class="modal-meta">
                <span>分类: {{ selectedAnim.category }}</span>
                <span>难度: {{ selectedAnim.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive, watch } from 'vue'
import { animations, type AnimationItem } from '@/data/animations'
import { use3DTilt } from '@/composables/use3DTilt'

use3DTilt('.gallery-card', { maxTilt: 8, scale: 1.04, perspective: 1000 })

const activeFilter = ref('all')
const activeCodeTab = ref<'html' | 'css' | 'js'>('html')
const selectedAnim = ref<AnimationItem | null>(null)
const modalPreviewFrame = ref<HTMLIFrameElement | null>(null)
const editCode = reactive({ html: '', css: '', js: '' })

const filters = [
  { label: '全部', value: 'all' },
  { label: 'CSS 动画', value: 'css' },
  { label: 'Canvas', value: 'canvas' },
  { label: 'SVG', value: 'svg' },
  { label: '3D 效果', value: '3d' },
  { label: '文字特效', value: 'text' },
]

const filteredAnimations = computed(() =>
  activeFilter.value === 'all' ? animations : animations.filter((a) => a.category === activeFilter.value)
)

function openModal(item: AnimationItem) {
  selectedAnim.value = item
  activeCodeTab.value = 'html'
  editCode.html = item.html
  editCode.css = item.css
  editCode.js = item.js
  // Wait for iframe to mount via watcher
}

// Watch for selectedAnim change to run preview after iframe mounts
watch(selectedAnim, (anim) => {
  if (anim) {
    // Use setTimeout to ensure iframe is rendered after Teleport + key change
    setTimeout(() => {
      runPreview()
    }, 100)
  }
})

function closeModal() {
  selectedAnim.value = null
}

function runPreview() {
  const iframe = modalPreviewFrame.value
  if (!iframe) {
    console.warn('iframe not ready, retrying...')
    setTimeout(() => runPreview(), 200)
    return
  }
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    console.warn('contentDocument not available')
    return
  }
  const h = editCode.html || selectedAnim.value?.html || ''
  const c = editCode.css || selectedAnim.value?.css || ''
  const j = editCode.js || selectedAnim.value?.js || ''
  doc.open()
  doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;overflow-x:hidden;font-family:sans-serif}${c}</style></head><body>${h}<script type="module">${j}<\/script></body></html>`)
  doc.close()
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed') }) }, { threshold: 0.1 })
  document.querySelectorAll('.gallery-card').forEach((el) => observer.observe(el))
})
</script>

<style scoped>
.modal-body { display: grid; grid-template-columns: 1fr 1fr; min-height: 500px; }
@media (max-width: 768px) { .modal-body { grid-template-columns: 1fr; } }
.modal-preview-panel { background: var(--preview-bg); display: flex; flex-direction: column; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; color: var(--preview-header-text); font-size: 0.85rem; border-bottom: 1px solid var(--preview-border); }
.btn-run { padding: 6px 18px; background: linear-gradient(135deg, #4ade80, #22c55e); color: #000; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
.btn-run:hover { transform: scale(1.05); box-shadow: 0 0 12px rgba(74,222,128,0.5); }
.preview-iframe-wrap { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.preview-iframe { width: 100%; height: 100%; border: none; background: var(--preview-bg); min-height: 350px; }
.modal-code-panel { padding: 24px; display: flex; flex-direction: column; overflow-y: auto; max-height: 80vh; }
.modal-code-panel h3 { font-size: 1.3rem; margin-bottom: 6px; }
.modal-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; }
.code-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
.code-tab-btn { padding: 5px 14px; border-radius: 6px; background: var(--bg); border: 1px solid var(--border); font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all var(--transition); }
.code-tab-btn.active { background: var(--primary); color: var(--btn-inverted-text); border-color: var(--primary); }
.code-textarea { flex: 1; min-height: 280px; background: var(--code-bg); color: var(--code-text); border: none; border-radius: 8px; padding: 14px; font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.82rem; line-height: 1.6; resize: vertical; outline: none; white-space: pre-wrap; }
.modal-meta { display: flex; gap: 16px; margin-top: 12px; font-size: 0.78rem; color: var(--text-secondary); }
</style>
