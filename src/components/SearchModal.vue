<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div v-if="isOpen" class="search-overlay" @click.self="close">
        <div class="search-modal">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              ref="inputRef"
              v-model="query"
              class="search-input"
              placeholder="搜索教程、动画、技术..."
              @keydown.down.prevent="moveDown"
              @keydown.up.prevent="moveUp"
              @keydown.enter="selectActive"
              @keydown.escape="close"
            />
            <kbd class="search-kbd">ESC</kbd>
          </div>
          <div v-if="results.length" class="search-results">
            <div
              v-for="(item, idx) in results"
              :key="item.id"
              class="search-item"
              :class="{ active: idx === activeIdx }"
              @click="go(item)"
              @mouseenter="activeIdx = idx"
            >
              <span class="search-item-icon">{{ item.icon }}</span>
              <div class="search-item-body">
                <div class="search-item-title">{{ item.title }}</div>
                <div class="search-item-desc">{{ item.category }}</div>
              </div>
              <span class="search-item-type">{{ item.type }}</span>
            </div>
          </div>
          <div v-else-if="query.length > 0" class="search-empty">
            <span>没有找到匹配结果</span>
          </div>
          <div v-else class="search-hint">
            <span>输入关键词搜索教程、动画效果、技术栈</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { tutorials } from '@/data/tutorials'
import { animations } from '@/data/animations'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

interface SearchResult {
  id: string
  title: string
  category: string
  icon: string
  type: string
  route: string
  routeQuery?: string
}

const router = useRouter()
const store = useAppStore()
const isOpen = ref(false)
const query = ref('')
const activeIdx = ref(0)
const inputRef = ref<HTMLInputElement>()

const categoryIcons: Record<string, string> = {
  html: '📄', css: '🎨', js: '⚡', ts: '🔷', vue3: '💚', react: '⚛️',
  pinia: '🧩', zustand: '🗄', dva: '🔷', vite: '⚡', node: '🟢', fullstack: '🔗',
}

const results = computed<SearchResult[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const items: SearchResult[] = []

  // Search tutorials
  for (const t of tutorials) {
    if (t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) {
      items.push({
        id: t.id, title: t.title, category: t.category,
        icon: t.icon || categoryIcons[t.category] || '📚',
        type: '教程', route: '/tutorials', routeQuery: t.category,
      })
    }
    for (const s of t.steps) {
      if (s.title.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)) {
        items.push({
          id: s.id, title: `${t.title} › ${s.title}`, category: t.category,
          icon: categoryIcons[t.category] || '📚',
          type: '步骤', route: '/tutorials', routeQuery: t.category,
        })
      }
    }
  }

  // Search animations
  for (const a of animations) {
    if (a.title.toLowerCase().includes(q) || a.desc?.toLowerCase().includes(q)) {
      items.push({
        id: String(a.id), title: a.title, category: a.category,
        icon: a.icon || '🎬',
        type: '动画', route: '/gallery',
      })
    }
  }

  return items.slice(0, 12)
})

function open() {
  isOpen.value = true
  query.value = ''
  activeIdx.value = 0
  nextTick(() => inputRef.value?.focus())
}

function close() {
  isOpen.value = false
}

function moveDown() {
  if (results.value.length) activeIdx.value = Math.min(activeIdx.value + 1, results.value.length - 1)
}

function moveUp() {
  activeIdx.value = Math.max(activeIdx.value - 1, 0)
}

function selectActive() {
  if (results.value[activeIdx.value]) go(results.value[activeIdx.value])
}

function go(item: SearchResult) {
  close()
  if (item.routeQuery) {
    router.push({ path: item.route, query: { tab: item.routeQuery } })
  } else {
    router.push(item.route)
  }
}

// Global shortcut: Cmd/Ctrl + K
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value ? close() : open()
  }
}

const { lock, unlock } = useBodyScrollLock()

watch(isOpen, (v) => {
  if (v) lock(); else setTimeout(() => { unlock() }, 250)
})

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
}

// Watch store searchEvent to open from NavBar
watch(() => store.searchEvent, () => { if (!isOpen.value) open() })

defineExpose({ open })
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  touch-action: none;
  z-index: 1000000;
  background: var(--modal-overlay-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: min(20vh, 160px);
}
.search-modal {
  width: min(560px, 92vw);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}
.search-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text);
  font-family: inherit;
}
.search-input::placeholder { color: var(--text-tertiary); }
.search-kbd {
  padding: 2px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-family: inherit;
  flex-shrink: 0;
}
.search-results {
  max-height: 360px;
  overflow-y: auto;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background .15s;
}
.search-item:hover,
.search-item.active {
  background: var(--hero-badge-bg);
}
.search-item-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.search-item-body {
  flex: 1;
  min-width: 0;
}
.search-item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-item-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}
.search-item-type {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--tag-bg);
  color: var(--primary);
  flex-shrink: 0;
}
.search-empty,
.search-hint {
  padding: 32px 18px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .search-overlay { padding-top: min(10vh, 80px); }
  .search-results { max-height: calc(60vh - 80px); }
  .search-modal { padding-bottom: env(safe-area-inset-bottom, 0); }
}
</style>
<!-- Transition (unscoped for Vue dynamic classes) -->
<style>
/* 基础状态：overlay 常驻 backdrop-filter */
.search-overlay {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.search-overlay-enter-active{transition:opacity .4s cubic-bezier(.34,1.56,.64,1),backdrop-filter .4s ease,-webkit-backdrop-filter .4s ease}
.search-overlay-enter-active .search-modal{transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .4s cubic-bezier(.34,1.56,.64,1)}
.search-overlay-enter-from{opacity:0;backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px)}
.search-overlay-enter-from .search-modal{opacity:0;transform:translateY(-20px) scale(.95)}
.search-overlay-leave-active{transition:opacity .25s ease,backdrop-filter .25s ease,-webkit-backdrop-filter .25s ease}
.search-overlay-leave-active .search-modal{transition:transform .25s cubic-bezier(.4,0,.2,1),opacity .25s ease}
.search-overlay-leave-to{opacity:0;backdrop-filter:none;-webkit-backdrop-filter:none;transform:none}
.search-overlay-leave-to .search-modal{opacity:0;transform:translateY(-6px) scale(.97)}
</style>
