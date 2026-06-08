<template>
  <div class="app">
    <!-- Accessibility: keyboard skip-to-content -->
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <WebGLBackground />
    <SplineScene v-if="!isMobile" scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" :robotAction="robotAction" :thought="robotThought" :isThinking="robotThinking" :onRobotInteract="triggerThought" />
    <div class="scroll-progress-bar" :style="{ transform: `scaleX(${scrollProgress})` }"></div>
    <NavBar />
    <SearchModal ref="searchModal" />
    <AuthModal />
    <main id="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <Suspense>
            <ErrorBoundary>
              <component :is="Component" />
            </ErrorBoundary>
            <template #fallback>
              <div class="page-skeleton">
                <div class="skeleton-hero"></div>
                <div class="skeleton-grid">
                  <div v-for="i in 6" :key="i" class="skeleton-card"></div>
                </div>
              </div>
            </template>
          </Suspense>
        </template>
      </router-view>
    </main>
    <FooterSection />
    <FloatingAuth />
    <FloatingChatBot />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed, onMounted, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import FooterSection from '@/components/FooterSection.vue'
import WebGLBackground from '@/components/WebGLBackground.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import FloatingChatBot from '@/components/FloatingChatBot.vue'
import SearchModal from '@/components/SearchModal.vue'
import AuthModal from '@/components/AuthModal.vue'
import FloatingAuth from '@/components/FloatingAuth.vue'
import { useScrollProgress } from '@/composables/useScrollProgress'
import { useRobotMind } from '@/composables/useRobotMind'
import { useReducedMotion } from '@/composables/useReducedMotion'

const searchModal = ref<InstanceType<typeof SearchModal> | null>(null)

const SplineScene = defineAsyncComponent(() => import('@/components/SplineScene.vue'))
const { progress: scrollProgress } = useScrollProgress()
const { thought: robotThought, isThinking: robotThinking, triggerThought } = useRobotMind()
const { isMobile } = useReducedMotion()

const robotAction = computed(() => robotThought.value?.action || null)

onMounted(() => {
  // Smart route prefetch: load views as user scrolls near nav links
  const prefetchMap: Record<string, () => Promise<unknown>> = {
    '/gallery': () => import('@/views/GalleryView.vue'),
    '/roadmap': () => import('@/views/RoadmapView.vue'),
    '/tutorials': () => import('@/views/TutorialView.vue'),
    '/playground': () => import('@/views/PlaygroundView.vue'),
    '/techstack': () => import('@/views/TechStackView.vue'),
  }
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-prefetch]')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const path = (entry.target as HTMLAnchorElement).dataset.prefetch
        if (path) { prefetchMap[path]?.(); observer.unobserve(entry.target) }
      }
    })
  }, { rootMargin: '200px' })
  links.forEach(l => observer.observe(l))
})
</script>

<style>
.app { position: relative; min-height: 100vh; }

/* Ensure scrollable content is above fixed Spline 3D background (z-index 1) */
.app > main,
.app > footer { position: relative; z-index: 2; }

/* Scroll progress bar — theme-aware */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--gradient-text);
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1001;
  transition: transform 0.1s linear, background .5s var(--spring-smooth);
}

/* Page transitions */
.page-enter-active,
.page-enter-active { transition: opacity .35s cubic-bezier(.16,1,.3,1), transform .35s cubic-bezier(.16,1,.3,1); }
.page-leave-active { transition: opacity .15s cubic-bezier(.4,0,.2,1); }
.page-enter-from { opacity: 0; transform: translateY(16px); }
.page-leave-to { opacity: 0; }

/* Skeleton loading */
.page-skeleton {
  padding: 120px 24px 60px;
  max-width: var(--max-width);
  margin: 0 auto;
}
.skeleton-hero {
  height: 280px;
  border-radius: var(--radius-xl);
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 40px;
}
@media (max-width: 640px) {
  .skeleton-hero { height: 160px; margin-bottom: 24px; }
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
.skeleton-card {
  height: 180px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  animation-delay: calc(var(--i) * 100ms);
}
.skeleton-grid .skeleton-card:nth-child(1) { --i: 0; }
.skeleton-grid .skeleton-card:nth-child(2) { --i: 1; }
.skeleton-grid .skeleton-card:nth-child(3) { --i: 2; }
.skeleton-grid .skeleton-card:nth-child(4) { --i: 3; }
.skeleton-grid .skeleton-card:nth-child(5) { --i: 4; }
.skeleton-grid .skeleton-card:nth-child(6) { --i: 5; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Accessibility: Skip-to-content link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 12px 24px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 10000;
  transition: top 0.2s, background .5s var(--spring-smooth);
}
.skip-link:focus {
  top: 8px;
  outline: none;
  box-shadow: 0 0 0 4px var(--focus-ring-soft);
}
</style>
