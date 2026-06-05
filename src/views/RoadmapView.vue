<template>
  <div class="section-padding page-in" style="padding-top: var(--nav-height);">
    <h2 class="section-title reveal-up">
      <span class="gradient-text">🗺️ 从0到1学习路径</span>
    </h2>
    <p class="section-subtitle reveal-up">15个阶段，系统化从零基础到全栈工程师 · 点击卡片跳转到对应教程</p>

    <div class="phase-legend reveal-up">
      <div v-for="p in phases" :key="p.name" class="legend-item">
        <span class="legend-dot" :style="{ background: p.color }"></span>
        <span>{{ p.name }}</span>
      </div>
    </div>

    <div class="roadmap-container">
      <div class="roadmap-line"></div>

      <div
        v-for="(step, idx) in roadmapSteps"
        :key="step.id"
        class="roadmap-step"
      >
        <div
          class="roadmap-dot"
          :style="{ background: step.phaseColor, color: step.phaseColor }"
        ></div>

        <div class="roadmap-card" @click="goToTutorial(step)">
          <div class="phase" :style="{ color: step.phaseColor }">{{ step.phase }}</div>
          <h3>{{ step.icon }} {{ step.title }}</h3>
          <div class="duration">⏱ 预计学习: {{ step.duration }}</div>
          <p>{{ step.desc }}</p>
          <div class="roadmap-skills">
            <span v-for="s in step.skills" :key="s">{{ s }}</span>
          </div>
          <div class="roadmap-hint">点击学习 →</div>
        </div>
      </div>
    </div>

    <!-- Expanded step detail -->
    <Teleport to="body">
      <div v-if="expandedStep" class="modal-overlay" @click.self="expandedStep = null">
        <div class="detail-modal animate-bounce-in">
          <button class="modal-close" @click="expandedStep = null">✕</button>
          <h3>{{ expandedStep.icon }} {{ expandedStep.title }}</h3>
          <div class="detail-phase" :style="{ color: expandedStep.phaseColor }">{{ expandedStep.phase }}</div>
          <p class="detail-desc">{{ expandedStep.content }}</p>
          <div class="detail-meta">
            <span>⏱ {{ expandedStep.duration }}</span>
          </div>
          <div class="detail-skills">
            <h4>学习技能:</h4>
            <div class="skill-cloud">
              <span v-for="s in expandedStep.skills" :key="s" class="skill-tag">{{ s }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <router-link :to="getTutorialLink(expandedStep)" class="btn btn-primary btn-glow" @click="expandedStep = null">
              🚀 开始学习此阶段
            </router-link>
            <button class="btn btn-outline" @click="expandedStep = null">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="roadmap-cta reveal-up" style="text-align:center; margin-top: 48px;">
      <p style="font-size:1.2rem; margin-bottom:16px; color:var(--text-secondary);">
        🎯 准备好了吗？现在就开始你的编程之旅吧！
      </p>
      <router-link to="/tutorials" class="btn btn-primary btn-glow">进入教程中心 →</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { roadmapSteps } from '@/data/roadmap'
import { use3DTilt } from '@/composables/use3DTilt'

use3DTilt('.roadmap-card', { maxTilt: 5, scale: 1.02 })

const router = useRouter()
const expandedStep = ref<typeof roadmapSteps[0] | null>(null)

const phases = [
  { name: '启蒙阶段', color: '#4ade80' },
  { name: '成长阶段', color: '#60a5fa' },
  { name: '开花阶段', color: '#f59e0b' },
  { name: '结果阶段', color: '#ef4444' },
  { name: '大牛阶段', color: '#8b5cf6' },
]

// Map roadmap steps to tutorial categories
const stepToCategory: Record<number, string> = {
  1: 'internet', // 认识互联网 -> 互联网基础
  2: 'html',      // HTML基础
  3: 'css',       // CSS入门
  4: 'css',       // CSS进阶
  5: 'js',        // JS基础
  6: 'js',        // JS进阶
  7: 'canvas',    // Canvas/SVG
  8: 'build',     // 构建工具
  9: 'vue3',      // Vue 3
  10: 'ts',       // TypeScript
  11: 'project',  // 项目实战
  12: 'node',     // Node.js
  13: 'db',       // 数据库
  14: 'fullstack',// 前后端联调
  15: 'fullstack',// 全栈实战
}

function goToTutorial(step: typeof roadmapSteps[0]) {
  expandedStep.value = step
}

function getTutorialLink(step: typeof roadmapSteps[0]): string {
  const cat = stepToCategory[step.id] || 'html'
  return `/tutorials?tab=${cat}`
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('revealed')
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.roadmap-step').forEach((el) => observer.observe(el))
})
</script>

<style scoped>
.phase-legend { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.roadmap-cta { background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; border: 1px solid var(--border); }

.roadmap-hint {
  font-size: 0.75rem; color: var(--primary); margin-top: 8px;
  opacity: 0; transform: translateX(-4px);
  transition: all 0.3s;
}
.roadmap-card:hover .roadmap-hint {
  opacity: 1; transform: translateX(0);
}

/* Detail Modal */
.detail-modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  max-width: 550px;
  width: 100%;
  padding: 32px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}
.detail-modal h3 { font-size: 1.4rem; margin-bottom: 4px; }
.detail-phase { font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
.detail-desc { color: var(--text-secondary); line-height: 1.7; margin-bottom: 12px; }
.detail-meta { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px; }
.detail-skills h4 { font-size: 0.9rem; margin-bottom: 8px; }
.skill-cloud { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.skill-tag { padding: 4px 12px; background: rgba(102,126,234,0.1); color: var(--primary); border-radius: 6px; font-size: 0.78rem; }
.detail-actions { display: flex; gap: 12px; }
</style>
