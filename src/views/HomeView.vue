<template>
  <div>
    <component :is="isMobile ? 'div' : SpotlightWrapper">
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
          <div v-if="!isMobile" class="hero-stats reveal-up delay-3">
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
    </component>

    <!-- 学习进度仪表盘 -->
    <section v-if="!auth.isLoggedIn" class="section-padding progress-section reveal-up">
      <h2 class="section-title"><span class="gradient-text">📊 学习进度</span></h2>
      <div class="login-prompt-card container">
        <span class="login-prompt-icon">🔒</span>
        <h3>登录后追踪学习进度</h3>
        <p>登录账号后可以保存学习记录、获得成就徽章、同步跨设备进度</p>
        <button class="btn btn-primary" @click="auth.openLogin()">登录 / 注册</button>
      </div>
    </section>
    <section v-else class="section-padding progress-section reveal-up">
      <h2 class="section-title"><span class="gradient-text">📊 我的学习进度</span></h2>
      <div class="progress-dashboard container">
        <!-- 总进度环 -->
        <div class="progress-ring-card">
          <div class="progress-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" stroke-width="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#pg)" stroke-width="8"
                stroke-linecap="round" :stroke-dasharray="329" :stroke-dashoffset="329 - (329 * store.tutorialProgress / 100)"
                transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s var(--spring-smooth)"/>
              <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0071e3"/><stop offset="100%" stop-color="#5856d6"/>
              </linearGradient></defs>
            </svg>
            <div class="progress-ring-text">
              <span class="pr-num">{{ store.tutorialProgress }}%</span>
              <span class="pr-label">完成度</span>
            </div>
          </div>
          <div class="progress-stats">
            <div class="pstat"><span class="pstat-num">{{ totalDone }}</span><span class="pstat-lbl">已完成步骤</span></div>
            <div class="pstat"><span class="pstat-num">{{ store.totalSteps }}</span><span class="pstat-lbl">总步骤数</span></div>
            <div class="pstat"><span class="pstat-num">🔥 {{ store.streakDays }}</span><span class="pstat-lbl">连续学习天数</span></div>
          </div>
          <!-- 学习提醒开关 -->
          <div class="reminder-box">
            <div class="reminder-row" @click="handleReminderToggle">
              <span class="reminder-icon">🔔</span>
              <span class="reminder-label">每日学习提醒</span>
              <span class="reminder-toggle" :class="{on:store.reminderEnabled}"></span>
            </div>
            <div v-if="store.reminderEnabled" class="reminder-time-row">
              <span class="reminder-time-label">提醒时间</span>
              <select class="reminder-time-select" :value="store.reminderHour" @change="store.setReminderHour(+($event.target as HTMLSelectElement).value)">
                <option v-for="h in 12" :key="h" :value="h+7">{{h+7}}:00</option>
              </select>
            </div>
          </div>
        </div>
        <!-- 分类进度 -->
        <div class="progress-bars-card">
          <h4 class="pr-bars-title">各分类进度</h4>
          <div v-for="(info, cat) in topCategories" :key="cat" class="pr-bar-row">
            <span class="pr-bar-label">{{ catLabel(cat) }}</span>
            <div class="pr-bar-track">
              <div class="pr-bar-fill" :style="{width: (info.done/info.total*100)+'%'}"></div>
            </div>
            <span class="pr-bar-num">{{ info.done }}/{{ info.total }}</span>
          </div>
        </div>
      </div>
      <!-- 成就徽章 -->
      <div v-if="store.unlockedBadges.length > 0" class="badges-card reveal-up">
        <h4 class="pr-bars-title">🏅 已解锁成就</h4>
        <div class="badges-grid">
          <div v-for="b in store.unlockedBadges" :key="b.id" class="badge-item" :title="b.desc">
            <span class="badge-icon">{{ b.icon }}</span>
            <span class="badge-name">{{ b.name }}</span>
          </div>
        </div>
        <div v-if="store.nextBadge" class="next-badge">
          下一个成就：{{ store.nextBadge.icon }} {{ store.nextBadge.name }} — {{ store.nextBadge.progress }}/{{ store.nextBadge.need }} 步
          <div class="badge-progress-bar"><div class="badge-progress-fill" :style="{width:(store.nextBadge.progress/store.nextBadge.need*100)+'%'}"></div></div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CountUp from '@/components/CountUp.vue'
import SpotlightWrapper from '@/components/SpotlightWrapper.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { use3DTilt } from '@/composables/use3DTilt'
import { useMagneticCursor } from '@/composables/useMagneticCursor'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useLearningReminder } from '@/composables/useLearningReminder'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const store = useAppStore()
const auth = useAuthStore()
const { isMobile } = useReducedMotion()
const { requestPermission, sendReminder } = useLearningReminder()

// 学习提醒切换
async function handleReminderToggle() {
  if (!store.reminderEnabled) {
    const granted = await requestPermission()
    if (!granted) { alert('请在浏览器设置中开启通知权限，才能接收学习提醒。'); return }
  }
  store.toggleReminder()
  if (store.reminderEnabled) {
    sendReminder('🔔 学习提醒已开启', `每天 ${store.reminderHour}:00 左右提醒你学习，加油！`)
  }
}

// 进度仪表盘数据
const totalDone = computed(() => store.tutorialCompleted.size)
const topCategories = computed(() => {
  const cp = store.categoryProgress
  return Object.entries(cp)
    .filter(([,v]) => v.total > 0)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 6)
    .reduce((acc, [k, v]) => { acc[k] = v; return acc }, {} as Record<string, {done:number;total:number}>)
})

const catLabels: Record<string, string> = {
  html: '📄 HTML', css: '🎨 CSS', js: '⚡ JavaScript', ts: '🔷 TypeScript',
  vue3: '💚 Vue 3', react2: '⚛️ React', node: '🟢 Node.js', vite: '⚡ Vite',
  pinia: '🧩 Pinia', zustand: '🗄 Zustand', dva: '🔷 Dva', fullstack: '🔗 Fullstack',
  internet: '🌐 互联网', canvas: '🎯 Canvas/SVG', build: '🔧 构建工具',
  project: '🚀 项目实战', db: '🗄 数据库',
}
function catLabel(cat: string) { return catLabels[cat] || cat }

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
  const el = typewriterRef.value
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

/* ── 登录提示 ── */
.login-prompt-card { text-align: center; padding: 48px 24px; background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg); }
.login-prompt-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.login-prompt-card h3 { margin: 0 0 8px; font-size: 1.2rem; font-weight: 700; color: var(--text); }
.login-prompt-card p { color: var(--text-secondary); font-size: .88rem; margin: 0 0 20px; line-height: 1.6; }

/* ── 学习进度仪表盘 ── */
.progress-section { background: var(--bg-card); }
.progress-dashboard { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }

.progress-ring-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 32px 28px;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.progress-ring { position: relative; width: 120px; height: 120px; }
.progress-ring svg { width: 100%; height: 100%; }
.progress-ring-text {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.pr-num { font-size: 1.6rem; font-weight: 900; color: var(--primary); letter-spacing: -.03em; }
.pr-label { font-size: .72rem; color: var(--text-tertiary); margin-top: 2px; }
.progress-stats { display: flex; gap: 24px; }
.pstat { text-align: center; }
.pstat-num { display: block; font-size: 1.1rem; font-weight: 800; color: var(--text); }
.pstat-lbl { display: block; font-size: .7rem; color: var(--text-tertiary); margin-top: 2px; }

.progress-bars-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px 28px;
  display: flex; flex-direction: column; gap: 14px;
}
.pr-bars-title { margin: 0; font-size: .9rem; font-weight: 700; color: var(--text); }
.pr-bar-row { display: flex; align-items: center; gap: 10px; }
.pr-bar-label { width: 110px; font-size: .76rem; color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; }
.pr-bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.pr-bar-fill { height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, #0071e3, #5856d6);
  transition: width .8s var(--spring-smooth); min-width: 0;
}
.pr-bar-num { font-size: .7rem; color: var(--text-tertiary); width: 36px; text-align: right; flex-shrink: 0; }

/* 学习提醒 */
.reminder-box { margin-top: 4px; padding-top: 14px; border-top: 1px solid var(--border); }
.reminder-row { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 0; }
.reminder-icon { font-size: 1.1rem; }
.reminder-label { font-size: .82rem; color: var(--text-secondary); font-weight: 600; flex: 1; }
.reminder-toggle { width: 44px; height: 26px; border-radius: 13px; background: var(--border); transition: background .3s; position: relative; flex-shrink: 0; }
.reminder-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .3s var(--spring-smooth); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.reminder-toggle.on { background: var(--success,#34c759); }
.reminder-toggle.on::after { transform: translateX(18px); }
.reminder-time-row { display: flex; align-items: center; gap: 8px; padding: 6px 0 0 36px; }
.reminder-time-label { font-size: .72rem; color: var(--text-tertiary); }
.reminder-time-select { padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-glass); color: var(--text); font-size: .76rem; cursor: pointer; }

/* 成就徽章 */
.badges-card { margin-top: 24px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; }
.badges-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.badge-item { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border); font-size: .76rem; white-space: nowrap; transition: all .2s; }
.badge-item:hover { transform: translateY(-1px); border-color: var(--primary); box-shadow: 0 2px 8px var(--glow-primary); }
.badge-icon { font-size: 1rem; }
.badge-name { color: var(--text-secondary); font-weight: 600; }
.next-badge { margin-top: 12px; padding: 10px 14px; background: rgba(255,159,10,.06); border-radius: 10px; font-size: .76rem; color: var(--text-secondary); }
.badge-progress-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 6px; overflow: hidden; }
.badge-progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#ff9f0a,#ff375f); transition: width .8s var(--spring-smooth); }

@media (max-width: 640px) {
  .feature-card { padding: 20px; }
  .preview-card { padding: 16px; }
  .features-grid { grid-template-columns: 1fr; gap: 12px; }
  .preview-grid { grid-template-columns: 1fr; gap: 12px; }
  .progress-dashboard { grid-template-columns: 1fr; }
  .progress-ring-card { flex-direction: row; padding: 20px; }
  .progress-stats { flex-direction: column; gap: 8px; }
  .pr-bar-label { width: 80px; font-size: .68rem; }
  .badges-grid { gap: 4px; }
  .badge-item { padding: 3px 8px; font-size: .68rem; }
}
</style>
