<template>
  <div class="chatbot-container">
    <Transition name="chat-window">
      <div v-if="isOpen" class="chatbot-window">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-bg" :style="{ background: currentAgent.gradient }"></div>
          <div class="chatbot-header-inner">
            <div class="chatbot-agent-info">
              <div class="chatbot-avatar-wrapper">
                <div class="chatbot-avatar">{{ currentAgent.icon }}</div>
                <span class="chatbot-status" :class="currentAgent.status"></span>
              </div>
              <div class="chatbot-agent-text">
                <h3>{{ currentAgent.name }}</h3>
                <span>{{ currentAgent.role }}</span>
              </div>
            </div>
            <div class="chatbot-header-actions">
              <button class="chatbot-action-btn" title="清空对话" @click="clearChat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
              <button class="chatbot-close" @click="isOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Agent Selector -->
        <div class="chatbot-selector">
          <button class="chatbot-selector-trigger" @click="showSelector = !showSelector">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83m0-11.14 2.83 2.83m5.66 5.66 2.83 2.83"/></svg>
            <span>切换助手</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="chevron" :class="{ open: showSelector }"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <Transition name="selector-dropdown">
            <div v-if="showSelector" class="chatbot-selector-dropdown">
              <div
                v-for="agent in agents"
                :key="agent.id"
                class="chatbot-selector-item"
                :class="{ active: selectedAgentId === agent.id }"
                @click="selectAgent(agent.id)"
              >
                <div class="selector-agent-icon" :style="{ background: agent.gradient }">
                  {{ agent.icon }}
                </div>
                <div class="selector-agent-info">
                  <span class="selector-name">{{ agent.name }}</span>
                  <span class="selector-role">{{ agent.role }}</span>
                </div>
                <span class="selector-status" :class="agent.status"></span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Chat Messages -->
        <div class="chatbot-messages" ref="messagesRef" @click="handleMsgClick">
          <TransitionGroup name="msg">
            <div v-for="msg in messages" :key="msg.id" class="chatbot-msg" :class="msg.type">
              <div v-if="msg.type === 'ai'" class="chatbot-msg-avatar">{{ currentAgent.icon }}</div>
              <div v-if="msg.type === 'user'" class="chatbot-msg-bubble">{{ msg.text }}</div>
              <div v-else class="chatbot-msg-content">
                <span v-if="msg.typing || !msg.text" class="typing-indicator">
                  <i></i><i></i><i></i>
                </span>
                <div v-else class="md-body" v-html="sanitize(renderMd(msg.text))"></div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Input -->
        <div class="chatbot-input-area">
          <form @submit.prevent="sendMessage" class="chatbot-form">
            <input
              v-model="inputText"
              type="text"
              class="chatbot-input"
              :placeholder="'给 ' + currentAgent.name + ' 发消息...'"
              autocomplete="off"
            />
            <button type="submit" class="chatbot-send" :disabled="!inputText.trim() || isLoading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Lamp Reaction Bubble -->
    <Transition name="lamp-bubble">
      <div v-if="lampBubble" class="lamp-bubble" :class="lampBubble.dir">
        <span>{{ lampBubble.text }}</span>
      </div>
    </Transition>

    <!-- Floating Button -->
    <button class="chatbot-trigger" :class="{ open: isOpen, 'lamp-on': lampAnim === 'on', 'lamp-off': lampAnim === 'off' }" @click="toggleOpen">
      <svg v-if="!isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useAppStore } from '@/stores/app'
import { sanitize } from '@/utils/sanitize'

// ─── Lamp Reaction ──────────────────────────────────
const S = useAppStore()
const lampAnim = ref<'on' | 'off' | null>(null)
const lampBubble = ref<{ dir: 'on' | 'off'; text: string } | null>(null)
let lampBubbleTimer: ReturnType<typeof setTimeout> | null = null

const lampOnTexts = ['哇，亮了亮起来！', '☀️ 好刺眼~', '开灯啦，精神一下！', '灯亮了~ 我醒了！']
const lampOffTexts = ['晚安…🌙', '关灯睡觉觉…', '🌙 嘘，安静了', '好困…我先眯一会']

watch(() => S.lampEvent, (dir) => {
  if (!dir) return
  if (isOpen.value) return // don't react while chat is open
  lampAnim.value = dir
  lampBubble.value = { dir, text: (dir === 'on' ? lampOnTexts : lampOffTexts)[Math.floor(Math.random() * 4)] }
  if (lampBubbleTimer) clearTimeout(lampBubbleTimer)
  lampBubbleTimer = setTimeout(() => { lampBubble.value = null }, 3000)
  setTimeout(() => { lampAnim.value = null }, 1200)
})

onUnmounted(() => { if (lampBubbleTimer) clearTimeout(lampBubbleTimer) })

// ─── Markdown Renderer Setup ────────────────────────
const mdRenderer = new marked.Renderer()

mdRenderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang || 'code'
  let highlighted: string
  try {
    highlighted = lang && hljs.getLanguage(lang)
      ? hljs.highlight(text, { language: lang }).value
      : hljs.highlightAuto(text).value
  } catch {
    highlighted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="code-copy-btn" title="复制代码"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span></button></div><pre><code class="hljs">${highlighted}</code></pre></div>`
}

marked.setOptions({ renderer: mdRenderer, breaks: true, gfm: true })

function renderMd(text: string): string {
  if (!text) return ''
  return marked.parse(text) as string
}

// ─── AI API Config ──────────────────────────────────
// All requests go through Node proxy (/api/chat) — API key is server-side only
const AI_ENDPOINT = '/api/chat'
const AI_MODEL = 'glm-4-flash'

// ─── Types ──────────────────────────────────────────
interface Agent {
  id: string; name: string; role: string; icon: string
  status: 'online' | 'busy' | 'offline'; gradient: string
  greeting: string; systemPrompt: string
}

interface Message { id: number; type: 'ai' | 'user'; text: string; typing?: boolean }

// ─── Agents ─────────────────────────────────────────
const agents: Agent[] = [
  {
    id: 'gpt4', name: 'GLM-4 Flash', role: '通用AI助手',
    icon: '✨', status: 'online',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))',
    greeting: '你好！我是 LwyJr 的 AI 助手，基于智谱 GLM-4 Flash 大模型。有什么问题都可以问我！',
    systemPrompt: '你是 LwyJr 学习平台的 AI 助手，名叫 LwyBot。你擅长前端开发（HTML、CSS、JavaScript、Vue、React）和编程教学。回答简洁明了，适合零基础学习者理解。使用中文回答。',
  },
  {
    id: 'claude', name: '创意写手', role: '文案与写作',
    icon: '🧠', status: 'online',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(245,158,11,0.15))',
    greeting: '嗨！我是创意写手，擅长文案策划和内容创作。需要写什么？',
    systemPrompt: '你是一位专业的创意写作助手，擅长文案策划、内容创作和文字润色。风格活泼有趣，富有感染力。',
  },
  {
    id: 'gemini', name: '全栈导师', role: '前后端开发',
    icon: '⚡', status: 'busy',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))',
    greeting: '你好！我是全栈导师，覆盖前端到后端，帮你解决各种技术难题。',
    systemPrompt: '你是一位经验丰富的全栈开发导师，精通前端（Vue、React、TypeScript）和后端（Node.js、Python、数据库）。回答注重实用性和代码示例。',
  },
  {
    id: 'copilot', name: '代码搭子', role: '实时写代码',
    icon: '💻', status: 'online',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(167,139,250,0.15))',
    greeting: 'Yo！我是你的编程搭子，直接帮你写代码、找 bug、优化性能！',
    systemPrompt: '你是一位高效的编程助手（类似 GitHub Copilot）。直接给出代码，附带简短注释说明。使用 TypeScript，代码要简洁实用。回答格式为 Markdown。',
  },
]

// ─── State ─────────────────────────────────────────
const STORAGE_KEY = 'lwybot_history'
const isOpen = ref(false)
const showSelector = ref(false)
const selectedAgentId = ref('gpt4')
const inputText = ref('')
const messagesRef = ref<HTMLElement>()
const isLoading = ref(false)
const messages = ref<Message[]>([])
let msgIdCounter = 0

const currentAgent = computed(() => agents.find(a => a.id === selectedAgentId.value) || agents[0])
// All API requests go through Node proxy — key check is server-side
const hasApiKey = ref(true)

// ─── localStorage (per-agent) ─────────────────────
function agentKey(id: string) { return `${STORAGE_KEY}_${id}` }

function saveHistory() {
  const data = messages.value.filter(m => !m.typing && m.text)
  try { localStorage.setItem(agentKey(selectedAgentId.value), JSON.stringify(data)) } catch { /* quota */ }
}

function loadHistory(agentId: string): Message[] {
  try {
    const raw = localStorage.getItem(agentKey(agentId))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ─── Core Functions ─────────────────────────────────
function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    showSelector.value = false
    if (messages.value.length === 0) addMessage('ai', currentAgent.value.greeting)
  }
}

function selectAgent(id: string) {
  saveHistory()
  selectedAgentId.value = id
  showSelector.value = false
  messages.value = []
  const saved = loadHistory(id)
  if (saved.length > 0) {
    saved.forEach(m => {
      messages.value.push({ ...m, id: ++msgIdCounter })
    })
  } else {
    addMessage('ai', currentAgent.value.greeting)
  }
  scrollToBottom()
}

function addMessage(type: 'ai' | 'user', text: string, typing = false) {
  messages.value.push({ id: ++msgIdCounter, type, text, typing })
  scrollToBottom()
}

function clearChat() {
  messages.value = []
  saveHistory()
  addMessage('ai', currentAgent.value.greeting)
}

function handleMsgClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const btn = target.closest('.code-copy-btn') as HTMLElement
  if (!btn) return
  const codeBlock = btn.closest('.code-block')
  const code = codeBlock?.querySelector('code')
  if (!code) return
  navigator.clipboard.writeText(code.textContent || '').then(() => {
    btn.classList.add('copied')
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>已复制</span>'
    setTimeout(() => {
      btn.classList.remove('copied')
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>'
    }, 2000)
  })
}

// ─── API Call ────────────────────────────────────────
function buildHistory() {
  return messages.value.filter(m => !m.typing).slice(-10)
    .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }))
}

async function callAI(userText: string): Promise<string> {
  const history = buildHistory()
  const body = {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: currentAgent.value.systemPrompt },
      ...history.slice(0, -1),
      { role: 'user', content: userText },
    ],
    stream: true, temperature: 0.7, max_tokens: 2048,
  }

  const MAX_RETRIES = 2
  let lastErr = ''

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Base64-encode payload so network tab shows only encoded data
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(body))))

      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: encoded,
      })

      if (res.status >= 500 && attempt < MAX_RETRIES) {
        lastErr = `服务暂时不可用 (${res.status})，正在重试...`
        const msg = messages.value[messages.value.length - 1]
        if (msg?.type === 'ai') msg.text = lastErr
        scrollToBottom()
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
        continue
      }
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(`API 请求失败 (${res.status}): ${err.slice(0, 200)}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              fullText += content
              const lastMsg = messages.value[messages.value.length - 1]
              if (lastMsg?.type === 'ai' && !lastMsg.typing) lastMsg.text = fullText
              scrollToBottom()
            }
          } catch { /* skip */ }
        }
      }
      return fullText
    } catch (e: any) {
      lastErr = e.message || '未知错误'
      if (attempt < MAX_RETRIES) {
        const msg = messages.value[messages.value.length - 1]
        if (msg?.type === 'ai') msg.text = '请求出错，正在重试...'
        scrollToBottom()
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
      }
    }
  }
  throw new Error(lastErr || '请求失败，请稍后重试')
}

const fallbackResponses = [
  '这是一个很好的问题！建议你可以在「教程中心」找到更详细的解答。',
  '我正在学习中！请先在 .env.local 中配置 AI_API_KEY 来启用真正的 AI 对话功能。',
  '当前使用的是模拟回复。前往 bigmodel.cn 注册免费获取 API Key，即可体验真正的 AI 对话！',
]

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  addMessage('user', text)
  isLoading.value = true

  const aiMsgId = ++msgIdCounter
  messages.value.push({ id: aiMsgId, type: 'ai', text: '', typing: false })
  scrollToBottom()

  try {
    if (hasApiKey.value) {
      await callAI(text)
    } else {
      const msg = messages.value.find(m => m.id === aiMsgId)
      if (msg) msg.typing = true
      scrollToBottom()
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 800))
      const m = messages.value.find(m => m.id === aiMsgId)
      if (m) { m.typing = false; m.text = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] }
    }
  } catch (e: any) {
    const msg = messages.value.find(m => m.id === aiMsgId)
    if (msg) { msg.typing = false; msg.text = `❌ ${e.message || '请求失败'}` }
  }

  isLoading.value = false
  saveHistory()
  scrollToBottom()
}

// ─── Lifecycle ─────────────────────────────────────
onMounted(() => {
  const saved = loadHistory(selectedAgentId.value)
  if (saved.length > 0) {
    saved.forEach(m => messages.value.push({ ...m, id: ++msgIdCounter }))
  }
})

// Click outside to close selector
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.chatbot-selector')) showSelector.value = false
  })
}
</script>

<style scoped>
/* ═══════════════════════════════════
   Container & Trigger
   ═══════════════════════════════════ */
.chatbot-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.chatbot-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(0,113,227,0.35);
  transition: transform 0.3s var(--spring-bouncy), box-shadow 0.3s ease;
  position: relative;
}
.chatbot-trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  opacity: 0.2;
  filter: blur(12px);
  z-index: -1;
}
.chatbot-trigger:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,113,227,0.45); }
.chatbot-trigger:active { transform: scale(0.95); }
.chatbot-trigger.open {
  background: var(--accent, #ff375f);
  box-shadow: 0 6px 24px rgba(255,55,95,0.35);
  transform: rotate(90deg);
}

/* ═══════════════════════════════════
   Lamp Reaction Animations
   ═══════════════════════════════════ */
.chatbot-trigger.lamp-on {
  animation: lampWakeUp 1.1s cubic-bezier(.34,1.56,.64,1) forwards;
}
.chatbot-trigger.lamp-off {
  animation: lampSleepy 1.2s ease forwards;
}
@keyframes lampWakeUp {
  0%   { transform: scale(1); }
  15%  { transform: scale(0.85) rotate(-8deg); }
  30%  { transform: scale(1.15) rotate(5deg); }
  45%  { transform: scale(0.95) rotate(-3deg); }
  60%  { transform: scale(1.08) rotate(2deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes lampSleepy {
  0%   { transform: scale(1); }
  20%  { transform: scale(1.05); }
  100% { transform: scale(0.92); filter: brightness(0.7); }
}

/* Lamp Bubble */
.lamp-bubble {
  position: absolute;
  bottom: calc(100% + 14px);
  right: 0;
  padding: 8px 16px;
  border-radius: 16px 16px 4px 16px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.lamp-bubble.on {
  background: linear-gradient(135deg, #fff9c4, #fff176);
  color: #e65100;
  border: 1px solid rgba(255,183,77,0.3);
}
.lamp-bubble.off {
  background: var(--bg-elevated);
  color: var(--text);
  border: 1px solid var(--border);
}
.lamp-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 16px;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);
  border-radius: 2px;
}
.lamp-bubble.on::after {
  background: #fff176;
  border-right: 1px solid rgba(255,183,77,0.3);
  border-bottom: 1px solid rgba(255,183,77,0.3);
}
.lamp-bubble.off::after {
  background: var(--bg-elevated);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

/* ═══════════════════════════════════
   Window
   ═══════════════════════════════════ */
.chatbot-window {
  width: 420px;
  max-width: calc(100vw - 32px);
  height: min(600px, calc(100vh - 80px));
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform-origin: bottom right;
}

/* ═══════════════════════════════════
   Header
   ═══════════════════════════════════ */
.chatbot-header {
  position: relative;
  border-bottom: 1px solid var(--border);
  padding: 14px 16px;
  overflow: hidden;
  flex-shrink: 0;
}
.chatbot-header-bg { position: absolute; inset: 0; opacity: 0.5; }
.chatbot-header-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
}
.chatbot-agent-info { display: flex; align-items: center; gap: 12px; }
.chatbot-avatar-wrapper { position: relative; }
.chatbot-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--bg-card); border: 2px solid var(--bg-elevated);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; box-shadow: var(--shadow-sm);
}
.chatbot-status {
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid var(--bg-elevated);
}
.chatbot-status.online { background: #34c759; }
.chatbot-status.busy { background: #ff9f0a; }
.chatbot-status.offline { background: #86868b; }
.chatbot-agent-text h3 { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
.chatbot-agent-text span { font-size: 12px; color: var(--text-secondary); }

.chatbot-header-actions { display: flex; gap: 4px; }
.chatbot-action-btn {
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: transparent; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.chatbot-action-btn:hover { background: var(--bg-card); color: var(--text); }
.chatbot-close {
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: transparent; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.chatbot-close:hover { background: var(--bg-card); }

/* ═══════════════════════════════════
   Agent Selector
   ═══════════════════════════════════ */
.chatbot-selector {
  position: relative; border-bottom: 1px solid var(--border);
  padding: 6px 12px; flex-shrink: 0;
}
.chatbot-selector-trigger {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 8px; border: none; background: transparent;
  color: var(--text); font-size: 13px; font-weight: 500;
  cursor: pointer; border-radius: var(--radius-sm); transition: background 0.2s;
}
.chatbot-selector-trigger:hover { background: var(--bg-card); }
.chatbot-selector-trigger svg.chevron {
  margin-left: auto; transition: transform 0.25s ease; color: var(--text-secondary);
}
.chatbot-selector-trigger svg.chevron.open { transform: rotate(180deg); }

.chatbot-selector-dropdown {
  position: absolute; top: 100%; left: 12px; right: 12px;
  background: var(--bg-elevated); backdrop-filter: blur(20px);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow-lg); padding: 6px; z-index: 10;
}
.chatbot-selector-item {
  display: flex; align-items: center; gap: 10px; padding: 10px;
  border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;
}
.chatbot-selector-item:hover { background: rgba(0,113,227,0.08); }
.chatbot-selector-item.active { background: rgba(0,113,227,0.12); }
.selector-agent-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.selector-agent-info { flex: 1; display: flex; flex-direction: column; }
.selector-name { font-size: 13px; font-weight: 500; color: var(--text); }
.selector-role { font-size: 10px; color: var(--text-secondary); }
.selector-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.selector-status.online { background: #34c759; }
.selector-status.busy { background: #ff9f0a; }

/* ═══════════════════════════════════
   Chat Messages — ChatGPT Style
   ═══════════════════════════════════ */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg-elevated);
}
.chatbot-messages::-webkit-scrollbar { width: 5px; }
.chatbot-messages::-webkit-scrollbar-track { background: transparent; }
.chatbot-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.chatbot-msg {
  display: flex; gap: 12px; align-items: flex-start;
}
.chatbot-msg.user { flex-direction: row-reverse; }

.chatbot-msg-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--bg-card); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0; margin-top: 2px;
}

/* User message — colored bubble */
.chatbot-msg-bubble {
  max-width: 75%; padding: 10px 14px;
  border-radius: 16px; border-top-right-radius: 4px;
  font-size: 13.5px; line-height: 1.6;
  background: var(--primary); color: #fff;
  box-shadow: 0 4px 12px rgba(0,113,227,0.25);
  word-break: break-word;
}

/* AI message — no bubble, pure markdown (ChatGPT / Claude style) */
.chatbot-msg-content {
  flex: 1;
  min-width: 0;
  max-width: 90%;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text);
  word-break: break-word;
}

/* ─── Markdown Content Styles ─────────────────────── */
.md-body :deep(p) { margin: 0 0 10px; }
.md-body :deep(p:last-child) { margin-bottom: 0; }

.md-body :deep(h1), .md-body :deep(h2), .md-body :deep(h3),
.md-body :deep(h4), .md-body :deep(h5), .md-body :deep(h6) {
  margin: 16px 0 8px; font-weight: 600; color: var(--text); line-height: 1.4;
}
.md-body :deep(h1) { font-size: 1.2em; }
.md-body :deep(h2) { font-size: 1.1em; }
.md-body :deep(h3) { font-size: 1.05em; }

.md-body :deep(strong) { font-weight: 600; color: var(--text); }
.md-body :deep(em) { font-style: italic; }

.md-body :deep(a) {
  color: var(--primary); text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.md-body :deep(a:hover) { border-bottom-color: var(--primary); }

.md-body :deep(ul), .md-body :deep(ol) {
  margin: 8px 0; padding-left: 20px;
}
.md-body :deep(li) { margin: 4px 0; }
.md-body :deep(li > p) { margin-bottom: 4px; }

.md-body :deep(blockquote) {
  margin: 10px 0; padding: 8px 14px;
  border-left: 3px solid var(--primary);
  background: var(--bg-card); border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}
.md-body :deep(blockquote p:last-child) { margin-bottom: 0; }

.md-body :deep(hr) {
  margin: 14px 0; border: none;
  border-top: 1px solid var(--border);
}

.md-body :deep(table) {
  width: 100%; border-collapse: collapse; margin: 10px 0;
  font-size: 12.5px;
}
.md-body :deep(th), .md-body :deep(td) {
  padding: 8px 10px; border: 1px solid var(--border); text-align: left;
}
.md-body :deep(th) {
  background: var(--bg-card); font-weight: 600;
}

/* Inline code */
.md-body :deep(code:not(.hljs)) {
  background: var(--bg-card); border: 1px solid var(--border);
  padding: 1.5px 6px; border-radius: 5px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 0.88em; color: #e06c75;
}

/* Typing indicator */
.typing-indicator {
  display: flex; align-items: center; gap: 5px; padding: 4px 0;
}
.typing-indicator i {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text-tertiary, #aeaeb2);
  animation: typingBounce 1.4s infinite;
}
.typing-indicator i:nth-child(2) { animation-delay: -0.2s; }
.typing-indicator i:nth-child(3) { animation-delay: -0.1s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ═══════════════════════════════════
   Input Area
   ═══════════════════════════════════ */
.chatbot-input-area {
  border-top: 1px solid var(--border);
  padding: 12px; background: var(--bg-card);
  flex-shrink: 0;
}
.chatbot-form { display: flex; align-items: center; gap: 8px; }
.chatbot-input {
  flex: 1; height: 40px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-elevated);
  padding: 0 16px; font-size: 13.5px; color: var(--text); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.chatbot-input::placeholder { color: var(--text-tertiary, #aeaeb2); }
.chatbot-input:focus {
  border-color: rgba(0,113,227,0.4);
  box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
}
.chatbot-send {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--primary); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.2s var(--spring-bouncy), box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 4px 12px rgba(0,113,227,0.3);
}
.chatbot-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,113,227,0.4); }
.chatbot-send:active:not(:disabled) { transform: scale(0.95); }
.chatbot-send:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══════════════════════════════════
   Transitions
   ═══════════════════════════════════ */
.chat-window-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-window-leave-active { transition: all 0.2s ease-in; }
.chat-window-enter-from, .chat-window-leave-to {
  opacity: 0; transform: translateY(20px) scale(0.92);
}

.selector-dropdown-enter-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.selector-dropdown-leave-active { transition: all 0.15s ease-in; }
.selector-dropdown-enter-from, .selector-dropdown-leave-to {
  opacity: 0; transform: translateY(-8px) scaleY(0.95);
}

.msg-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.msg-leave-active { transition: all 0.2s ease-in; }
.msg-enter-from { opacity: 0; transform: translateY(8px); }
.msg-leave-to { opacity: 0; transform: scale(0.95); }

/* Lamp bubble transition */
.lamp-bubble-enter-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.lamp-bubble-leave-active { transition: all 0.25s ease-in; }
.lamp-bubble-enter-from { opacity: 0; transform: translateY(8px) scale(0.85); }
.lamp-bubble-leave-to { opacity: 0; transform: translateY(-4px) scale(0.9); }

/* ═══════════════════════════════════
   Dark theme
   ═══════════════════════════════════ */
:global([data-theme='dark']) .chatbot-window { border-color: rgba(255,255,255,0.08); }
:global([data-theme='dark']) .chatbot-msg-bubble { box-shadow: 0 4px 12px rgba(0,113,227,0.2); }

/* ═══════════════════════════════════
   Mobile Responsive
   ═══════════════════════════════════ */
@media (max-width: 640px) {
  .chatbot-container {
    bottom: calc(16px + env(safe-area-inset-bottom, 0));
    right: 16px;
  }
  .chatbot-trigger {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
  .chatbot-window {
    width: calc(100vw - 16px);
    height: calc(100vh - 80px - env(safe-area-inset-bottom, 0));
    max-width: none;
    border-radius: var(--radius-lg);
    position: fixed;
    bottom: calc(8px + env(safe-area-inset-bottom, 0));
    right: 8px;
  }
  .chatbot-selector-item {
    min-height: 44px;
  }
}
</style>

<!-- Global styles for v-html rendered Markdown code blocks -->
<style>
.chatbot-msg-content .code-block {
  margin: 12px 0;
  border-radius: 10px;
  overflow: hidden;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.chatbot-msg-content .code-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.chatbot-msg-content .code-lang {
  font-size: 11px; font-weight: 500;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.chatbot-msg-content .code-copy-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none;
  color: rgba(255,255,255,0.45);
  cursor: pointer; font-size: 11px; padding: 4px 10px;
  border-radius: 5px; transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.chatbot-msg-content .code-copy-btn:hover {
  background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9);
}
.chatbot-msg-content .code-copy-btn.copied { color: #3fb950; }
.chatbot-msg-content .code-block pre {
  margin: 0; padding: 14px 16px;
  overflow-x: auto; background: transparent;
}
.chatbot-msg-content .code-block pre code.hljs {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 12.5px; line-height: 1.6;
  background: transparent; padding: 0;
}
.chatbot-msg-content code:not(.hljs) {
  background: var(--bg-card); border: 1px solid var(--border);
  padding: 1.5px 6px; border-radius: 5px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace;
  font-size: 0.88em; color: #e06c75;
}
</style>
