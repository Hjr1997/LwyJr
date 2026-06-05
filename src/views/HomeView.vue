<template>
  <div>
    <SpotlightWrapper v-if="!isMobile">
      <section class="hero-section">
      <div class="hero-content">
        <div class="hero-badge reveal-up">🚀 从零开始的编程之旅</div>
        <h1 class="hero-title">
          <span class="gradient-text">从 0 到前后端大牛</span>
        </h1>
        <p class="hero-subtitle reveal-up delay-2">
          <span ref="typewriterRef"></span><span class="cursor-blink">|</span>
        </p>
        <p class="hero-desc reveal-up delay-3">
          零基础 · 动画教学 · 实战演练 · 全套学习路径
        </p>
        <div class="hero-buttons reveal-up delay-3">
          <router-link to="/roadmap" class="btn btn-primary btn-glow">开始学习之旅</router-link>
          <router-link to="/gallery" class="btn btn-outline">探索动画特效</router-link>
        </div>
        <div class="hero-stats reveal-up delay-3">
          <div class="stat-item">
            <span class="stat-number"><CountUp :end="100" suffix="+" /></span>
            <span class="stat-label">动画特效</span>
          </div>
          <div class="stat-item">
            <span class="stat-number"><CountUp :end="50" suffix="+" /></span>
            <span class="stat-label">教程课时</span>
          </div>
          <div class="stat-item">
            <span class="stat-number"><CountUp :end="200" suffix="+" /></span>
            <span class="stat-label">代码示例</span>
          </div>
        </div>
      </div>
    </section>
    </SpotlightWrapper>
    <section v-if="isMobile" class="hero-section">
      <div class="hero-content">
        <div class="hero-badge reveal-up">🚀 从零开始的编程之旅</div>
        <h1 class="hero-title">
          <span class="gradient-text">从 0 到前后端大牛</span>
        </h1>
        <p class="hero-subtitle reveal-up delay-2">
          <span ref="typewriterRefMobile"></span><span class="cursor-blink">|</span>
        </p>
        <p class="hero-desc reveal-up delay-3">
          零基础 · 动画教学 · 实战演练 · 全套学习路径
        </p>
        <div class="hero-buttons reveal-up delay-3">
          <router-link to="/roadmap" class="btn btn-primary btn-glow">开始学习之旅</router-link>
          <router-link to="/gallery" class="btn btn-outline">探索动画特效</router-link>
        </div>
      </div>
    </section>

    <section class="section-padding">
      <h2 class="section-title reveal-up"><span class="gradient-text">为什么选择 LwyJr？</span></h2>
      <p class="section-subtitle reveal-up">一个专为零基础打造的全栈学习平台</p>

      <div class="features-grid container reveal-up">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <span class="feature-icon">{{ f.icon }}</span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section-padding preview-section">
      <h2 class="section-title reveal-up"><span class="gradient-text">平台预览</span></h2>
      <div class="preview-grid container reveal-up">
        <div v-for="p in previews" :key="p.title" class="preview-card" @click="$router.push(p.path)">
          <span class="preview-icon">{{ p.icon }}</span>
          <h3>{{ p.title }}</h3>
          <p>{{ p.desc }}</p>
          <span class="preview-link">进入 →</span>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CountUp from '@/components/CountUp.vue'
import SpotlightWrapper from '@/components/SpotlightWrapper.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { use3DTilt } from '@/composables/use3DTilt'
import { useMagneticCursor } from '@/composables/useMagneticCursor'
import { useReducedMotion } from '@/composables/useReducedMotion'

const { isMobile } = useReducedMotion()

useScrollReveal()
use3DTilt('.feature-card, .preview-card', { maxTilt: 6, scale: 1.03 })
useMagneticCursor('.btn-primary, .btn-outline', 4)

// 确保页面可见后强制触发 reveal（Splash 延迟了挂载）
onMounted(() => {
  // 双 rAF fallback：保证浏览器首次 paint 后，所有在视口内的 reveal 元素都获得 revealed
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-scale').forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) el.classList.add('revealed')
      })
    })
  })
})

const typewriterRef = ref<HTMLElement>()
const typewriterRefMobile = ref<HTMLElement>()

const sentences = [
  'HTML + CSS + JavaScript 从入门到精通',
  'Vue 3 框架 + TypeScript 实战开发',
  'Node.js 后端 + 全栈项目 = 大牛之路',
]

let sentenceIdx = 0
let charIdx = 0
let isDeleting = false
let typewriterTimer: ReturnType<typeof setTimeout> | null = null

function typewriter() {
  const el = typewriterRef.value || typewriterRefMobile.value
  if (!el) return

  const current = sentences[sentenceIdx]
  if (isDeleting) {
    el.textContent = current.substring(0, charIdx - 1)
    charIdx--
  } else {
    el.textContent = current.substring(0, charIdx + 1)
    charIdx++
  }

  let speed = isDeleting ? 30 : 80

  if (!isDeleting && charIdx === current.length) {
    speed = 2000
    isDeleting = true
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false
    sentenceIdx = (sentenceIdx + 1) % sentences.length
    speed = 300
  }

  typewriterTimer = setTimeout(typewriter, speed)
}

const features = [
  { icon: '📚', title: '系统化学习路径', desc: '从HTML到全栈的完整学习路线图，每一步都有详细教程和动画演示' },
  { icon: '🎬', title: '动画特效场', desc: '20+种顶级前端动画效果，附带源码和原理讲解，学会就能直接用到项目中' },
  { icon: '💻', title: '在线代码演练', desc: '内置代码编辑器，实时预览效果，边学边练，知识掌握更牢固' },
  { icon: '🛠', title: '技术栈展示', desc: '全面了解前端技术生态，清晰知道自己该学什么、该用什么' },
  { icon: '🎓', title: '零基础友好', desc: '从计算机基础讲起，每个概念都配有动画演示，真正从零开始' },
  { icon: '🚀', title: '实战导向', desc: '不只是理论，每个模块都有实战项目，学完就能做出完整的作品' },
]

const previews = [
  { icon: '🎬', title: '动画特效场', desc: '20+动画效果 + 源码', path: '/gallery' },
  { icon: '🗺️', title: '学习路径', desc: '从0到全栈完整路线', path: '/roadmap' },
  { icon: '🎓', title: '教程中心', desc: '图文+动画+代码三步学', path: '/tutorials' },
  { icon: '💻', title: '代码演练', desc: '在线编写+实时预览', path: '/playground' },
  { icon: '🛠', title: '技术栈', desc: '前端技术生态全景', path: '/techstack' },
]

onMounted(typewriter)
onUnmounted(() => { if (typewriterTimer) clearTimeout(typewriterTimer) })
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 28px;
  transition: all .35s var(--spring-smooth);
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 30px var(--glow-secondary);
  border-color: var(--primary);
}

.feature-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
}

.preview-section {
  background: var(--bg-card);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.preview-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all .35s var(--spring-smooth);
}

.preview-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg), 0 0 20px var(--glow-primary);
  transform: translateY(-2px);
}

.preview-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}

.preview-card h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.preview-card p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.preview-link {
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .feature-card { padding: 20px; }
  .preview-card { padding: 16px; }
  .features-grid { grid-template-columns: 1fr; gap: 12px; }
  .preview-grid { grid-template-columns: 1fr; gap: 12px; }
}
</style>
