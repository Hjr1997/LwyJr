<template>
  <div class="pg-view page-in" style="padding-top:var(--main-header-top)">
    <div class="pg-wrap">
      <h2 class="pg-title"><span class="gradient-text">📊 学习进度</span></h2>
      <p class="pg-sub">追踪你的每一步成长，见证从小白到大神的蜕变</p>

      <!-- 未登录提示 -->
      <div v-if="!auth.isLoggedIn" class="login-prompt-card">
        <span class="login-prompt-icon">🔒</span>
        <h3>登录后查看学习进度</h3>
        <p>登录账号后可以查看学习统计、获得成就徽章、跨设备同步进度</p>
        <button class="btn btn-primary" @click="auth.openLogin()">登录 / 注册</button>
      </div>

      <!-- 总览卡片（仅登录后显示） -->
      <template v-if="auth.isLoggedIn">
      <div class="pg-overview">
        <div class="pg-stat-card">
          <div class="pg-stat-icon">📝</div>
          <div class="pg-stat-num">{{ totalDone }}</div>
          <div class="pg-stat-lbl">已完成步骤</div>
        </div>
        <div class="pg-stat-card">
          <div class="pg-stat-icon">📚</div>
          <div class="pg-stat-num">{{ store.totalSteps }}</div>
          <div class="pg-stat-lbl">总步骤数</div>
        </div>
        <div class="pg-stat-card">
          <div class="pg-stat-icon">📊</div>
          <div class="pg-stat-num">{{ store.tutorialProgress }}%</div>
          <div class="pg-stat-lbl">完成百分比</div>
        </div>
        <div class="pg-stat-card">
          <div class="pg-stat-icon">🔥</div>
          <div class="pg-stat-num">{{ store.streakDays }}</div>
          <div class="pg-stat-lbl">连续学习天数</div>
        </div>
      </div>

      <!-- 总进度环 -->
      <div class="pg-ring-section">
        <div class="pg-ring-wrap">
          <svg viewBox="0 0 160 160" class="pg-ring-svg">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" stroke-width="10"/>
            <circle cx="80" cy="80" r="70" fill="none" stroke="url(#pgGrad)" stroke-width="10"
              stroke-linecap="round" :stroke-dasharray="440" :stroke-dashoffset="440 - (440 * store.tutorialProgress / 100)"
              transform="rotate(-90 80 80)" style="transition:stroke-dashoffset 1.2s var(--spring-smooth)"/>
            <defs><linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0071e3"/><stop offset="50%" stop-color="#5856d6"/><stop offset="100%" stop-color="#ff375f"/>
            </linearGradient></defs>
          </svg>
          <div class="pg-ring-text">
            <span class="pg-ring-num">{{ store.tutorialProgress }}%</span>
            <span class="pg-ring-lbl">总进度</span>
          </div>
        </div>
      </div>

      <!-- 分类进度 -->
      <div class="pg-section">
        <h3 class="pg-section-title">📂 各分类进度</h3>
        <div class="pg-cat-grid">
          <div v-for="(info, cat) in allCategories" :key="cat" class="pg-cat-card"
            :class="{done: info.done >= info.total && info.total > 0}">
            <div class="pg-cat-header">
              <span class="pg-cat-icon">{{ catIcon(String(cat)) }}</span>
              <span class="pg-cat-name">{{ catName(String(cat)) }}</span>
              <span class="pg-cat-count">{{ info.done }}/{{ info.total }}</span>
            </div>
            <div class="pg-cat-bar">
              <div class="pg-cat-fill" :style="{width: (info.total>0?info.done/info.total*100:0)+'%',background:catColor(String(cat))}"></div>
            </div>
            <span v-if="info.done >= info.total && info.total > 0" class="pg-cat-badge">✅ 完成</span>
          </div>
        </div>
      </div>

      <!-- 成就徽章 -->
      <div v-if="store.unlockedBadges.length > 0" class="pg-section">
        <h3 class="pg-section-title">🏅 已解锁成就 ({{ store.unlockedBadges.length }})</h3>
        <div class="badges-wall">
          <div v-for="b in store.unlockedBadges" :key="b.id" class="bwall-item">
            <span class="bwall-icon">{{ b.icon }}</span>
            <span class="bwall-name">{{ b.name }}</span>
            <span class="bwall-desc">{{ b.desc }}</span>
          </div>
        </div>
        <div v-if="store.nextBadge" class="next-badge-box">
          <span class="next-label">🔜 下一个成就</span>
          <span class="next-name">{{ store.nextBadge.icon }} {{ store.nextBadge.name }}</span>
          <span class="next-progress">{{ store.nextBadge.progress }}/{{ store.nextBadge.need }}</span>
          <div class="next-bar"><div class="next-fill" :style="{width:(store.nextBadge.progress/store.nextBadge.need*100)+'%'}"></div></div>
        </div>
      </div>

      <!-- 学习提醒 -->
      <div class="pg-section">
        <h3 class="pg-section-title">🔔 学习提醒</h3>
        <div class="reminder-card">
          <div class="reminder-switch" @click="handleReminderToggle">
            <span>{{ store.reminderEnabled ? '🔔 已开启' : '🔕 已关闭' }}</span>
            <span class="reminder-toggle-pill" :class="{on:store.reminderEnabled}"></span>
          </div>
          <p class="reminder-desc">每天 {{ store.reminderHour }}:00 左右提醒学习，保持每日进步的习惯</p>
          <div v-if="store.reminderEnabled" class="reminder-time-picker">
            <label>提醒时间：</label>
            <select :value="store.reminderHour" @change="store.setReminderHour(+($event.target as HTMLSelectElement).value)">
              <option v-for="h in 12" :key="h" :value="h+7">{{h+7}}:00</option>
            </select>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useLearningReminder } from '@/composables/useLearningReminder'

const store = useAppStore()
const auth = useAuthStore()
const { requestPermission, sendReminder } = useLearningReminder()

const totalDone = computed(() => store.tutorialCompleted.size)

const allCategories = computed(() => {
  const cp = store.categoryProgress
  const sorted = Object.entries(cp)
    .filter(([,v]) => v.total > 0)
    .sort(([,a], [,b]) => b.total - a.total)
  return Object.fromEntries(sorted)
})

const catIcons: Record<string,string> = {html:'🌐',css:'🎨',js:'⚡',ts:'🔷',vue3:'💚',react2:'⚛️',node:'🟢',vite:'⚡',pinia:'🧩',zustand:'🗄',dva:'🔷',fullstack:'🔗',internet:'🌐',canvas:'🎯',build:'🔧',project:'🚀',db:'🗄'}
const catNames: Record<string,string> = {html:'HTML',css:'CSS',js:'JavaScript',ts:'TypeScript',vue3:'Vue 3',react2:'React',node:'Node.js',vite:'Vite',pinia:'Pinia',zustand:'Zustand',dva:'Dva',fullstack:'全栈实战',internet:'互联网基础',canvas:'Canvas/SVG',build:'构建工具',project:'项目实战',db:'数据库'}
const catColors: Record<string,string> = {html:'#667eea',css:'#ff6b6b',js:'#f59e0b',ts:'#3178c6',vue3:'#4ade80',react2:'#61dafb',node:'#34c759',vite:'#a78bfa',pinia:'#ff9f0a',zustand:'#a855f7',dva:'#06b6d4',fullstack:'#ff375f',internet:'#667eea',canvas:'#f59e0b',build:'#a78bfa',project:'#ff375f',db:'#34c759'}

function catIcon(cat: string) { return catIcons[cat] || '📄' }
function catName(cat: string) { return catNames[cat] || cat }
function catColor(cat: string) { return catColors[cat] || '#0071e3' }

async function handleReminderToggle() {
  if (!store.reminderEnabled) {
    const granted = await requestPermission()
    if (!granted) { alert('请在浏览器设置中开启通知权限。'); return }
  }
  store.toggleReminder()
  if (store.reminderEnabled) {
    sendReminder('🔔 学习提醒已开启', `每天 ${store.reminderHour}:00 左右提醒你学习！`)
  }
}
</script>

<style scoped>
.pg-view { min-height: 100vh; }
.login-prompt-card { text-align: center; padding: 60px 24px; background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg); max-width: 500px; margin: 0 auto; }
.login-prompt-icon { font-size: 3.5rem; display: block; margin-bottom: 16px; }
.login-prompt-card h3 { margin: 0 0 8px; font-size: 1.2rem; font-weight: 700; color: var(--text); }
.login-prompt-card p { color: var(--text-secondary); font-size: .88rem; margin: 0 0 20px; line-height: 1.6; }
.pg-wrap { max-width: 900px; margin: 0 auto; padding: 0 24px 100px; }
.pg-title { text-align: center; font-size: clamp(2rem,4vw,3rem); font-weight: 900; letter-spacing: -.03em; margin-bottom: 8px; }
.pg-sub { text-align: center; color: var(--text-secondary); margin-bottom: 40px; font-size: .95rem; }

.pg-overview { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
.pg-stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px 16px; text-align: center; transition: all .3s; }
.pg-stat-card:hover { transform: translateY(-2px); border-color: var(--primary); box-shadow: var(--shadow-md); }
.pg-stat-icon { font-size: 1.8rem; margin-bottom: 8px; }
.pg-stat-num { font-size: 1.6rem; font-weight: 900; color: var(--primary); }
.pg-stat-lbl { font-size: .76rem; color: var(--text-tertiary); margin-top: 4px; }

.pg-ring-section { display: flex; justify-content: center; margin-bottom: 36px; }
.pg-ring-wrap { position: relative; width: 160px; height: 160px; }
.pg-ring-svg { width: 100%; height: 100%; }
.pg-ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.pg-ring-num { font-size: 2rem; font-weight: 900; color: var(--primary); letter-spacing: -.03em; }
.pg-ring-lbl { font-size: .72rem; color: var(--text-tertiary); }

.pg-section { margin-bottom: 32px; }
.pg-section-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; color: var(--text); }

.pg-cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.pg-cat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; transition: all .3s; }
.pg-cat-card.done { border-color: var(--success); background: rgba(52,199,89,.04); }
.pg-cat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.pg-cat-icon { font-size: 1.1rem; }
.pg-cat-name { font-size: .85rem; font-weight: 700; color: var(--text); flex: 1; }
.pg-cat-count { font-size: .76rem; color: var(--text-tertiary); font-weight: 600; }
.pg-cat-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.pg-cat-fill { height: 100%; border-radius: 3px; transition: width 1s var(--spring-smooth); }
.pg-cat-badge { display: inline-block; margin-top: 6px; font-size: .68rem; color: var(--success); font-weight: 600; }

.badges-wall { display: flex; flex-wrap: wrap; gap: 10px; }
.bwall-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; min-width: 90px; transition: all .3s; }
.bwall-item:hover { transform: translateY(-2px); border-color: var(--primary); box-shadow: 0 2px 12px var(--glow-primary); }
.bwall-icon { font-size: 1.6rem; }
.bwall-name { font-size: .72rem; font-weight: 700; color: var(--text); }
.bwall-desc { font-size: .62rem; color: var(--text-tertiary); }

.next-badge-box { margin-top: 14px; padding: 14px 18px; background: rgba(255,159,10,.06); border: 1px solid rgba(255,159,10,.15); border-radius: 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.next-label { font-size: .72rem; color: var(--warning); font-weight: 600; }
.next-name { font-size: .82rem; color: var(--text); font-weight: 700; flex: 1; }
.next-progress { font-size: .72rem; color: var(--text-tertiary); }
.next-bar { width: 100%; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 4px; }
.next-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#ff9f0a,#ff375f); transition: width 1s var(--spring-smooth); }

.reminder-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; }
.reminder-switch { display: flex; align-items: center; justify-content: space-between; font-weight: 600; color: var(--text); cursor: pointer; }
.reminder-toggle-pill { width: 48px; height: 28px; border-radius: 14px; background: var(--border); position: relative; transition: background .3s; flex-shrink: 0; }
.reminder-toggle-pill::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: transform .3s var(--spring-smooth); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.reminder-toggle-pill.on { background: var(--success); }
.reminder-toggle-pill.on::after { transform: translateX(20px); }
.reminder-desc { font-size: .82rem; color: var(--text-secondary); margin: 8px 0 0; }
.reminder-time-picker { margin-top: 8px; font-size: .82rem; color: var(--text-secondary); }
.reminder-time-picker select { margin-left: 6px; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-glass); color: var(--text); }

@media(max-width:640px){
  .pg-overview { grid-template-columns: repeat(2,1fr); }
  .pg-cat-grid { grid-template-columns: 1fr; }
  .pg-wrap { padding: 0 16px 80px; }
}
</style>
