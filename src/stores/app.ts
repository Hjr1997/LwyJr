import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { tutorials } from '@/data/tutorials'

const THEME_KEY = 'lwyjr-theme-preference'
const STREAK_KEY = 'lwyjr-streak'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getPersistedTheme(): boolean | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark') return true
    if (v === 'light') return false
    // 'system' or not set → use system preference
    return null
  } catch {
    return null
  }
}

function persistedIsDark(): boolean {
  const persisted = getPersistedTheme()
  // First visit → default dark; after that, respect saved preference
  return persisted !== null ? persisted : true
}

function applyTheme(isDark: boolean) {
  const theme = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  // Set color-scheme so native form controls and scrollbars match
  document.documentElement.style.colorScheme = theme
}

export const useAppStore = defineStore('app', () => {
  // Init from localStorage → system preference
  const isDark = ref(persistedIsDark())
  // Apply on init
  applyTheme(isDark.value)

  const activeSection = ref('hero')
  const tutorialProgress = ref(0)
  const tutorialState = reactive({
    completed: new Set<string>(),
    get size() { return this.completed.size },
  })

  // 从服务器加载进度（登录后调用）
  async function loadServerProgress(token: string) {
    try {
      const res = await fetch('/api/progress', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      tutorialState.completed = new Set(data.completedSteps || [])
      updateProgress()
    } catch { /* 网络错误，静默 */ }
  }

  // 清除进度（退出登录时）
  function clearProgress() {
    tutorialState.completed = new Set()
    updateProgress()
  }

  function updateProgress() {
    tutorialProgress.value = totalSteps.value > 0 ? Math.round((tutorialState.completed.size / totalSteps.value) * 100) : 0
  }

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  // Lamp → ChatBot event bridge
  const lampEvent = ref<'on' | 'off' | null>(null)
  function triggerLampEvent(dir: 'on' | 'off') {
    lampEvent.value = dir
    setTimeout(() => { lampEvent.value = null }, 100)
  }

  // Search open event (NavBar search btn → SearchModal)
  const searchEvent = ref(0)
  function triggerSearch() {
    searchEvent.value++
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    // Persist user preference
    try {
      localStorage.setItem(THEME_KEY, theme.value)
    } catch { /* quota exceeded, ignore */ }
  }

  function setSection(section: string) {
    activeSection.value = section
  }

  // 总步骤数（动态计算）
  const totalSteps = computed(() => {
    let count = 0
    tutorials.forEach(t => { count += t.steps.length })
    return count
  })

  // 各分类完成进度
  const categoryProgress = computed(() => {
    const map: Record<string, { done: number; total: number }> = {}
    tutorials.forEach(t => {
      if (!map[t.category]) map[t.category] = { done: 0, total: 0 }
      t.steps.forEach(s => {
        map[t.category].total++
        if (tutorialState.completed.has(s.id)) map[t.category].done++
      })
    })
    return map
  })

  // 连续学习天数
  const streakDays = ref((() => { try { const d = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'); return d.days || 0 } catch { return 0 } })())
  const lastStudyDate = ref((() => { try { const d = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'); return d.date || '' } catch { return '' } })())
  // 学习提醒设置
  const reminderEnabled = ref((() => { try { const s = JSON.parse(localStorage.getItem('lwyjr-reminder') || '{}'); return s.enabled || false } catch { return false } })())
  const reminderHour = ref((() => { try { const s = JSON.parse(localStorage.getItem('lwyjr-reminder') || '{}'); return s.hour || 19 } catch { return 19 } })())

  function saveReminderSettings() {
    try { localStorage.setItem('lwyjr-reminder', JSON.stringify({ enabled: reminderEnabled.value, hour: reminderHour.value })) } catch {}
  }
  function toggleReminder() { reminderEnabled.value = !reminderEnabled.value; saveReminderSettings() }
  function setReminderHour(h: number) { reminderHour.value = Math.max(0, Math.min(23, h)); saveReminderSettings() }

  // 需要登录的操作
  let pendingLoginCallback: (() => void) | null = null

  // 登录后执行待处理操作
  function executePendingLoginCallback() {
    if (pendingLoginCallback) {
      const cb = pendingLoginCallback
      pendingLoginCallback = null
      cb()
    }
  }

  async function markTutorialComplete(id: string) {
    // 延迟导入避免 Pinia 初始化时的循环依赖
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()

    if (!auth.isLoggedIn) {
      pendingLoginCallback = () => markTutorialComplete(id)
      auth.openLogin()
      return
    }

    // 调用服务器 API
    try {
      const res = await fetch('/api/progress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify({ stepId: id }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      if (data.completed) {
        tutorialState.completed.add(id)
        // 更新连续学习天数
        const today = new Date().toDateString()
        if (lastStudyDate.value !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString()
          if (lastStudyDate.value === yesterday) streakDays.value++
          else if (lastStudyDate.value !== today) streakDays.value = 1
          lastStudyDate.value = today
          try { localStorage.setItem(STREAK_KEY, JSON.stringify({ days: streakDays.value, date: today })) } catch {}
        }
      } else {
        tutorialState.completed.delete(id)
      }
    } catch {
      // 网络错误时仍更新本地状态
      if (tutorialState.completed.has(id)) tutorialState.completed.delete(id)
      else tutorialState.completed.add(id)
    }
    updateProgress()
  }

  function isTutorialDone(id: string): boolean {
    return tutorialState.completed.has(id)
  }

  // ── 成就徽章系统 ──
  interface Badge { id: string; icon: string; name: string; desc: string; condition: () => boolean }
  const badges = computed<Badge[]>(() => {
    const completed = tutorialState.completed.size
    const catDone = (cat: string) => {
      let total = 0; let done = 0
      tutorials.filter(t => t.category === cat).forEach(t => t.steps.forEach(s => { total++; if (tutorialState.completed.has(s.id)) done++ }))
      return total > 0 ? done / total : 0
    }
    const all: Badge[] = [
      {id:'first_step', icon:'🌱', name:'第一步', desc:'完成第一个学习步骤', condition:() => completed >= 1},
      {id:'starter', icon:'📚', name:'初学者', desc:'完成 10 个步骤', condition:() => completed >= 10},
      {id:'learner', icon:'📖', name:'学徒', desc:'完成 50 个步骤', condition:() => completed >= 50},
      {id:'master', icon:'⚡', name:'精通者', desc:'完成 100 个步骤', condition:() => completed >= 100},
      {id:'grandmaster', icon:'🎓', name:'全栈大师', desc:'完成 200 个步骤', condition:() => completed >= 200},
      {id:'legend', icon:'👑', name:'编程传奇', desc:'完成 350 个步骤', condition:() => completed >= 350},
      {id:'html_master', icon:'🌐', name:'HTML 大师', desc:'完成全部 HTML 课程', condition:() => catDone('html') >= 0.95},
      {id:'css_artist', icon:'🎨', name:'CSS 艺术家', desc:'完成全部 CSS 课程', condition:() => catDone('css') >= 0.95},
      {id:'js_ninja', icon:'⚡', name:'JS 忍者', desc:'完成全部 JavaScript 课程', condition:() => catDone('js') >= 0.95},
      {id:'vue_wizard', icon:'💚', name:'Vue 向导', desc:'完成全部 Vue 3 课程', condition:() => catDone('vue3') >= 0.95},
      {id:'react_ranger', icon:'⚛️', name:'React 游侠', desc:'完成全部 React 课程', condition:() => catDone('react2') >= 0.95},
      {id:'node_knight', icon:'🟢', name:'Node 骑士', desc:'完成全部 Node.js 课程', condition:() => catDone('node') >= 0.95},
      {id:'ts_scholar', icon:'🔷', name:'TS 学者', desc:'完成全部 TypeScript 课程', condition:() => catDone('ts') >= 0.95},
      {id:'db_warden', icon:'🗄', name:'数据守护者', desc:'完成全部数据库课程', condition:() => catDone('db') >= 0.95},
      {id:'streak_3', icon:'🔥', name:'三日连学', desc:'连续学习 3 天', condition:() => streakDays.value >= 3},
      {id:'streak_7', icon:'💪', name:'七日坚持', desc:'连续学习 7 天', condition:() => streakDays.value >= 7},
      {id:'streak_30', icon:'🏆', name:'月度学霸', desc:'连续学习 30 天', condition:() => streakDays.value >= 30},
    ]
    return all.filter(b => b.condition())
  })
  const unlockedBadges = computed(() => badges.value)
  const nextBadge = computed(() => {
    const all = badges.value.map(b => b.id)
    const done = tutorialState.completed.size
    const next = [
      {id:'first_step', icon:'🌱', name:'第一步', desc:'完成第一个学习步骤', need: 1, progress: done},
      {id:'starter', icon:'📚', name:'初学者', desc:'完成 10 个步骤', need: 10, progress: done},
      {id:'learner', icon:'📖', name:'学徒', desc:'完成 50 个步骤', need: 50, progress: done},
      {id:'master', icon:'⚡', name:'精通者', desc:'完成 100 个步骤', need: 100, progress: done},
      {id:'grandmaster', icon:'🎓', name:'全栈大师', desc:'完成 200 个步骤', need: 200, progress: done},
    ].filter(b => !all.includes(b.id))
    return next.length > 0 ? next[0] : null
  })

  return {
    isDark,
    activeSection,
    tutorialProgress,
    tutorialCompleted: tutorialState,
    totalSteps,
    categoryProgress,
    streakDays,
    theme,
    toggleTheme,
    setSection,
    markTutorialComplete,
    isTutorialDone,
    loadServerProgress,
    clearProgress,
    executePendingLoginCallback,
    lampEvent,
    triggerLampEvent,
    searchEvent,
    triggerSearch,
    reminderEnabled,
    reminderHour,
    toggleReminder,
    setReminderHour,
    lastStudyDate,
    unlockedBadges,
    nextBadge,
  }
})
