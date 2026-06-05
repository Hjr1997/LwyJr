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
      </ul>
      <div class="nav-actions">
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
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DeskLamp from '@/components/DeskLamp.vue'

const route = useRoute()
const menuOpen = ref(false)
const scrolled = ref(false)

const currentPath = computed(() => route.path)

const navItems = [
  { icon: '🏠', text: '首页', path: '/' },
  { icon: '🎬', text: '动画特效', path: '/gallery' },
  { icon: '🗺️', text: '学习路径', path: '/roadmap' },
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
</style>
