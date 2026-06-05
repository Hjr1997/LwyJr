<template>
  <div ref="wrapperRef" class="robot-2d" :style="{ opacity: isDark ? 0.85 : 1 }">
    <canvas ref="canvasRef" :width="CW" :height="CH" @click="onClick"></canvas>
  </div>
  <Teleport to="body">
    <transition name="tbubble">
      <div v-if="thought || isThinking"
        class="thought-cloud"
        :class="[`act-${thought?.action || 'idle'}`, `side-${bubbleSide}`]"
        :style="cloudStyle"
      >
        <div class="cloud-body">
          <span v-if="isThinking" class="cloud-dots"><i></i><i></i><i></i></span>
          <template v-else>
            <span class="cloud-text">{{ displayText }}</span>
          </template>
        </div>
        <span class="cloud-pip"></span>
        <span class="cloud-dot"></span>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

interface Props {
  robotAction?: 'idle' | 'wave' | 'nod' | 'think' | 'excited' | 'sleepy' | null
  thought?: { text: string; action: string } | null
  isThinking?: boolean
  onRobotInteract?: (context: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  robotAction: null,
  thought: null,
  isThinking: false,
})

const S = useAppStore()
const CW = 240
const CH = 320

const wrapperRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const bubbleSide = ref<'left' | 'right'>('left')
const displayText = ref('')
const isDark = computed(() => S.isDark)

let typedIdx = 0
let typeTimer: ReturnType<typeof setInterval> | null = null
let animId = 0
let startTime = 0

// Animation state
let currentAction: string | null = null
let actionStart = 0
let actionDuration = 0
let blinkTimer = 0
let blinkState = false
let breathPhase = 0

// Character parts state
const charState = {
  headOffsetY: 0,
  headRotate: 0,
  bodyOffsetY: 0,
  bodyScale: 1,
  leftArmAngle: 0,
  rightArmAngle: 0,
  expression: 'default' as string,
  brightness: 1,
}

const isMobile = ref(false)

const cloudStyle = computed(() => {
  const el = wrapperRef.value
  if (!el) return {}
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top
  return {
    left: bubbleSide.value === 'left' ? `${cx - 180}px` : `${cx + 60}px`,
    top: `${cy - 40}px`,
  }
})

watch(() => props.thought, (t) => {
  if (!t) { displayText.value = ''; return }
  typedIdx = 0
  displayText.value = ''
  if (typeTimer) clearInterval(typeTimer)
  typeTimer = setInterval(() => {
    if (typedIdx < t.text.length) {
      displayText.value += t.text[typedIdx]
      typedIdx++
    } else if (typeTimer) {
      clearInterval(typeTimer)
      typeTimer = null
    }
  }, 60)
  bubbleSide.value = Math.random() > 0.5 ? 'left' : 'right'
})

watch(() => props.robotAction, (action) => {
  if (action) reactToThought(action)
})

watch(() => S.lampEvent, async (dir) => {
  if (!dir) return
  props.onRobotInteract?.(dir === 'on' ? '哦~终于舍得开灯了，白天呢？' : '灯关了，你是想省电还是在酝酿什么？')
  if (dir === 'on') {
    charState.expression = 'surprised'
    charState.brightness = 1.5
    await delay(600)
    charState.expression = 'happy'
    charState.brightness = 1.1
    await delay(400)
    charState.expression = 'default'
    charState.brightness = 1
  } else {
    charState.expression = 'surprised'
    charState.bodyScale = 0.95
    charState.brightness = 0.7
    await delay(800)
    charState.expression = 'sleepy'
    charState.brightness = 0.85
    await delay(2000)
    charState.expression = 'default'
    charState.bodyScale = 1
    charState.brightness = 1
  }
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function reactToThought(action: string) {
  currentAction = action
  actionStart = performance.now()
  const durations: Record<string, number> = {
    wave: 1200, nod: 700, think: 2300, excited: 800, sleepy: 3500, idle: 800,
  }
  actionDuration = durations[action] || 800
  const exprMap: Record<string, string> = {
    wave: 'happy', nod: 'happy', think: 'thinking', excited: 'happy', sleepy: 'sleepy', idle: 'default',
  }
  charState.expression = exprMap[action] || 'default'
}

function updateAction(t: number) {
  if (!currentAction) return
  const elapsed = t - actionStart
  const p = Math.min(elapsed / actionDuration, 1)
  const spring = (x: number) => 1 - Math.pow(1 - x, 3)
  const bounce = (x: number) => {
    if (x < 0.3) return spring(x / 0.3)
    if (x < 0.6) return 1 - spring((x - 0.3) / 0.3) * 0.5
    if (x < 0.85) return spring((x - 0.6) / 0.25) * 0.3
    return spring((x - 0.85) / 0.15) * 0.1
  }
  switch (currentAction) {
    case 'wave':
      charState.rightArmAngle = Math.sin(p * Math.PI * 6) * 35
      break
    case 'nod':
      charState.headOffsetY = -bounce(p) * 8
      break
    case 'think':
      charState.headRotate = -5 * spring(p)
      charState.rightArmAngle = 30 * spring(p)
      break
    case 'excited': {
      const b = bounce(p)
      charState.bodyScale = 1 + b * 0.08
      charState.bodyOffsetY = -b * 10
      charState.brightness = 1 + b * 0.2
      break
    }
    case 'sleepy':
      charState.bodyScale = 1 - spring(p) * 0.05
      charState.bodyOffsetY = spring(p) * 5
      charState.brightness = 1 - spring(p) * 0.15
      break
    case 'idle':
      charState.bodyScale = 1 + spring(p) * 0.01
      break
  }
  if (p >= 1) {
    currentAction = null
    charState.headOffsetY = 0
    charState.headRotate = 0
    charState.bodyOffsetY = 0
    charState.bodyScale = 1
    charState.leftArmAngle = 0
    charState.rightArmAngle = 0
    charState.brightness = 1
    if (charState.expression !== 'default') charState.expression = 'default'
  }
}

function draw(ctx: CanvasRenderingContext2D, t: number) {
  const dt = t * 0.001
  ctx.clearRect(0, 0, CW, CH)
  ctx.save()

  const breath = Math.sin(dt * 1.2) * 2
  const bodyY = breath + charState.bodyOffsetY
  const sc = charState.bodyScale
  ctx.translate(CW / 2, CH / 2)
  ctx.scale(sc, sc)
  ctx.translate(-CW / 2, -CH / 2)

  const skin = isDark.value ? '#F0D0A0' : '#FFE0BD'
  const hair = isDark.value ? '#2997ff' : '#0071e3'
  const shirt = isDark.value ? '#1c1c1e' : '#ffffff'
  const pants = isDark.value ? '#2c2c2e' : '#1d1d1f'
  const shoe = isDark.value ? '#3a3a3c' : '#333'
  const eyeWhite = '#fff'
  const pupil = '#1d1d1f'
  const blush = 'rgba(255,150,150,0.3)'

  ctx.globalAlpha = Math.min(charState.brightness, 1.5)

  // Legs
  ctx.fillStyle = pants
  roundRect(ctx, 88, 252 + bodyY, 24, 50, 6)
  ctx.fill()
  roundRect(ctx, 128, 252 + bodyY, 24, 50, 6)
  ctx.fill()
  ctx.fillStyle = shoe
  roundRect(ctx, 84, 294 + bodyY, 30, 14, 5)
  ctx.fill()
  roundRect(ctx, 126, 294 + bodyY, 30, 14, 5)
  ctx.fill()

  // Body
  ctx.fillStyle = shirt
  ctx.beginPath()
  ctx.moveTo(72, 160 + bodyY)
  ctx.lineTo(168, 160 + bodyY)
  ctx.lineTo(176, 252 + bodyY)
  ctx.lineTo(64, 252 + bodyY)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Logo on shirt
  ctx.fillStyle = hair
  ctx.font = 'bold 14px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('L', 120, 215 + bodyY)

  // Left arm
  ctx.save()
  ctx.translate(72, 168 + bodyY)
  ctx.rotate((charState.leftArmAngle * Math.PI) / 180)
  ctx.fillStyle = skin
  roundRect(ctx, -14, 0, 14, 70, 7)
  ctx.fill()
  ctx.restore()

  // Right arm
  ctx.save()
  ctx.translate(168, 168 + bodyY)
  ctx.rotate((-charState.rightArmAngle * Math.PI) / 180)
  ctx.fillStyle = skin
  roundRect(ctx, 0, 0, 14, 70, 7)
  ctx.fill()
  ctx.restore()

  // Head
  ctx.save()
  const hx = 120
  const hy = 90 + bodyY + charState.headOffsetY
  ctx.translate(hx, hy)
  ctx.rotate((charState.headRotate * Math.PI) / 180)

  // Head shape
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(0, 0, 68, 0, Math.PI * 2)
  ctx.fill()

  // Hair
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.ellipse(0, -30, 72, 50, 0, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-50, -40)
  ctx.quadraticCurveTo(-30, -10, -10, -5)
  ctx.quadraticCurveTo(10, -55, 50, -40)
  ctx.quadraticCurveTo(40, -70, 0, -75)
  ctx.quadraticCurveTo(-40, -70, -50, -40)
  ctx.fill()

  // Ears
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.ellipse(-65, 5, 10, 14, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(65, 5, 10, 14, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  const expr = charState.expression
  const blink = blinkState
  const leX = -22, reX = 22, eyeY = -5

  if (blink || expr === 'sleepy') {
    ctx.strokeStyle = pupil
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(leX - 10, eyeY)
    ctx.lineTo(leX + 10, eyeY)
    ctx.moveTo(reX - 10, eyeY)
    ctx.lineTo(reX + 10, eyeY)
    ctx.stroke()
  } else if (expr === 'happy') {
    ctx.strokeStyle = pupil
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(leX, eyeY + 4, 10, Math.PI, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(reX, eyeY + 4, 10, Math.PI, 0)
    ctx.stroke()
  } else if (expr === 'thinking') {
    // Left eye normal
    ctx.fillStyle = eyeWhite
    ctx.beginPath()
    ctx.ellipse(leX, eyeY, 12, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = pupil
    ctx.beginPath()
    ctx.arc(leX + 2, eyeY + 2, 5, 0, Math.PI * 2)
    ctx.fill()
    // Right eye wink
    ctx.strokeStyle = pupil
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(reX, eyeY + 2, 10, Math.PI, 0)
    ctx.stroke()
  } else if (expr === 'surprised') {
    ctx.fillStyle = eyeWhite
    ctx.beginPath()
    ctx.ellipse(leX, eyeY, 15, 18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(reX, eyeY, 15, 18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = pupil
    ctx.beginPath()
    ctx.arc(leX, eyeY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(reX, eyeY, 6, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = eyeWhite
    ctx.beginPath()
    ctx.ellipse(leX, eyeY, 12, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(reX, eyeY, 12, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = pupil
    ctx.beginPath()
    ctx.arc(leX + 1, eyeY + 2, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(reX + 1, eyeY + 2, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(leX + 3, eyeY - 2, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(reX + 3, eyeY - 2, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Blush
  ctx.fillStyle = blush
  ctx.beginPath()
  ctx.ellipse(-35, 18, 14, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(35, 18, 14, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  ctx.strokeStyle = '#c4846c'
  ctx.lineWidth = 2
  if (expr === 'happy') {
    ctx.beginPath()
    ctx.arc(0, 22, 14, 0.1, Math.PI - 0.1)
    ctx.stroke()
  } else if (expr === 'surprised') {
    ctx.fillStyle = '#c4846c'
    ctx.beginPath()
    ctx.ellipse(0, 26, 8, 10, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (expr === 'thinking') {
    ctx.fillStyle = '#c4846c'
    ctx.beginPath()
    ctx.ellipse(5, 24, 5, 6, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (expr === 'sleepy') {
    ctx.strokeStyle = '#c4846c'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 20, 8, 0.2, Math.PI - 0.2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(0, 20, 10, 0.15, Math.PI - 0.15)
    ctx.stroke()
  }

  ctx.restore() // head transform
  ctx.restore() // body transform

  // ZZZ for sleepy
  if (charState.expression === 'sleepy') {
    ctx.globalAlpha = 0.4 + Math.sin(dt * 2) * 0.2
    ctx.fillStyle = hair
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Z', 170 + breath, 70 + bodyY)
    ctx.font = 'bold 20px -apple-system, sans-serif'
    ctx.fillText('Z', 182 + breath, 55 + bodyY)
    ctx.font = 'bold 14px -apple-system, sans-serif'
    ctx.fillText('z', 192 + breath, 42 + bodyY)
  }

  ctx.globalAlpha = 1
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function animate(t: number) {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) { animId = requestAnimationFrame(animate); return }

  if (!startTime) startTime = t
  const elapsed = (t - startTime) * 0.001

  // Blink every 3-7 seconds
  blinkTimer -= 16
  if (blinkTimer <= 0 && !blinkState) {
    blinkState = true
    setTimeout(() => { blinkState = false }, 150)
    blinkTimer = 3000 + Math.random() * 4000
  }

  updateAction(t)
  draw(ctx, t)

  animId = requestAnimationFrame(animate)
}

function onClick(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scaleX = CW / rect.width
  const scaleY = CH / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  if (x > 30 && x < 210 && y > 20 && y < 300) {
    props.onRobotInteract?.('你戳我干嘛~')
    charState.expression = 'surprised'
    setTimeout(() => { charState.expression = 'default' }, 500)
  }
}

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches
  if (isMobile.value) return
  blinkTimer = 2000 + Math.random() * 3000
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  if (typeTimer) clearInterval(typeTimer)
})
</script>

<style scoped>
.robot-2d {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1;
  pointer-events: none;
  will-change: transform, opacity;
  contain: layout style;
}
.robot-2d canvas {
  pointer-events: auto;
  cursor: pointer;
  width: 180px;
  height: 240px;
}
</style>

<style>
/* Thought Cloud — same as SplineScene, non-scoped for Vue Transition */
.thought-cloud {
  position: fixed;
  z-index: 99998;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 20px rgba(0,0,0,.12));
  transform: translate(-50%, -100%);
}
.thought-cloud.side-left {
  transform: translate(-130%, -100%);
}
.thought-cloud.side-right {
  transform: translate(30%, -100%);
}
.side-left .cloud-pip,
.side-left .cloud-dot {
  align-self: flex-end;
  margin-right: 30%;
}
.side-left .cloud-dot { margin-right: 22%; }
.side-right .cloud-pip,
.side-right .cloud-dot {
  align-self: flex-start;
  margin-left: 30%;
}
.side-right .cloud-dot { margin-left: 22%; }
.cloud-body {
  padding: 10px 20px;
  border-radius: 22px;
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.6;
  max-width: 220px;
  text-align: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
}
.cloud-body::before,
.cloud-body::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}
.cloud-body::before { width: 28px; height: 28px; top: -10px; left: 18px; }
.cloud-body::after { width: 18px; height: 18px; top: -6px; right: 22px; }
:root:not([data-theme="dark"]) .cloud-body,
[data-theme="light"] .cloud-body {
  background: rgba(255,255,255,.82);
  color: #1a1a1a;
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 2px 12px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
}
:root:not([data-theme="dark"]) .cloud-body::before,
:root:not([data-theme="dark"]) .cloud-body::after,
[data-theme="light"] .cloud-body::before,
[data-theme="light"] .cloud-body::after {
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(0,0,0,.06);
}
[data-theme="dark"] .cloud-body {
  background: rgba(40,40,44,.82);
  color: #f5f5f7;
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05);
}
[data-theme="dark"] .cloud-body::before,
[data-theme="dark"] .cloud-body::after {
  background: rgba(40,40,44,.82);
  border: 1px solid rgba(255,255,255,.08);
}
.cloud-pip { width: 12px; height: 12px; border-radius: 50%; margin-top: 2px; }
.cloud-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 2px; margin-bottom: -2px; }
:root:not([data-theme="dark"]) .cloud-pip,
:root:not([data-theme="dark"]) .cloud-dot,
[data-theme="light"] .cloud-pip,
[data-theme="light"] .cloud-dot {
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(0,0,0,.06);
}
[data-theme="dark"] .cloud-pip,
[data-theme="dark"] .cloud-dot {
  background: rgba(40,40,44,.82);
  border: 1px solid rgba(255,255,255,.08);
}
.cloud-dots { display: inline-flex; gap: 4px; padding: 2px 0; }
.cloud-dots i { display: block; width: 6px; height: 6px; border-radius: 50%; animation: cloudPulse 1.2s ease infinite; }
[data-theme="dark"] .cloud-dots i { background: #aaa; }
:root:not([data-theme="dark"]) .cloud-dots i,
[data-theme="light"] .cloud-dots i { background: #888; }
.cloud-dots i:nth-child(2) { animation-delay: .2s; }
.cloud-dots i:nth-child(3) { animation-delay: .4s; }
@keyframes cloudPulse {
  0%, 80%, 100% { opacity: .3; transform: scale(.8); }
  40% { opacity: 1; transform: scale(1.3); }
}
.act-wave .cloud-body { animation: cloudWave .5s ease; }
.act-excited .cloud-body { animation: cloudBounce .4s ease; }
.act-sleepy .cloud-body { animation: cloudSleep 2s ease; }
.act-sleepy .cloud-text::after { content: ' 💤'; }
@keyframes cloudWave {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
@keyframes cloudBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes cloudSleep {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; transform: translateY(3px); }
}
.tbubble-enter-active { transition: all .45s cubic-bezier(.34,1.56,.64,1); }
.tbubble-leave-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.tbubble-enter-from { opacity: 0; transform: translate(-130%, -100%) scale(.7); }
.tbubble-leave-to { opacity: 0; transform: translate(-130%, -100%) scale(.85); }
.side-right.tbubble-enter-from { transform: translate(30%, -100%) scale(.7); }
.side-right.tbubble-leave-to { transform: translate(30%, -100%) scale(.85); }
</style>
