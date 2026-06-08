import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_KEY = 'lwyjr-auth'

interface User {
  id: number
  username: string
  email: string
  avatar: string
}

function loadAuth(): { token: string; user: User } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveAuth(token: string, user: User) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user })) } catch {}
}

const API = '' // 同源

export const useAuthStore = defineStore('auth', () => {
  const saved = loadAuth()
  const token = ref<string | null>(saved?.token || null)
  const user = ref<User | null>(saved?.user || null)
  const isLoggedIn = computed(() => !!token.value)
  const showLoginModal = ref(false)

  // 页面刷新后自动恢复进度（延迟确保 app store 已初始化）
  if (saved?.token) {
    setTimeout(() => loadProgressIntoStore(saved.token), 100)
  }

  async function register(username: string, email: string, password: string): Promise<string | null> {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || '注册失败'
      token.value = data.token
      user.value = data.user
      saveAuth(data.token, data.user)
      // 加载服务器进度
      await loadProgressIntoStore(data.token)
      return null
    } catch {
      return '网络错误，请稍后重试'
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error || '登录失败'
      token.value = data.token
      user.value = data.user
      saveAuth(data.token, data.user)
      // 加载服务器进度
      await loadProgressIntoStore(data.token)
      // 执行登录前待处理的操作
      const { useAppStore } = await import('@/stores/app')
      useAppStore().executePendingLoginCallback()
      return null
    } catch {
      return '网络错误，请稍后重试'
    }
  }

  async function loadProgressIntoStore(t: string) {
    try {
      const { useAppStore } = await import('@/stores/app')
      await useAppStore().loadServerProgress(t)
    } catch { /* 静默 */ }
  }

  function logout() {
    token.value = null
    user.value = null
    try { localStorage.removeItem(AUTH_KEY) } catch {}
    // 清除进度
    import('@/stores/app').then(m => m.useAppStore().clearProgress())
  }

  // 同步本地进度到服务器
  async function syncProgress(stepIds: string[]): Promise<string[]> {
    if (!token.value || stepIds.length === 0) return []
    try {
      const res = await fetch(`${API}/api/progress/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.value}` },
        body: JSON.stringify({ stepIds }),
      })
      const data = await res.json()
      return data.completedSteps || []
    } catch {
      return []
    }
  }

  // 加载服务器进度
  async function loadServerProgress(): Promise<string[]> {
    if (!token.value) return []
    try {
      const res = await fetch(`${API}/api/progress`, {
        headers: { 'Authorization': `Bearer ${token.value}` },
      })
      const data = await res.json()
      return data.completedSteps || []
    } catch {
      return []
    }
  }

  // 切换步骤完成状态（同步到服务器）
  async function toggleStepOnServer(stepId: string): Promise<boolean> {
    if (!token.value) return false
    try {
      const res = await fetch(`${API}/api/progress/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.value}` },
        body: JSON.stringify({ stepId }),
      })
      const data = await res.json()
      return data.completed
    } catch {
      return false
    }
  }

  function openLogin() { showLoginModal.value = true }
  function closeLogin() { showLoginModal.value = false }

  return {
    token, user, isLoggedIn, showLoginModal,
    register, login, logout, syncProgress, loadServerProgress, toggleStepOnServer,
    openLogin, closeLogin,
  }
})
