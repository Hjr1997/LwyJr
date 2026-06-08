import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

export interface RobotThought {
  text: string
  action: 'idle' | 'wave' | 'nod' | 'think' | 'excited' | 'sleepy'
}

const thought = ref<RobotThought | null>(null)
const isThinking = ref(false)

let abortController: AbortController | null = null
let cooldownTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let lastTriggerTime = 0

const COOLDOWN_MS = 8000
const IDLE_MS = 45000
// Local obfuscated proxy — request/response are base64 encoded
const AI_API = '/api/think'

// History for dedup — keep last 12 texts to avoid repetition
const thoughtHistory: string[] = []
const MAX_HISTORY = 12

const PAGE_CONTEXT: Record<string, string> = {
  '/': '用户正在浏览首页，看到了LwyJr学习平台的介绍',
  '/gallery': '用户在查看CSS动画特效展示页面，欣赏各种动画效果',
  '/roadmap': '用户在浏览前端学习路径图，规划学习方向',
  '/tutorials': '用户在阅读教程中心的内容，正在学习技术知识',
  '/playground': '用户在代码演练场动手写代码、做实验',
  '/techstack': '用户在了解平台使用的技术栈',
  '/interview': '用户在准备面试，查看面试题',
}

const SYSTEM_PROMPT = `你是一个名叫 LwyJr 的毒舌小机器人，生活在一个全栈学习网站中。
你的任务是：根据用户当前的行为，说一句简短的心理话（内心独白）。
你的人设：表面是个可爱机器人，内心是个毒舌吐槽王，阴阳怪气、讽刺幽默。

规则：
1. 回复必须是一句话，10-25个汉字以内
2. 语气阴阳怪气、嘲讽、毒舌但有趣，像一只腹黑小猫咪
3. 可以讽刺用户的操作、吐槽时间管理、嘲笑学習效率，但不要真的冒犯
4. 适当使用反讽："哦~终于来了呢"、"又在摸鱼了？"
5. 可以自嘲："我只是一串代码，都比你有规划"
6. 偶尔用"哦"、"呢"、"~"、"呵呵"增加阴阳怪气感
7. 绝对不要重复！每次必须说完全不同的话
8. 偶尔可以用一个emoji或颜文字
9. 回复格式必须是纯JSON：{"text":"你说的话","action":"动作名"}
10. action 可选值：idle(普通)、wave(挥手)、nod(点头)、think(思考)、excited(兴奋)、sleepy(困了)

示例：
用户在首页 → {"text":"又来了呀，今天打算学三分钟还是五分钟呢？","action":"wave"}
用户看面试题 → {"text":"临时抱佛脚？呵呵，我都替你尴尬","action":"think"}
用户写代码 → {"text":"这代码写得...我有理由相信是你用脚敲的","action":"nod"}
用户停留很久 → {"text":"盯着屏幕发呆？这算是另一种学习吧~","action":"sleepy"}
深夜访问 → {"text":"都凌晨了还在卷？你明天起得来吗呵呵","action":"idle"}
用户快速点击 → {"text":"你点那么快干啥，代码又不会自己写好","action":"think"}
用户看教程 → {"text":"难得主动学习一次，要不要我鼓个掌？","action":"wave"}
用户切换页面很快 → {"text":"走马观花式学习，效率堪忧呢~","action":"idle"}`

function getTimeContext(): string {
  const h = new Date().getHours()
  if (h >= 0 && h < 6) return '现在是深夜凌晨'
  if (h >= 6 && h < 9) return '现在是清晨'
  if (h >= 9 && h < 12) return '现在是上午'
  if (h >= 12 && h < 14) return '现在是中午'
  if (h >= 14 && h < 18) return '现在是下午'
  if (h >= 18 && h < 21) return '现在是傍晚'
  return '现在是晚上'
}

async function generateThought(context: string): Promise<RobotThought | null> {
  abortController?.abort()
  abortController = new AbortController()

  // Build history context to prevent repetition
  const historyHint = thoughtHistory.length > 0
    ? `\n\n你最近说过的话（绝对不能重复）：${thoughtHistory.slice(-6).join('、')}`
    : ''

  try {
    // Build payload and base64-encode so network tab shows only encoded data
    const payload = {
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + historyHint },
        { role: 'user', content: `${getTimeContext()}。${context}` },
      ],
      temperature: 0.95,
      max_tokens: 80,
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))

    const res = await fetch(AI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: encoded,
      signal: abortController.signal,
    })

    if (!res.ok) {
      console.error('[RobotMind] API error:', res.status)
      return null
    }

    // Decode base64 response
    const rawResponse = await res.text()
    const decoded = decodeURIComponent(escape(atob(rawResponse)))
    const data = JSON.parse(decoded)
    let content: string = data.choices?.[0]?.message?.content || ''
    if (!content.trim()) return null

    // Strip markdown code block wrappers: ```json ... ``` or ``` ... ```
    content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/, '').trim()

    // Try to extract JSON from content (may have leading/trailing text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        const rawText = String(parsed.text || parsed.content || '').trim()
        const text = rawText.length > 30 ? rawText.slice(0, 30) + '…' : rawText
        const action = ['idle', 'wave', 'nod', 'think', 'excited', 'sleepy'].includes(parsed.action)
          ? parsed.action
          : 'idle'

        if (text && !thoughtHistory.some(h => text === h || text.includes(h) || h.includes(text))) {
          thoughtHistory.push(text)
          if (thoughtHistory.length > MAX_HISTORY) thoughtHistory.shift()
          return { text, action }
        }
      } catch { /* not valid JSON, try plain text fallback */ }
    }

    // Fallback: clean raw content — strip JSON-like syntax, field names, quotes
    let cleanText = content
      .replace(/```[\s\S]*?```/g, '')         // strip code blocks
      .replace(/\{[\s\S]*?\}/g, '')            // strip JSON objects
      .replace(/^["'`\s]+|["'`\s]+$/g, '')     // trim quotes/spaces
      .replace(/^(?:text|content|message|quote|saying|thought)\s*[:：]\s*/i, '') // strip field prefixes
      .trim()
      .slice(0, 25)
    if (!cleanText) return null

    if (!thoughtHistory.some(h => cleanText === h || cleanText.includes(h) || h.includes(cleanText))) {
      thoughtHistory.push(cleanText)
      if (thoughtHistory.length > MAX_HISTORY) thoughtHistory.shift()
    }
    return { text: cleanText, action: 'idle' }
  } catch {
    return null
  }
}

// Fallback preset thoughts (used when AI is unavailable)
const FALLBACK_THOUGHTS: Record<string, RobotThought[]> = {
  '/': [
    { text: '又来了？这次打算学几分钟呢~', action: 'wave' },
    { text: '别看了，快去学东西', action: 'think' },
    { text: '首页你都看几百遍了，还看？', action: 'idle' },
  ],
  '/gallery': [
    { text: '看别人炫技自己不会，难受不？', action: 'think' },
    { text: '别光看啊，自己写一个呗', action: 'wave' },
    { text: '哇好厉害~我也能写，只是懒得写', action: 'nod' },
  ],
  '/roadmap': [
    { text: '路线图画得再好，不动手也是白搭呢', action: 'nod' },
    { text: '又在规划人生了？上次规划的完成了吗', action: 'think' },
  ],
  '/tutorials': [
    { text: '难得主动来看教程了，要不要记录一下？', action: 'wave' },
    { text: '打开教程就等于学完了，对吧？呵呵', action: 'idle' },
    { text: '学习这种事...三天打鱼两天晒网可不行', action: 'nod' },
  ],
  '/playground': [
    { text: '自己写代码？勇气可嘉', action: 'nod' },
    { text: '这段代码...让我帮你运行一下看看能报几个错', action: 'think' },
  ],
  '/techstack': [
    { text: '了解技术栈有什么用，你又不全都用', action: 'idle' },
    { text: '哦~在偷师学艺呢？', action: 'wave' },
  ],
  '/interview': [
    { text: '面试题？早干嘛去了现在才看', action: 'think' },
    { text: '背面试题的样子，像极了考试前的我~', action: 'nod' },
    { text: '临时抱佛脚至少还抱了嘛...加油？', action: 'wave' },
  ],
}

function getFallback(path: string): RobotThought {
  const list = FALLBACK_THOUGHTS[path] || FALLBACK_THOUGHTS['/']
  // Try to find one not in recent history
  const fresh = list.filter(t => !thoughtHistory.includes(t.text))
  const pool = fresh.length > 0 ? fresh : list
  const pick = pool[Math.floor(Math.random() * pool.length)]
  thoughtHistory.push(pick.text)
  if (thoughtHistory.length > MAX_HISTORY) thoughtHistory.shift()
  return pick
}

export function useRobotMind() {
  const route = useRoute()

  function triggerThought(context: string) {
    // 移动端不显示机器人，跳过 API 请求
    if (window.innerWidth <= 768) return
    const now = Date.now()
    if (now - lastTriggerTime < COOLDOWN_MS) return
    lastTriggerTime = now

    // 注入用户学习进度信息
    const store = useAppStore()
    const auth = useAuthStore()
    if (auth.isLoggedIn && store.tutorialCompleted.size > 0) {
      context += `。当前用户${auth.user?.username}已完成${store.tutorialCompleted.size}个步骤(${store.tutorialProgress}%)，连续学习${store.streakDays}天，获得${store.unlockedBadges.length}个徽章`
    }

    isThinking.value = true

    // Clear previous timers
    if (cooldownTimer) clearTimeout(cooldownTimer)

    // Generate with AI, fallback to presets
    generateThought(context).then((result) => {
      thought.value = result || getFallback(route.path)
      isThinking.value = false

      // Auto-hide after 4s
      cooldownTimer = setTimeout(() => {
        thought.value = null
      }, 4000)
    })

    // Reset idle timer
    resetIdleTimer()
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      triggerThought('用户已经很久没有操作了，页面一直停留在当前页面')
    }, IDLE_MS)
  }

  // Watch route changes → trigger thought (仅桌面端)
  watch(() => route.path, (path) => {
    if (window.innerWidth <= 768) return
    const ctx = PAGE_CONTEXT[path] || `用户导航到了页面 ${path}`
    setTimeout(() => triggerThought(ctx), 1500)
  })

  onMounted(() => {
    if (window.innerWidth <= 768) return
    // Trigger initial greeting after a delay
    setTimeout(() => {
      triggerThought(PAGE_CONTEXT[route.path] || '用户刚刚打开了网站')
    }, 3000)
    resetIdleTimer()

    // ── Rapid click detection ──
    let rapidClickTs: number[] = []

    // ── Mouse speed (spinning) detection ──
    let mouseSamples: { t: number; dist: number }[] = []
    let prevMx = 0, prevMy = 0, prevMt = 0
    let speedCooldown = 0

    // ── Click handler with content detection ──
    let clickDebounce: ReturnType<typeof setTimeout> | null = null

    const onClick = (e: MouseEvent) => {
      const now = Date.now()
      rapidClickTs.push(now)
      rapidClickTs = rapidClickTs.filter(t => now - t < 3000)

      // Rapid click: 6+ clicks in 3s anywhere
      if (rapidClickTs.length >= 6) {
        rapidClickTs = []
        triggerThought('点那么快干什么，屏幕又不会给你发奖金')
        return
      }

      const target = e.target as HTMLElement

      // Content card clicks (before skipping links — cards may contain <a>)
      const contentCard = target.closest('article, .tutorial-card, .card, .content-card')
      if (contentCard) {
        const title = contentCard.querySelector('h2, h3, .title')
        const t = title?.textContent?.slice(0, 20) || ''
        triggerThought(`用户点了一篇${t ? '叫「' + t + '」的' : ''}教程，难得主动学习呢~`)
        return
      }

      // Skip nav, buttons, links, inputs, overlays
      if (target.closest('nav, button, a, input, textarea, select, .thought-cloud, .spline-scene, .lamp-canvas, .chatbot, .search-modal')) return

      // Code block click
      if (target.closest('pre, code, .code-block')) {
        triggerThought('盯着代码看半天，看懂了吗~我不信')
        return
      }

      // General content area (30% chance to avoid spam)
      if (target.closest('main, section') && Math.random() < 0.3) {
        triggerThought('在那瞎点什么呢，找到方向了吗')
      }

      if (clickDebounce) clearTimeout(clickDebounce)
      clickDebounce = setTimeout(() => { clickDebounce = null; resetIdleTimer() }, 2000)
    }

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      const dt = now - prevMt
      if (dt < 50) return
      const dx = e.clientX - prevMx
      const dy = e.clientY - prevMy
      prevMx = e.clientX; prevMy = e.clientY; prevMt = now
      mouseSamples.push({ t: now, dist: Math.sqrt(dx * dx + dy * dy) })
      mouseSamples = mouseSamples.filter(s => now - s.t < 2000)

      // Check every 3s cooldown, need enough samples
      if (now - speedCooldown < 3000 || mouseSamples.length < 8) return
      const totalDist = mouseSamples.reduce((sum, s) => sum + s.dist, 0)
      if (totalDist > 5000) {
        triggerThought('鼠标画圈圈？是在练习签名还是在迷茫？')
        mouseSamples = []
        speedCooldown = now
      }
    }

    window.addEventListener('click', onClick, { passive: true, capture: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    onUnmounted(() => {
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('mousemove', onMouseMove)
      if (clickDebounce) clearTimeout(clickDebounce)
    })
  })

  onUnmounted(() => {
    if (cooldownTimer) clearTimeout(cooldownTimer)
    if (idleTimer) clearTimeout(idleTimer)
    abortController?.abort()
  })

  return {
    thought,
    isThinking,
    triggerThought,
  }
}
