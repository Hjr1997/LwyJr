<template>
  <div ref="wrapperRef" class="spline-scene" :style="{ opacity: isDark ? 0.6 : 0.85 }">
    <canvas ref="canvasRef"></canvas>
    <div v-if="loading" class="spline-loader">
      <span class="loader"></span>
    </div>
  </div>

  <!-- Thought bubble — Teleported to body so it's above all page content -->
  <Teleport to="body">
    <transition name="tbubble">
      <div v-if="thought || isThinking"
        class="thought-cloud"
        :class="[`act-${thought?.action || 'idle'}`, `side-${bubbleSide}`]"
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
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { useAppStore } from '@/stores/app'

interface Props {
  scene: string
  className?: string
  robotAction?: string | null
  thought?: { text: string; action: string } | null
  isThinking?: boolean
  onRobotInteract?: (context: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
})

const canvasRef = ref<HTMLCanvasElement>()
const loading = ref(true)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = shallowRef<any>()
const isDark = computed(() => useAppStore().isDark)

// Store original colors so we can restore them in dark theme
const originalColors = new Map<string, string>()

// ═══════════════════════════════════
//  THEME-AWARE ROBOT SKIN COLORS
// ═══════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveOriginalColors() {
  if (!app.value) return
  const objects = app.value.getAllObjects()
  if (!objects) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const obj of objects) {
    if (!obj.uuid || !obj.material) continue
    // obj.color is write-only; read actual color from material layers
    const colorLayer = obj.material.layers?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (l: any) => l.type === 'color'
    )
    if (colorLayer?.color && !originalColors.has(obj.uuid)) {
      originalColors.set(obj.uuid, colorLayer.color)
    }
  }
}

// Apple-level premium robot palette
// Inspired by titanium MacBook Pro, ceramic Apple Watch, space gray accents
const APPLE_PALETTE = [
  // Primary: titanium silver (main body panels)
  '#d2d0cb',
  // Secondary: brushed aluminum (head, chest)
  '#e8e6e1',
  // Highlight: ceramic white (top surfaces, forehead)
  '#f0efeb',
  // Accent dark: space gray (joints, connectors, edges)
  '#a1a1a6',
  // Accent deep: charcoal (vents, slots, details)
  '#6e6e73',
  // Subtle warm: rose gold undertone (ear panels, cheeks)
  '#c2beb6',
  // Cool steel: blue-gray tint (back panel)
  '#c5c8ce',
  // Bright cap: near-white for specular highlights
  '#f5f5f7',
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Light-theme color mapping by object name
function getLightColor(objName: string): string | null {
  // Don't color background / environment / hidden objects
  const skipPatterns = [/background/i, /ground/i, /plane/i, /light/i, /camera/i, /env/i]
  for (const p of skipPatterns) {
    if (p.test(objName)) return null
  }
  // Hash-based selection → consistent color per object, varied across parts
  return APPLE_PALETTE[hashStr(objName) % APPLE_PALETTE.length]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyThemeColors(dark: boolean) {
  if (!app.value) return
  const objects = app.value.getAllObjects()
  if (!objects) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const obj of objects) {
    try {
      if (dark) {
        // Restore original Spline colors
        const orig = originalColors.get(obj.uuid)
        if (orig !== undefined) obj.color = orig
      } else {
        // Apply light-theme colors
        const lightColor = getLightColor(obj.name)
        if (lightColor) obj.color = lightColor
      }
    } catch { /* some objects may not support color changes */ }
  }
}

// ═══════════════════════════════════
//  LAMP → ROBOT INTERACTION (JS-driven DOM animation)
//  CSS filter/brightness doesn't work on WebGL canvas,
//  so we animate the wrapper div's style directly via rAF.
// ═══════════════════════════════════
const S = useAppStore()
const wrapperRef = ref<HTMLDivElement>()
const robotState = ref<'wake' | 'sleep' | null>(null)
const typedIdx = ref(0)
const displayText = computed(() => props.thought?.text?.slice(0, typedIdx.value) || '')

// Random side for thought bubble (left or right of robot head)
const bubbleSide = ref<'left' | 'right'>('left')

function pickBubbleSide() {
  bubbleSide.value = Math.random() > 0.5 ? 'right' : 'left'
}

// Call pickBubbleSide whenever a new thought appears
watch(() => props.thought, () => { if (props.thought) pickBubbleSide() }, { immediate: true })

// Typewriter effect for thought text
let typeTimer: ReturnType<typeof setInterval> | null = null
watch(() => props.thought, (newVal, oldVal) => {
  if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
  if (!newVal) { typedIdx.value = 0; return }
  if (oldVal && oldVal.text === newVal.text) return
  typedIdx.value = 0
  typeTimer = setInterval(() => {
    if (typedIdx.value < (newVal.text?.length || 0)) {
      typedIdx.value++
    } else {
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
    }
  }, 60)
})
onUnmounted(() => { if (typeTimer) clearInterval(typeTimer) })

// Cached robot parts (discovered on scene load)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const robotParts = {} as Record<string, any>

// ═══════════════════════════════════
//  IDLE ANIMATIONS — CSS wrapper-level only (safe, no 3D part mutations)
// ═══════════════════════════════════
let idleTimers: ReturnType<typeof setTimeout>[] = []

function startIdleAnimations() {
  stopIdleAnimations()

  // 1. Breathing pulse: gentle scale oscillation every 5-9s
  const scheduleBreathe = () => {
    const delay = 5000 + Math.random() * 4000
    idleTimers.push(setTimeout(() => { robotBreathe(); scheduleBreathe() }, delay))
  }
  scheduleBreathe()

  // 2. Subtle brightness shift every 8-15s
  const scheduleGlow = () => {
    const delay = 8000 + Math.random() * 7000
    idleTimers.push(setTimeout(() => { robotGlow(); scheduleGlow() }, delay))
  }
  scheduleGlow()
}

function stopIdleAnimations() {
  idleTimers.forEach(t => clearTimeout(t))
  idleTimers = []
}

// ═══════════════════════════════════
//  BREATHE — gentle scale pulse on wrapper
// ═══════════════════════════════════
async function robotBreathe() {
  if (robotState.value) return
  const el = wrapperRef.value
  if (!el) return
  const base = isDark.value ? 0.6 : 0.85
  try {
    el.style.transition = 'transform 1.5s cubic-bezier(.16,1,.3,1), opacity 1.5s ease'
    el.style.transform = 'scale(1.015)'
    el.style.opacity = String(base + 0.05)
    await wait(1500)
    el.style.transform = 'scale(1)'
    el.style.opacity = String(base)
    await wait(1500)
    el.style.transition = ''
  } catch { /* ok */ }
}

// ═══════════════════════════════════
//  GLOW — subtle brightness flash
// ═══════════════════════════════════
async function robotGlow() {
  if (robotState.value) return
  const el = wrapperRef.value
  if (!el) return
  try {
    el.style.transition = 'filter 0.8s ease'
    el.style.filter = 'brightness(1.15) saturate(1.1)'
    await wait(800)
    el.style.filter = 'brightness(1) saturate(1)'
    await wait(800)
    el.style.transition = ''
  } catch { /* ok */ }
}

// ═══════════════════════════════════
//  SCROLL REACT — float up/down with page (throttled to reduce repaints)
// ═══════════════════════════════════
let scrollRaf = 0
let lastScrollY = 0
let scrollThrottleTs = 0
const SCROLL_THROTTLE = 100 // ms between transforms
function onScrollReact() {
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = requestAnimationFrame(() => {
    const now = performance.now()
    const delta = window.scrollY - lastScrollY
    lastScrollY = window.scrollY
    if (Math.abs(delta) < 1) return
    const el = wrapperRef.value
    if (!el) return
    // Throttle: skip if too soon
    if (now - scrollThrottleTs < SCROLL_THROTTLE) return
    scrollThrottleTs = now
    const ty = Math.max(-4, Math.min(4, delta * 0.08))
    el.style.transition = 'transform 0.25s cubic-bezier(.16,1,.3,1)'
    el.style.transform = `translateY(${ty}px)`
    // Decay back to 0
    setTimeout(() => {
      el.style.transform = 'translateY(0px)'
      setTimeout(() => { el.style.transition = '' }, 250)
    }, 250)
  })
}

// ═══════════════════════════════════
//  CLICK REACT — position-aware, triggers thoughts for robot area
// ═══════════════════════════════════
let robotClickCount = 0
let robotClickReset: ReturnType<typeof setTimeout> | null = null

function onRobotClick(e: MouseEvent) {
  // Only respond to clicks near the robot (bottom-center of viewport)
  const rx = e.clientX / window.innerWidth
  const ry = e.clientY / window.innerHeight
  const nearRobot = rx > 0.15 && rx < 0.85 && ry > 0.45 && ry < 0.95

  if (!nearRobot) return

  robotClickCount++
  if (!robotClickReset) {
    robotClickReset = setTimeout(() => { robotClickCount = 0; robotClickReset = null }, 3000)
  }

  // 3+ rapid clicks on robot area
  if (robotClickCount >= 3) {
    props.onRobotInteract?.('你是有多无聊，一直点我')
    robotClickCount = 0
    return
  }

  if (robotState.value) return

  // Trigger thought
  props.onRobotInteract?.('戳我干嘛，我又不是按钮')

  // Subtle bounce (NOT full-scene scale)
  const el = wrapperRef.value
  if (!el) return
  el.style.transition = 'transform 0.2s cubic-bezier(.34,1.56,.64,1), filter 0.15s ease'
  el.style.transform = 'scale(1.02)'
  el.style.filter = 'brightness(1.1)'
  setTimeout(() => {
    el.style.transform = 'scale(1)'
    el.style.filter = ''
    setTimeout(() => { el.style.transition = '' }, 250)
  }, 200)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function discoverRobotParts() {
  if (!app.value) return
  const objects = app.value.getAllObjects() as any[]
  if (!objects) return

  for (const k of Object.keys(robotParts)) delete robotParts[k]

  const names = objects.map(o => o.name || '(unnamed)')

  for (const obj of objects) {
    const n = (obj.name || '').toLowerCase()
    if (!robotParts.head && /head|face|skull|cranium/i.test(n)) robotParts.head = obj
    else if (!robotParts.body && /body|torso|chest|trunk/i.test(n)) robotParts.body = obj
    else if (!robotParts.leftArm && /left.*arm|arm.*left|l.*arm/i.test(n)) robotParts.leftArm = obj
    else if (!robotParts.rightArm && /right.*arm|arm.*right|r.*arm/i.test(n)) robotParts.rightArm = obj
    else if (!robotParts.leftEye && /left.*eye|eye.*left|l.*eye|pupil.*left/i.test(n)) robotParts.leftEye = obj
    else if (!robotParts.rightEye && /right.*eye|eye.*right|r.*eye|pupil.*right/i.test(n)) robotParts.rightEye = obj
    else if (!robotParts.robot && /robot|character|figure|android|mechanical/i.test(n)) robotParts.robot = obj
  }

  if (Object.keys(robotParts).length === 0) {
    for (const obj of objects) {
      const n = (obj.name || '').toLowerCase()
      if (/background|ground|plane|light|camera|env|ambient/i.test(n)) continue
      robotParts.robot = obj
      break
    }
  }

  // Start idle animations after discovering parts
  startIdleAnimations()

  // Add Spline mouse interaction listeners on robot parts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interactParts = [robotParts.head, robotParts.body, robotParts.leftArm, robotParts.rightArm, robotParts.robot].filter(Boolean) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const part of interactParts) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (part as any).addEventListener?.('mouseDown', () => {
        if (!robotState.value) {
          props.onRobotInteract?.('又点我？我是不是很招你喜欢~')
        }
      })
    } catch { /* Spline runtime may not support object events */ }
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ═══ 3D Object Animator (same as before, for Spline objects) ═══
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function animateProp(obj: any, prop: string, axis: string, from: number, to: number, dur: number, easeFn?: (t: number) => number): Promise<void> {
  if (!obj) return Promise.resolve()
  return new Promise(resolve => {
    const t0 = performance.now()
    const ease = easeFn || (t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    function step(now: number) {
      const t = Math.min((now - t0) / dur, 1)
      const val = from + (to - from) * ease(t)
      try { obj[prop][axis] = val } catch { resolve(); return }
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

function bounceEase(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ═══════════════════════════════════════════════════════════
//  LIGHT ON — robot squints then adapts (subtle, fast, NO disappearing)
// ═══════════════════════════════════════════════════════════
async function robotWakeUp() {
  if (robotState.value) return
  robotState.value = 'wake'
  const el = wrapperRef.value
  if (!el) { robotState.value = null; return }

  // Emit Spline event
  try { app.value?.emitEvent?.('robotWake') } catch { /* no event defined */ }

  // 3D animation in parallel — quick head tilt reaction
  const { head, body, robot } = robotParts
  const target = head || body || robot
  const anim3d = target ? (async () => {
    try {
      // Squint back
      await animateProp(target, 'rotation', 'x', 0, -0.12, 200)
      await animateProp(target, 'rotation', 'x', -0.12, 0.04, 300, bounceEase)
      await animateProp(target, 'rotation', 'x', 0.04, 0, 400)
    } catch { /* ok */ }
  })() : Promise.resolve()

  // CSS: quick brightness pulse, opacity stays normal
  const baseOpacity = isDark.value ? 0.6 : 0.85
  try {
    el.style.transition = 'filter 0.15s ease, transform 0.15s ease'
    // Squint — brief bright flash + slight shrink
    el.style.filter = 'brightness(1.6) saturate(0.3)'
    el.style.transform = 'scale(0.97)'
    await wait(200)
    // Recover
    el.style.transition = 'filter 0.5s ease, transform 0.5s cubic-bezier(.16,1,.3,1)'
    el.style.filter = 'brightness(1.1) saturate(0.9)'
    el.style.transform = 'scale(1.01)'
    await wait(400)
    // Settle
    el.style.filter = ''
    el.style.transform = ''
    await wait(300)
    el.style.transition = ''
  } catch { /* ok */ }

  await anim3d
  robotState.value = null
}

// ═══════════════════════════════════════════════════════════
//  LIGHT OFF — robot flinches then adjusts (subtle, fast, NO disappearing)
// ═══════════════════════════════════════════════════════════
async function robotSleep() {
  if (robotState.value) return
  robotState.value = 'sleep'
  const el = wrapperRef.value
  if (!el) { robotState.value = null; return }

  try { app.value?.emitEvent?.('robotSleep') } catch { /* no event defined */ }

  // 3D animation in parallel — quick head nod
  const { head, body, robot } = robotParts
  const target = head || body || robot
  const anim3d = target ? (async () => {
    try {
      // Flinch forward
      await animateProp(target, 'rotation', 'x', 0, 0.15, 250)
      await animateProp(target, 'rotation', 'x', 0.15, -0.04, 300, bounceEase)
      await animateProp(target, 'rotation', 'x', -0.04, 0, 400)
    } catch { /* ok */ }
  })() : Promise.resolve()

  // CSS: quick dim + micro-jolt, opacity stays normal
  try {
    el.style.transition = 'filter 0.15s ease, transform 0.15s ease'
    // Flinch — sudden dim + slight shrink
    el.style.filter = 'brightness(0.7) saturate(0.6)'
    el.style.transform = 'scale(0.97) translateY(2px)'
    await wait(200)
    // Recover
    el.style.transition = 'filter 0.6s ease, transform 0.5s cubic-bezier(.16,1,.3,1)'
    el.style.filter = 'brightness(0.92) saturate(0.85)'
    el.style.transform = 'scale(1)'
    await wait(500)
    // Settle
    el.style.filter = ''
    el.style.transform = ''
    await wait(300)
    el.style.transition = ''
  } catch { /* ok */ }

  await anim3d
  robotState.value = null
}

// ═══════════════════════════════════
//  REACH FOR LAMP CORD — visible CSS lean + 3D if available
//  Robot leans toward upper-right (lamp location), reaches, pulls cord, snaps back.
// ═══════════════════════════════════
async function robotReachForCord(): Promise<void> {
  if (robotState.value) return
  robotState.value = 'wake'

  // Try Spline event
  try { app.value?.emitEvent?.('robotReach') } catch { /* no event defined */ }

  const { head, body, leftArm, rightArm, robot } = robotParts
  const base = head || body || robot
  const arm = rightArm || leftArm

  // 3D animation: lean toward lamp (upper-right) + reach arm up
  const anim3d = base ? (async () => {
    try {
      // Step 1: Look up-right toward lamp
      await Promise.all([
        animateProp(base, 'rotation', 'z', 0, -0.15, 600),
        animateProp(base, 'rotation', 'x', 0, -0.1, 600),
      ])
      // Arm reaches up if available
      const armAnim = arm ? animateProp(arm, 'rotation', 'x', 0, -0.45, 800) : Promise.resolve()
      await wait(400)

      // Step 2: Reach further
      await Promise.all([
        animateProp(base, 'rotation', 'z', -0.15, -0.22, 400),
        animateProp(base, 'rotation', 'x', -0.1, -0.16, 400),
        armAnim,
      ])
      await wait(350)

      // Step 3: Grab the cord! (freeze)
      await wait(200)

      // Step 4: Pull down! (cord yanks robot back)
      const armBack = arm ? animateProp(arm, 'rotation', 'x', -0.45, 0, 400) : Promise.resolve()
      await Promise.all([
        animateProp(base, 'rotation', 'z', -0.22, 0.06, 350, bounceEase),
        animateProp(base, 'rotation', 'x', -0.16, 0.06, 350),
        armBack,
      ])
      await wait(250)

      // Step 5: Settle back
      await Promise.all([
        animateProp(base, 'rotation', 'z', 0.06, 0, 600),
        animateProp(base, 'rotation', 'x', 0.06, 0, 600),
      ])
    } catch {
      // 3D animation skipped — model may not be fully loaded
    }
  })() : Promise.resolve()

  // CSS fallback — visible lean toward lamp corner (upper-right)
  // This runs regardless of whether 3D parts exist
  const el = wrapperRef.value
  if (el) {
    try {
      // Phase 1: Notice lamp, lean up-right
      el.style.transition = 'transform 0.5s cubic-bezier(.25,.46,.45,.94)'
      el.style.transform = 'rotate(-1.5deg) translateY(-3px)'
      await wait(600)

      // Phase 2: Reach further — bigger lean
      el.style.transition = 'transform 0.4s cubic-bezier(.25,.46,.45,.94)'
      el.style.transform = 'rotate(-3deg) translateY(-5px) translateX(8px)'
      el.style.filter = 'brightness(1.05)'
      await wait(500)

      // Phase 3: Grab cord — freeze briefly
      await wait(300)

      // Phase 4: Pull! — cord snaps robot back (bounce)
      el.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)'
      el.style.transform = 'rotate(1deg) translateY(3px) translateX(-2px)'
      el.style.filter = 'brightness(0.95)'
      await wait(300)

      // Phase 5: Settle
      el.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1), filter 0.3s ease'
      el.style.transform = ''
      el.style.filter = ''
      await wait(500)
      el.style.transition = ''
    } catch { /* ok */ }
  } else {
    await anim3d
  }

  robotState.value = null
}

watch(() => S.lampEvent, async (dir) => {
  if (!dir || !app.value) return
  // Robot thinks about reaching for the cord
  props.onRobotInteract?.(dir === 'on' ? '哦~终于舍得开灯了，白天呢？' : '灯关了，你是想省电还是在酝酿什么？')
  // First reach for the cord, then react to light
  await robotReachForCord()
  if (dir === 'on') robotWakeUp()
  else robotSleep()
})

// ═══════════════════════════════════
//  AI THOUGHT REACT — animation for each thought action
// ═══════════════════════════════════
async function reactToThought(action: string) {
  if (robotState.value) return
  const el = wrapperRef.value
  if (!el) return

  try { app.value?.emitEvent?.(`robot${action.charAt(0).toUpperCase() + action.slice(1)}`) } catch { /* no event */ }

  switch (action) {
    case 'wave': {
      // Side-to-side wobble
      el.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)'
      el.style.transform = 'rotate(3deg) scale(1.02)'
      await wait(200)
      el.style.transform = 'rotate(-3deg) scale(1.02)'
      await wait(200)
      el.style.transform = 'rotate(2deg) scale(1.02)'
      await wait(200)
      el.style.transform = 'rotate(0deg) scale(1)'
      await wait(300)
      el.style.transition = ''
      break
    }
    case 'nod': {
      // Quick up-down nod
      el.style.transition = 'transform 0.2s ease'
      el.style.transform = 'translateY(-5px) scale(1.01)'
      await wait(150)
      el.style.transform = 'translateY(0) scale(1.03)'
      await wait(150)
      el.style.transform = 'translateY(-3px) scale(1.01)'
      await wait(150)
      el.style.transform = 'translateY(0) scale(1)'
      await wait(250)
      el.style.transition = ''
      break
    }
    case 'think': {
      // Slow tilt + brightness pulse
      el.style.transition = 'transform 0.8s ease, filter 0.8s ease'
      el.style.transform = 'rotate(-2deg) scale(0.98)'
      el.style.filter = 'brightness(0.9)'
      await wait(1000)
      el.style.transform = 'rotate(2deg) scale(1.01)'
      el.style.filter = 'brightness(1.1)'
      await wait(1000)
      el.style.transform = 'rotate(0deg) scale(1)'
      el.style.filter = ''
      await wait(300)
      el.style.transition = ''
      break
    }
    case 'excited': {
      // Quick bounce
      el.style.transition = 'transform 0.15s cubic-bezier(.34,1.56,.64,1), filter 0.15s ease'
      el.style.transform = 'scale(1.08)'
      el.style.filter = 'brightness(1.2) saturate(1.2)'
      await wait(150)
      el.style.transform = 'scale(0.95)'
      await wait(120)
      el.style.transform = 'scale(1.05)'
      await wait(120)
      el.style.transform = 'scale(1)'
      el.style.filter = ''
      await wait(200)
      el.style.transition = ''
      break
    }
    case 'sleepy': {
      // Slow shrink + dim
      el.style.transition = 'transform 1s ease, filter 1s ease'
      el.style.transform = 'scale(0.96) translateY(3px)'
      el.style.filter = 'brightness(0.85)'
      await wait(2000)
      el.style.transform = 'scale(0.97) translateY(2px)'
      el.style.filter = 'brightness(0.9)'
      await wait(1000)
      el.style.transform = 'scale(1) translateY(0)'
      el.style.filter = ''
      await wait(500)
      el.style.transition = ''
      break
    }
    default: {
      // idle: gentle pulse
      el.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)'
      el.style.transform = 'scale(1.01)'
      await wait(500)
      el.style.transform = 'scale(1)'
      await wait(300)
      el.style.transition = ''
    }
  }
}

watch(() => props.robotAction, (action) => {
  if (action) reactToThought(action)
})

function loadScene(url: string) {
  if (!canvasRef.value) return

  destroy()

  loading.value = true

  import('@splinetool/runtime').then(({ Application }) => {
    if (!canvasRef.value) return
    const spline = new Application(canvasRef.value)
    app.value = spline
    spline.load(url).then(() => {
      loading.value = false
      // Save original colors & apply current theme
      saveOriginalColors()
      applyThemeColors(isDark.value)
      // Discover robot parts for lamp interaction
      discoverRobotParts()
    })
  })
}

function destroy() {
  if (app.value) {
    app.value.dispose()
    app.value = undefined
  }
  originalColors.clear()
}

// Forward global pointer events to the canvas so Spline 3D responds
// even when the wrapper has pointer-events: none (content layer is above)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clonePointer(e: PointerEvent) {
  return new PointerEvent(e.type, {
    pointerId: e.pointerId,
    pointerType: e.pointerType,
    button: e.button,
    buttons: e.buttons,
    clientX: e.clientX,
    clientY: e.clientY,
    screenX: e.screenX,
    screenY: e.screenY,
    movementX: e.movementX,
    movementY: e.movementY,
    width: e.width,
    height: e.height,
    pressure: e.pressure,
    tangentialPressure: e.tangentialPressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
    isPrimary: e.isPrimary,
    bubbles: true,
    cancelable: true,
    composed: true,
  } as any)
}

// Flag to prevent re-entry: cloned events dispatched to canvas bubble
// back to window, which would re-dispatch → infinite loop.
let forwarding = false

function onPointerMove(e: PointerEvent) {
  if (forwarding) return
  const canvas = canvasRef.value
  if (!canvas) return
  forwarding = true
  canvas.dispatchEvent(clonePointer(e))
  forwarding = false
}

function onPointerDown(e: PointerEvent) {
  if (forwarding) return
  const canvas = canvasRef.value
  if (!canvas) return
  forwarding = true
  canvas.dispatchEvent(clonePointer(e))
  forwarding = false
}

function onPointerUp(e: PointerEvent) {
  if (forwarding) return
  const canvas = canvasRef.value
  if (!canvas) return
  forwarding = true
  canvas.dispatchEvent(clonePointer(e))
  forwarding = false
}

function onWheel(e: WheelEvent) {
  if (forwarding) return
  const canvas = canvasRef.value
  if (!canvas) return
  // Throttle: only forward every 50ms to reduce canvas repaint overhead
  const now = performance.now()
  if ((onWheel as any)._lastTs && now - (onWheel as any)._lastTs < 50) return
  (onWheel as any)._lastTs = now
  forwarding = true
  canvas.dispatchEvent(new WheelEvent('wheel', {
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    deltaMode: e.deltaMode,
    clientX: e.clientX,
    clientY: e.clientY,
    bubbles: true,
    cancelable: true,
  }))
  forwarding = false
}

watch(() => props.scene, (url) => {
  if (url) loadScene(url)
})

// React to theme changes → swap robot skin
watch(isDark, (dark) => {
  if (app.value) applyThemeColors(dark)
})

onMounted(() => {
  if (props.scene) loadScene(props.scene)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pointerup', onPointerUp, true)
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('scroll', onScrollReact, { passive: true })
  window.addEventListener('click', onRobotClick)
})

onUnmounted(() => {
  destroy()
  stopIdleAnimations()
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('pointerup', onPointerUp, true)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('scroll', onScrollReact)
  window.removeEventListener('click', onRobotClick)
})
</script>

<style scoped>
.spline-scene {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  will-change: transform, opacity;
  contain: layout style;
}
.spline-scene canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.spline-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border, rgba(255,255,255,0.15));
  border-top-color: var(--primary, #0071e3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ═══════ Thought Cloud (Teleported to body, always on top) ═══════ */
.thought-cloud {
  position: fixed;
  left: 50%;
  top: 28vh;
  z-index: 99998;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 20px rgba(0,0,0,.12));
  /* side-left: offset left from the head position */
  transform: translate(-130%, -50%);
}
.thought-cloud.side-right {
  flex-direction: column;
  /* side-right: offset right from the head position */
  transform: translate(30%, -50%);
}

/* Pips trail toward the robot head below */
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
  /* Cloud-like bumpy shape using pseudo-elements */
  position: relative;
}

/* Theme colors */
:root:not([data-theme="dark"]) .cloud-body,
[data-theme="light"] .cloud-body {
  background: rgba(255,255,255,.82);
  color: #1a1a1a;
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 2px 12px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9);
}
[data-theme="dark"] .cloud-body {
  background: rgba(40,40,44,.82);
  color: #f5f5f7;
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05);
}

/* Cloud bumps */
.cloud-body::before,
.cloud-body::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}
.cloud-body::before {
  width: 28px; height: 28px;
  top: -10px; left: 18px;
}
.cloud-body::after {
  width: 18px; height: 18px;
  top: -6px; right: 22px;
}
:root:not([data-theme="dark"]) .cloud-body::before,
:root:not([data-theme="dark"]) .cloud-body::after,
[data-theme="light"] .cloud-body::before,
[data-theme="light"] .cloud-body::after {
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(0,0,0,.06);
}
[data-theme="dark"] .cloud-body::before,
[data-theme="dark"] .cloud-body::after {
  background: rgba(40,40,44,.82);
  border: 1px solid rgba(255,255,255,.08);
}

/* Connecting pips — cloud to robot head */
.cloud-pip {
  width: 12px; height: 12px;
  border-radius: 50%;
  margin-top: 2px;
}
.cloud-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  margin-top: 2px;
  margin-bottom: -2px;
}
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

/* Thinking dots */
.cloud-dots {
  display: inline-flex;
  gap: 4px;
  padding: 2px 0;
}
.cloud-dots i {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: cloudPulse 1.2s ease infinite;
}
[data-theme="dark"] .cloud-dots i { background: #aaa; }
:root:not([data-theme="dark"]) .cloud-dots i,
[data-theme="light"] .cloud-dots i { background: #888; }
.cloud-dots i:nth-child(2) { animation-delay: .2s; }
.cloud-dots i:nth-child(3) { animation-delay: .4s; }
@keyframes cloudPulse {
  0%, 80%, 100% { opacity: .3; transform: scale(.8); }
  40% { opacity: 1; transform: scale(1.3); }
}

/* Action modifiers */
.act-wave .cloud-body { animation: cloudWave .5s ease; }
.act-excited .cloud-body { animation: cloudBounce .4s ease; }
.act-nod .cloud-body::after { content: ' 👍'; }
.act-think .cloud-body::after { content: ''; }
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

/* Transitions — pop out from robot head direction */
.tbubble-enter-active { transition: all .45s cubic-bezier(.34,1.56,.64,1); }
.tbubble-leave-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.tbubble-enter-from { opacity: 0; transform: translate(-130%, -50%) scale(.7); }
.tbubble-leave-to { opacity: 0; transform: translate(-130%, -50%) scale(.85); }
.side-right.tbubble-enter-from { transform: translate(30%, -50%) scale(.7); }
.side-right.tbubble-leave-to { transform: translate(30%, -50%) scale(.85); }

/* Responsive */
@media (max-width: 768px) {
  .cloud-body { max-width: 180px; font-size: .8rem; padding: 8px 14px; }
}
@media (max-width: 480px) {
  .cloud-body { max-width: 150px; font-size: .75rem; }
}
@media (max-height: 500px) {
  .thought-cloud { top: 18vh; }
  .cloud-body { max-width: 140px; font-size: .72rem; padding: 6px 12px; }
}
</style>
