import { ref, onMounted, onUnmounted } from 'vue'

const REMINDER_KEY = 'lwyjr-reminder'
const LAST_STUDY_KEY = 'lwyjr-last-study'

interface ReminderSettings {
  enabled: boolean
  hour: number         // 提醒时间（小时，0-23）
  consecutiveMissed: number // 连续未学习天数
}

function getSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { enabled: false, hour: 19, consecutiveMissed: 0 }
}

function saveSettings(s: ReminderSettings) {
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify(s)) } catch {}
}

/**
 * 学习提醒系统
 * - 浏览器通知权限请求
 * - 每日定时提醒（默认晚上 7 点）
 * - 追踪最后学习时间
 * - 连续 2 天未学习 → 主动提醒
 */
export function useLearningReminder() {
  const settings = ref<ReminderSettings>(getSettings())
  const notificationGranted = ref(Notification?.permission === 'granted')
  const lastStudyDate = ref('')

  // 读取最后学习日期
  function loadLastStudy() {
    try { lastStudyDate.value = localStorage.getItem(LAST_STUDY_KEY) || '' } catch {}
  }
  loadLastStudy()

  // 更新最后学习时间
  function markStudied() {
    const today = new Date().toDateString()
    lastStudyDate.value = today
    settings.value.consecutiveMissed = 0
    try { localStorage.setItem(LAST_STUDY_KEY, today) } catch {}
    saveSettings(settings.value)
  }

  // 请求通知权限
  async function requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') {
      notificationGranted.value = true
      return true
    }
    const result = await Notification.requestPermission()
    notificationGranted.value = result === 'granted'
    return notificationGranted.value
  }

  // 发送学习提醒
  function sendReminder(title: string, body: string) {
    if (!notificationGranted.value) return
    try {
      new Notification(title, {
        body,
        icon: '/vite.svg',
        tag: 'lwyjr-reminder',
        requireInteraction: true,
      })
    } catch { /* 静默失败 */ }
  }

  // 检查是否需要提醒
  function checkAndRemind() {
    if (!settings.value.enabled) return
    if (!notificationGranted.value) return

    const today = new Date().toDateString()
    if (lastStudyDate.value === today) return // 今天已学习

    const lastDate = lastStudyDate.value ? new Date(lastStudyDate.value) : null
    const daysSinceLastStudy = lastDate
      ? Math.floor((Date.now() - lastDate.getTime()) / 86400000)
      : 999

    if (daysSinceLastStudy >= 1) {
      const dayText = daysSinceLastStudy === 1 ? '昨天' : `${daysSinceLastStudy} 天`
      sendReminder(
        `📚 该学习啦！`,
        `你已经 ${dayText} 没学习了。每天进步一点点，坚持就是胜利！🔥`
      )
    }
  }

  // 每天定时检查
  let checkTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleDailyCheck() {
    if (checkTimer) clearTimeout(checkTimer)
    if (!settings.value.enabled) return

    const now = new Date()
    const target = new Date(now)
    target.setHours(settings.value.hour, 0, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)

    const msUntilTarget = target.getTime() - now.getTime()
    checkTimer = setTimeout(() => {
      checkAndRemind()
      scheduleDailyCheck() // 递归调度下一天
    }, msUntilTarget)
  }

  // 开启/关闭提醒
  async function toggleReminder(): Promise<boolean> {
    if (!settings.value.enabled) {
      // 尝试开启
      const granted = await requestPermission()
      if (!granted) {
        alert('请在浏览器设置中允许通知，才能接收学习提醒。')
        return false
      }
      settings.value.enabled = true
    } else {
      settings.value.enabled = false
    }
    saveSettings(settings.value)
    scheduleDailyCheck()
    return settings.value.enabled
  }

  // 设置提醒时间
  function setReminderHour(hour: number) {
    settings.value.hour = Math.max(0, Math.min(23, hour))
    saveSettings(settings.value)
    scheduleDailyCheck()
  }

  // 初始化
  onMounted(() => {
    scheduleDailyCheck()
    // 页面加载时也检查一次
    if (settings.value.enabled && notificationGranted.value) {
      setTimeout(() => checkAndRemind(), 5000) // 5 秒后检查（避免 splash 干扰）
    }
  })

  onUnmounted(() => {
    if (checkTimer) clearTimeout(checkTimer)
  })

  return {
    settings,
    notificationGranted,
    lastStudyDate,
    markStudied,
    requestPermission,
    sendReminder,
    toggleReminder,
    setReminderHour,
    checkAndRemind,
  }
}
