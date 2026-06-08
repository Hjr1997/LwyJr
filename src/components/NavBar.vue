<template>
  <nav class="navbar" :class="{ scrolled }" role="navigation" aria-label="主导航">
    <div class="nav-container">
      <router-link to="/" class="nav-logo-animated" aria-label="LwyJr 首页">
        LwyJr
      </router-link>
       
      <ul class="nav-menu" :class="{ open: menuOpen }" role="menubar" :aria-expanded="menuOpen">
        <li v-for="item in navItems" :key="item.path" role="none">
          <router-link
            :to="item.path"
            class="nav-link"
            :class="{ active: currentPath === item.path }"
            role="menuitem"
            :tabindex="menuOpen ? 0 : -1"
            :data-prefetch="item.path !== '/' ? item.path : undefined"
            @click="menuOpen = false"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            {{ item.text }}
          </router-link>
        </li>
        <li>
          <button class="nav-search-btn-pc" @click="store.triggerSearch()" aria-label="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </li>
      </ul>
      <div class="nav-actions">
        <button class="nav-search-btn-mobile" @click="store.triggerSearch()" aria-label="搜索">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <DeskLamp />
        <button
          class="mobile-menu-btn"
          @click="menuOpen = !menuOpen"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="menuOpen"
          type="button"
        >
          <span aria-hidden="true">{{ menuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>
    </div>
    <div v-if="menuOpen" class="menu-backdrop" @click="menuOpen = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import DeskLamp from '@/components/DeskLamp.vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const route = useRoute()
const store = useAppStore()
const menuOpen = ref(false)
const scrolled = ref(false)

const currentPath = computed(() => route.path)

const { lock, unlock } = useBodyScrollLock()
watch(menuOpen, (v) => {
  if (v) lock(); else setTimeout(() => { unlock() }, 200)
})

const navItems = [
  { icon: '🏠', text: '首页', path: '/' },
  { icon: '🎬', text: '动画特效', path: '/gallery' },
  { icon: '🗺️', text: '学习路径', path: '/roadmap' },
  { icon: '📊', text: '学习进度', path: '/progress' },
  { icon: '🎓', text: '教程中心', path: '/tutorials' },
  { icon: '💻', text: '代码演练', path: '/playground' },
  { icon: '🛠', text: '技术栈', path: '/techstack' },
  { icon: '📋', text: '面试题', path: '/interview' },
]

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

// Close mobile menu on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.scrolled {
  box-shadow: var(--nav-scrolled-shadow);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-search-btn-pc {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all .25s var(--spring-bouncy);
  /* position: absolute;
  left: 100px;
  top: 10px; */
  z-index: 100001;
}
.nav-search-btn-pc:hover, .nav-search-btn-mobile:hover {
  color: var(--text);
  background: var(--hero-badge-bg);
}

.nav-search-btn-mobile {
  display: none;
}
.mobile-menu-btn {
  position: relative;
  z-index: 100001;
}
.menu-backdrop {
  display: none;
}
@media (max-width: 768px) {
  .menu-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    top: calc(var(--nav-height) + env(safe-area-inset-top, 0));
    background: rgba(0,0,0,.3);
    z-index: 999;
  }
  .nav-search-btn-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all .25s var(--spring-bouncy);
    z-index: 100001;
  }
  .nav-search-btn-pc {
    display: none;
  }
}
</style>
