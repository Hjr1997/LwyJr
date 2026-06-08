<template>
  <Teleport to="body">
    <!-- ═══ LIGHT OVERLAYS (pointer-events: none, never block page) ═══ -->
    <div
      class="lamp-overlay-dark"
      :class="{ on: !isLit }"
      :style="{ '--bx': bx + 'px', '--by': by + 'px' }"
    />
    <div
      class="lamp-overlay-light"
      :class="lightClass"
      :style="{ '--bx': bx + 'px', '--by': by + 'px' }"
    />
    <div
      class="lamp-overlay-ambient"
      :class="{ on: isLit && !spreading && !retracting, 'in': spreading, 'out': retracting }"
      :style="{ '--bx': bx + 'px', '--by': by + 'px' }"
    />
    <div
      class="lamp-overlay-flash"
      :class="{ fire: flash }"
      :style="{ '--bx': bx + 'px', '--by': by + 'px' }"
    />

    <!-- ═══ COMPACT LAMP CANVAS (330×330, visually 165×165 via CSS scale(0.5)) ═══ -->
    <canvas
      ref="lampCanvas"
      class="lamp-canvas"
      @mousedown="onDown"
      @touchstart.prevent="onDown"
    ></canvas>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const S = useAppStore()
const isLit = computed(() => !S.isDark)

const lampCanvas = ref<HTMLCanvasElement>()

// Viewport position of the bulb (for light overlay CSS vars)
const bx = ref(0)
const by = ref(0)

// Chain pull offset (screen pixels)
const pullX = ref(0)
const pullY = ref(0)
const dragging = ref(false)
const triggered = ref(false)
let grabX = 0, grabY = 0

// Animation
const flash = ref(false)
const spreading = ref(false)
const retracting = ref(false)
let bulbGlow = 0 // 0..1 smooth glow

const THRESH = 28
const MAX_PULL = 65

// ═══════════════════════════════════
//  CANVAS GEOMETRY CONSTANTS
// ═══════════════════════════════════
// Canvas size (extra padding on all 4 sides so bead stays within bounds at max pull)
const CW = 330, CH = 330
// Lamp position within canvas (inset to leave room for bead movement)
const LOX = 120, LOY = 64
// Lamp body size
const LW = 72, LH = 140
// Lamp center (canvas-local)
const LCX = LOX + LW / 2   // 156
// Shade bounds (canvas-local)
const SHADE_T = LOY + 20    // 84
const SHADE_B = LOY + 64    // 128
// Wire anchor: bottom-center of shade opening
const WIRE_SX = LCX + 5     // 161
const WIRE_SY = SHADE_B + 2 // 130
// Chain natural hang length
const CHAIN_LEN = 30
// Bead rest position (canvas-local)
const BEAD_RX = WIRE_SX            // 161
const BEAD_RY = WIRE_SY + CHAIN_LEN // 160

let ctx: CanvasRenderingContext2D | null = null
let dpr = 1

// ═══════════════════════════════════
//  COMPUTED CLASSES (priority: spread > retract > on)
// ═══════════════════════════════════
const lightClass = computed(() => {
  if (spreading.value) return { spread: true }
  if (retracting.value) return { on: true }   // keep .on so overlay stays visible during retract
  if (isLit.value) return { on: true }
  return {}
})

// ═══════════════════════════════════
//  TRACK BULB POSITION (for overlays)
// ═══════════════════════════════════
function trackBulbPosition() {
  const cnv = lampCanvas.value
  if (!cnv) return
  const r = cnv.getBoundingClientRect()
  // transform-origin: top right + scale(0.5), so x offset is from the RIGHT edge
  bx.value = r.right - (LCX + 5) * 0.5
  by.value = r.top + (SHADE_B + 10) * 0.5
}

// ═══════════════════════════════════
//  CANVAS SETUP
// ═══════════════════════════════════
function setupCanvas() {
  const cnv = lampCanvas.value
  if (!cnv) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  cnv.width = CW * dpr
  cnv.height = CH * dpr
  cnv.style.width = CW + 'px'
  cnv.style.height = CH + 'px'
  ctx = cnv.getContext('2d')!
  ctx.scale(dpr, dpr)
}

// ═══════════════════════════════════
//  DRAW (lamp body + wire + bead)
// ═══════════════════════════════════
function draw() {
  const c = ctx
  if (!c) return
  const dark = document.documentElement.getAttribute('data-theme') === 'dark'
  const col = (a: number) => dark ? `rgba(185,185,185,${a})` : `rgba(55,55,55,${a})`
  const glow = bulbGlow

  c.clearRect(0, 0, CW, CH)

  const bx2 = LCX, baseY = LOY + 122

  // ═══ BASE ═══
  c.fillStyle = 'rgba(0,0,0,0.08)'
  c.beginPath(); c.ellipse(bx2, baseY + 5, 18, 5.5, 0, 0, Math.PI * 2); c.fill()
  c.fillStyle = col(0.3)
  c.beginPath(); c.ellipse(bx2, baseY, 18, 5.5, 0, 0, Math.PI * 2); c.fill()
  const bg = c.createLinearGradient(bx2 - 12, baseY, bx2 + 12, baseY)
  bg.addColorStop(0, col(0.35)); bg.addColorStop(0.5, col(0.58)); bg.addColorStop(1, col(0.3))
  c.fillStyle = bg
  c.beginPath(); c.ellipse(bx2, baseY - 2.5, 16, 4.5, 0, 0, Math.PI * 2); c.fill()
  c.fillStyle = 'rgba(255,255,255,0.06)'
  c.beginPath(); c.ellipse(bx2 - 5, baseY - 3.5, 7, 2, 0, 0, Math.PI * 2); c.fill()

  // ═══ JOINTS ═══
  const jLx = bx2 - 6.5, jRx = bx2 + 6.5, jY = baseY - 5.5
  c.fillStyle = col(0.4)
  c.beginPath(); c.arc(jLx, jY, 3.2, 0, Math.PI * 2); c.fill()
  c.beginPath(); c.arc(jRx, jY, 3.2, 0, Math.PI * 2); c.fill()

  // ═══ LOWER ARMS ═══
  const hingeY = LOY + 68
  c.strokeStyle = col(0.38); c.lineWidth = 2.8; c.lineCap = 'round'
  c.beginPath(); c.moveTo(jLx, jY - 2); c.lineTo(bx2 - 2, hingeY); c.stroke()
  c.beginPath(); c.moveTo(jRx, jY - 2); c.lineTo(bx2 + 4, hingeY); c.stroke()

  // ═══ SPRING ═══
  c.strokeStyle = col(0.33); c.lineWidth = 1.2; c.lineCap = 'round'; c.lineJoin = 'round'
  c.beginPath()
  for (let i = 0; i < 10; i++) {
    const sy = LOY + 84 + i * 3.5
    c.lineTo(bx2 - 2 + (i % 2 ? 3 : -3), sy + 1.8)
  }
  c.moveTo(bx2 - 2, LOY + 84)
  c.stroke()

  // ═══ HINGE ═══
  c.fillStyle = col(0.48); c.beginPath(); c.arc(bx2 + 1, hingeY, 4, 0, Math.PI * 2); c.fill()
  c.fillStyle = col(0.26); c.beginPath(); c.arc(bx2 + 1, hingeY, 2.2, 0, Math.PI * 2); c.fill()

  // ═══ UPPER ARMS ═══
  const shadePivotX = bx2 + 10, shadePivotY = LOY + 32
  c.strokeStyle = col(0.38); c.lineWidth = 2.6
  c.beginPath(); c.moveTo(bx2 - 1, hingeY - 3); c.lineTo(shadePivotX, shadePivotY); c.stroke()
  c.beginPath(); c.moveTo(bx2 + 3, hingeY - 3); c.lineTo(shadePivotX + 2, shadePivotY); c.stroke()
  c.fillStyle = col(0.48); c.beginPath(); c.arc(shadePivotX + 1, shadePivotY, 3.5, 0, Math.PI * 2); c.fill()

  // ═══ SHADE ═══
  const shadeL = bx2 - 20, shadeR = bx2 + 34
  c.fillStyle = col(0.52)
  c.beginPath()
  c.moveTo(bx2 + 16, SHADE_T); c.lineTo(bx2 + 26, SHADE_T)
  c.lineTo(shadeR, SHADE_B); c.lineTo(shadeL, SHADE_B)
  c.lineTo(bx2 - 8, SHADE_T); c.closePath()
  c.fill()
  c.strokeStyle = col(0.13); c.lineWidth = 0.7; c.stroke()

  // ═══ SHADE INTERIOR (glow) ═══
  if (glow > 0.01) {
    const ig = c.createLinearGradient(0, SHADE_B - 5, 0, SHADE_B + 8)
    ig.addColorStop(0, `rgba(255,252,235,${0.95 * glow})`)
    ig.addColorStop(0.45, `rgba(255,230,150,${0.65 * glow})`)
    ig.addColorStop(1, `rgba(255,183,77,${0.08 * glow})`)
    c.fillStyle = ig
    c.beginPath(); c.ellipse(bx2 + 5, SHADE_B, 20, 5.5, 0, 0, Math.PI * 2); c.fill()
  }

  // ═══ BULB (smooth glow) ═══
  const bulbX = bx2 + 5, bulbY = SHADE_B + 10
  if (glow > 0.01) {
    const aura = c.createRadialGradient(bulbX, bulbY - 1, 2, bulbX, bulbY - 1, 28)
    aura.addColorStop(0, `rgba(255,255,255,${0.95 * glow})`)
    aura.addColorStop(0.12, `rgba(255,253,231,${0.72 * glow})`)
    aura.addColorStop(0.35, `rgba(255,240,190,${0.3 * glow})`)
    aura.addColorStop(0.65, `rgba(255,183,77,${0.06 * glow})`)
    aura.addColorStop(1, 'rgba(255,152,0,0)')
    c.fillStyle = aura
    c.beginPath(); c.ellipse(bulbX, bulbY - 1, 28, 23, 0, 0, Math.PI * 2); c.fill()
  }
  const rv = Math.round(55 + 200 * glow)
  c.fillStyle = glow > 0.5 ? '#ffffff' : `rgb(${rv},${rv},${rv})`
  c.beginPath(); c.ellipse(bulbX, bulbY, 8.5, 7, 0, 0, Math.PI * 2); c.fill()
  if (glow > 0.3) {
    c.fillStyle = `rgba(255,255,255,${0.5 * glow})`
    c.beginPath(); c.ellipse(bulbX - 2.5, bulbY - 2.5, 3, 2, 0, 0, Math.PI * 2); c.fill()
  }

  // ═══ WIRE + CHAIN + BEAD ═══
  const px = pullX.value * 2, py = pullY.value * 2
  const beadX = BEAD_RX + px
  const beadY = BEAD_RY + py

  // Wire: from shade bottom to bead (catenary curve)
  c.strokeStyle = col(0.5); c.lineWidth = 1.3; c.lineCap = 'round'
  const sagX = (WIRE_SX + beadX) / 2
  const sagY = (WIRE_SY + beadY) / 2 + Math.abs(beadX - WIRE_SX) * 0.12 + 3
  c.beginPath()
  c.moveTo(WIRE_SX, WIRE_SY)
  c.quadraticCurveTo(sagX, sagY, beadX, beadY)
  c.stroke()

  // Chain links
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.5) / 4
    const lx = (1-t)*(1-t)*WIRE_SX + 2*(1-t)*t*sagX + t*t*beadX
    const ly = (1-t)*(1-t)*WIRE_SY + 2*(1-t)*t*sagY + t*t*beadY
    c.strokeStyle = col(0.4); c.lineWidth = 1
    c.beginPath(); c.arc(lx, ly, 1.6, 0, Math.PI * 2); c.stroke()
  }

  // Bead
  const bGrad = c.createRadialGradient(beadX - 1, beadY - 1, 0.5, beadX, beadY, 6)
  bGrad.addColorStop(0, dark ? '#f0f0f0' : '#777')
  bGrad.addColorStop(0.55, dark ? '#c8c8c8' : '#444')
  bGrad.addColorStop(1, dark ? '#909090' : '#1a1a1a')
  c.fillStyle = bGrad
  c.beginPath(); c.arc(beadX, beadY, 5.5, 0, Math.PI * 2); c.fill()
  c.strokeStyle = col(0.3); c.lineWidth = 0.8; c.stroke()
  c.fillStyle = 'rgba(255,255,255,0.18)'
  c.beginPath(); c.arc(beadX - 1.5, beadY - 2, 2, 0, Math.PI * 2); c.fill()

  // Trigger ring
  if (triggered.value) {
    c.strokeStyle = 'rgba(0,113,227,0.5)'; c.lineWidth = 2
    c.beginPath(); c.arc(beadX, beadY, 9, 0, Math.PI * 2); c.stroke()
  }
}

// ═══════════════════════════════════
//  HIT TEST (canvas-local coords)
// ═══════════════════════════════════
function hitTest(localX: number, localY: number): boolean {
  // Canvas is CSS-scaled 0.5, so screen coords need *2 to match canvas coords
  const sx = localX * 2, sy = localY * 2
  // Near lamp body
  if (sx >= LOX - 8 && sx <= LOX + LW + 8 &&
      sy >= LOY - 4 && sy <= LOY + LH + 4) return true
  // Near bead (25px radius)
  const beadX = BEAD_RX + pullX.value * 2
  const beadY = BEAD_RY + pullY.value * 2
  const dx = sx - beadX, dy = sy - beadY
  return dx * dx + dy * dy < 625
}

// ═══════════════════════════════════
//  DRAG
// ═══════════════════════════════════
function onDown(e: MouseEvent | TouchEvent) {
  if (dragging.value) return
  const cnv = lampCanvas.value
  if (!cnv) return

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const rect = cnv.getBoundingClientRect()
  const localX = clientX - rect.left
  const localY = clientY - rect.top

  if (!hitTest(localX, localY)) return

  e.preventDefault()
  dragging.value = true
  triggered.value = false
  pullX.value = 0
  pullY.value = 0
  grabX = clientX
  grabY = clientY
  document.addEventListener('mousemove', onMove, { passive: false })
  document.addEventListener('mouseup', onUp)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onUp)
  startLoop()
}

function onMove(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  e.preventDefault()
  const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
  const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
  const dx = cx - grabX, dy = cy - grabY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > MAX_PULL) {
    const ratio = MAX_PULL / dist
    pullX.value = dx * ratio
    pullY.value = dy * ratio
  } else {
    pullX.value = dx
    pullY.value = dy
  }
  if (dist >= THRESH && !triggered.value) {
    triggered.value = true
    if (navigator.vibrate) navigator.vibrate(12)
    setTimeout(() => { triggered.value = false }, 300)
  }
}

function onUp() {
  if (!dragging.value) return
  dragging.value = false
  const dist = Math.sqrt(pullX.value ** 2 + pullY.value ** 2)
  const fired = dist >= THRESH
  const sx = pullX.value, sy = pullY.value
  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseup', onUp)
  document.removeEventListener('touchmove', onMove)
  document.removeEventListener('touchend', onUp)
  stopLoop()
  springBack(sx, sy, fired)
}

// ═══════════════════════════════════
//  SPRING BACK
// ═══════════════════════════════════
function springBack(sx: number, sy: number, doFire: boolean) {
  const t0 = performance.now()
  const dur = 400
  function step(now: number) {
    const t = Math.min((now - t0) / dur, 1)
    const ease = 1 - Math.pow(1 - t, 3.5)
    pullX.value = sx * (1 - ease)
    pullY.value = sy * (1 - ease)
    draw()
    if (t < 1) requestAnimationFrame(step)
    else { pullX.value = 0; pullY.value = 0; draw(); if (doFire) fire() }
  }
  requestAnimationFrame(step)
}

// ═══════════════════════════════════
//  SMOOTH BULB GLOW ANIMATION
// ═══════════════════════════════════
function animateBulbGlow(target: number, duration: number): Promise<void> {
  return new Promise(resolve => {
    const start = bulbGlow
    const t0 = performance.now()
    function step(now: number) {
      const t = Math.min((now - t0) / duration, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      bulbGlow = start + (target - start) * ease
      draw()
      if (t < 1) requestAnimationFrame(step)
      else { bulbGlow = target; draw(); resolve() }
    }
    requestAnimationFrame(step)
  })
}

// ═══════════════════════════════════
//  LIGHT SEQUENCE (KEY FIX: toggle theme DURING animation)
// ═══════════════════════════════════
let busy = false

// ═══════════════════════════════════
//  JS-DRIVEN SPREAD (every frame smooth, no CSS animation)
// ═══════════════════════════════════
function jsSpread(duration: number): Promise<void> {
  return new Promise(resolve => {
    const lo = document.querySelector('.lamp-overlay-light') as HTMLElement
    if (!lo) { resolve(); return }
    const MAX_R = 250000

    lo.style.transition = 'none'
    lo.style.clipPath = `circle(2px at ${bx.value}px ${by.value}px)`
    lo.style.opacity = '0.03'

    const t0 = performance.now()
    function step(now: number) {
      const p = Math.min((now - t0) / duration, 1)
      const radius = Math.max(2, MAX_R * Math.pow(p, 3))
      const opacity = Math.min(1, 0.03 + 0.97 * Math.pow(p, 2.5))
      lo.style.clipPath = `circle(${radius}px at ${bx.value}px ${by.value}px)`
      lo.style.opacity = String(opacity)
      if (p < 1) requestAnimationFrame(step)
      else {
        lo.style.clipPath = `circle(${MAX_R}px at ${bx.value}px ${by.value}px)`
        lo.style.opacity = '1'
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

// ═══════════════════════════════════
//  JS-DRIVEN RETRACT (every frame smooth, no CSS animation)
// ═══════════════════════════════════
function jsRetract(duration: number): Promise<void> {
  return new Promise(resolve => {
    const lo = document.querySelector('.lamp-overlay-light') as HTMLElement
    if (!lo) { resolve(); return }
    const MAX_R = 250000

    // CRITICAL: set inline style BEFORE any CSS animation can interfere
    lo.style.transition = 'none'
    lo.style.animation = 'none'
    lo.style.clipPath = `circle(${MAX_R}px at ${bx.value}px ${by.value}px)`
    lo.style.opacity = '1'

    const t0 = performance.now()
    function step(now: number) {
      const p = Math.min((now - t0) / duration, 1)
      // (1-p)^3: slow start → fast finish
      const radius = Math.max(0, MAX_R * Math.pow(1 - p, 3))
      const opacity = Math.max(0, Math.pow(1 - p, 2))
      lo.style.clipPath = `circle(${radius}px at ${bx.value}px ${by.value}px)`
      lo.style.opacity = String(opacity)
      if (p < 1) requestAnimationFrame(step)
      else {
        lo.style.clipPath = `circle(0px at ${bx.value}px ${by.value}px)`
        lo.style.opacity = '0'
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

async function fire() {
  if (busy) return
  busy = true
  trackBulbPosition()
  await nextTick()

  if (S.isDark) {
    // ═══════════════════════════════════════
    // 🌅 TURN ON (dark → light) — faster
    // ═══════════════════════════════════════
    flash.value = true
    await delay(100)
    flash.value = false

    await animateBulbGlow(1, 300)

    spreading.value = true
    await nextTick()

    // JS-driven spread (1.2s, p³ easing)
    const spreadP = jsSpread(1200)
    await delay(850)
    S.toggleTheme()
    S.triggerLampEvent('on')
    await spreadP
    spreading.value = false
  } else {
    // ═══════════════════════════════════════
    // 🌑 TURN OFF (light → dark)
    // Key fix: toggle theme FIRST so dark bg makes the retract visible
    // ═══════════════════════════════════════
    retracting.value = true
    await nextTick()

    // Toggle to dark immediately — the light overlay (.on kept via lightClass)
    // becomes visible against the dark background as the dark curtain fades in
    S.toggleTheme()
    S.triggerLampEvent('off')
    await nextTick()

    // JS-driven retract (1.8s) — now visible on dark background
    const retractP = jsRetract(1800)
    await retractP
    retracting.value = false

    const lo = document.querySelector('.lamp-overlay-light') as HTMLElement
    if (lo) { lo.style.clipPath = ''; lo.style.opacity = ''; lo.style.transition = ''; lo.style.animation = '' }

    await animateBulbGlow(0, 500)
  }

  busy = false
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ═══════════════════════════════════
//  RAF LOOP
// ═══════════════════════════════════
let rafId = 0
function startLoop() { rafId = requestAnimationFrame(loop) }
function stopLoop() { cancelAnimationFrame(rafId) }
function loop() { draw(); rafId = requestAnimationFrame(loop) }

// ═══════════════════════════════════
//  WATCH (external theme changes)
// ═══════════════════════════════════
watch(isLit, (val) => {
  if (!busy) {
    bulbGlow = val ? 1 : 0
    draw()
  }
})

// ═══════════════════════════════════
//  LIFE
// ═══════════════════════════════════
onMounted(() => {
  setupCanvas()
  trackBulbPosition()
  bulbGlow = isLit.value ? 1 : 0
  draw()

  const onResize = () => {
    setupCanvas()
    trackBulbPosition()
    draw()
  }
  window.addEventListener('resize', onResize)
  ;(window as any).__lampResize = onResize
})

onUnmounted(() => {
  stopLoop()
  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseup', onUp)
  document.removeEventListener('touchmove', onMove)
  document.removeEventListener('touchend', onUp)
  const onResize = (window as any).__lampResize
  if (onResize) { window.removeEventListener('resize', onResize); delete (window as any).__lampResize }
})
</script>

<style>
/* ═══════════════════════════════════════════════
   COMPACT CANVAS (330×330, visually 165×165 via CSS scale(0.5))
   Extra padding on all 4 sides prevents bead from being clipped at max pull.
   CSS top/right adjusted so lamp visual position is unchanged.
   ═══════════════════════════════════════════════ */
.lamp-canvas {
  position: fixed;
  top: -29px;
  right: -20px;
  touch-action: none;
  width: 165px;
  height: 165px;
  z-index: 99999;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
  transform: scale(0.5);
  transform-origin: top right;
  pointer-events: auto;
  overflow: visible;
}
@media (max-width: 768px) {
  .lamp-canvas {
    z-index: 99998;
    left: -3%;
    right: 0%;
    /* top: 0px; */
    width: 126px;
    height: 126px;
    transform: scale(0.38) translate(-50%);
  }
}
.lamp-canvas:active { cursor: grabbing; }

/* ═══════════════════════════════════════════════
   1. DARK CURTAIN
   ═══════════════════════════════════════════════ */
.lamp-overlay-dark {
  position: fixed; inset: 0; pointer-events: none; z-index: 99990;
  opacity: 0;
  background:
    radial-gradient(ellipse 80vmax 55vmax at var(--bx,50vw) var(--by,45vh),
      rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 40%,
      rgba(0,0,0,0.05) 78%, transparent 100%);
  transition: opacity 0.8s cubic-bezier(.4,0,.2,1);
}
.lamp-overlay-dark.on { opacity: 1; }
@media (max-width: 768px) {
  .lamp-overlay-dark { z-index: 990; }
}

/* ═══════════════════════════════════════════════
   2. LIGHT OVERLAY
   Base state: invisible. Spread/retract/on states applied via classes.
   ═══════════════════════════════════════════════ */
.lamp-overlay-light {
  position: fixed; pointer-events: none; z-index: 99991;
  left: 0; top: 0; width: 100vw; height: 100vh;
  opacity: 0;
  background:
    radial-gradient(circle 180px at var(--bx,50vw) var(--by,40vh),
      rgba(255,255,245,0.35) 0%, rgba(255,243,200,0.18) 40%, transparent 70%),
    radial-gradient(circle 600px at var(--bx,50vw) var(--by,42vh),
      rgba(255,224,140,0.12) 0%, rgba(255,183,77,0.05) 50%, transparent 80%),
    radial-gradient(ellipse 100vmax 70vmax at var(--bx,50vw) var(--by,45vh),
      rgba(255,245,220,0.06) 0%, transparent 75%);
}
@media (max-width: 768px) {
  .lamp-overlay-light { z-index: 991; }
}

/* steady on */
.lamp-overlay-light.on {
  opacity: 1;
  clip-path: circle(250vmax at var(--bx,50vw) var(--by,42vh));
}

/* .spread and .retract are now JS-driven (no CSS animation) — classes only used for ambient overlay */

/* ═══════════════════════════════════════════════
   3. AMBIENT
   ═══════════════════════════════════════════════ */
.lamp-overlay-ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 99992;
  opacity: 0;
  background:
    radial-gradient(ellipse 140vmax 110vmax at var(--bx,50vw) var(--by,50vh),
      rgba(255,248,218,0.09) 0%, rgba(255,235,170,0.04) 35%, transparent 68%);
  transition: opacity 0.8s ease 0.3s;
}
@media (max-width: 768px) {
  .lamp-overlay-ambient { z-index: 992; }
}
.lamp-overlay-ambient.on { opacity: 1; }
.lamp-overlay-ambient.in  { opacity: 1; transition: opacity 0.7s ease 0.8s; }
.lamp-overlay-ambient.out { opacity: 0; transition: opacity 0.6s ease 0.1s; }

/* ═══════════════════════════════════════════════
   4. FLASH
   ═══════════════════════════════════════════════ */
.lamp-overlay-flash {
  position: fixed; inset: 0; pointer-events: none; z-index: 99993;
  opacity: 0;
  background:
    radial-gradient(circle at var(--bx,50vw) var(--by,50vh),
      rgba(255,255,255,0.88) 0%, rgba(255,255,220,0.2) 12%, transparent 42%);
}
@media (max-width: 768px) {
  .lamp-overlay-flash { z-index: 993; }
}
.lamp-overlay-flash.fire { animation: flashPop 0.18s ease-out forwards; }
@keyframes flashPop {
  0%   { opacity: 0; transform: scale(.6); }
  20%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.3); }
}

/* ═══════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .lamp-overlay-light.spread,
  .lamp-overlay-light.retract,
  .lamp-overlay-flash.fire { animation: none !important; }
  .lamp-overlay-light.on { opacity: 1; clip-path: circle(250vmax at var(--bx,50vw) var(--by,42vh)); }
  .lamp-overlay-light:not(.on) { opacity: 0; }
  .lamp-overlay-flash { display: none; }
}
</style>
