<template>
  <canvas ref="canvasRef" class="webgl-bg"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()
let animId = 0
let mouseX = 0.5
let mouseY = 0.5

const VERTEX = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_dark;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  
  // flowing orbs
  float d1 = length(st - vec2(cos(u_time * 0.3) * 0.35, sin(u_time * 0.4) * 0.25 + 0.05));
  float d2 = length(st - vec2(sin(u_time * 0.35 + 1.2) * 0.4 - 0.1, cos(u_time * 0.25 + 0.8) * 0.3));
  float d3 = length(st - vec2(cos(u_time * 0.22 + 2.0) * 0.3 + 0.2, sin(u_time * 0.32 + 0.3) * 0.35));
  float d4 = length(st - vec2(sin(u_time * 0.28 + 3.0) * 0.45, cos(u_time * 0.38) * 0.2 - 0.1));
  
  // mouse influence
  vec2 mouse = (u_mouse / u_resolution) * 2.0 - 1.0;
  float dm = length(st - mouse * 0.25);
  
  float o1 = smoothstep(0.65, 0.0, d1) * 0.25;
  float o2 = smoothstep(0.55, 0.0, d2) * 0.20;
  float o3 = smoothstep(0.5, 0.0, d3) * 0.18;
  float o4 = smoothstep(0.6, 0.0, d4) * 0.15;
  float om = smoothstep(0.4, 0.0, dm) * 0.08;
  
  vec3 c1 = vec3(0.00, 0.44, 0.89); // #0071e3
  vec3 c2 = vec3(0.35, 0.34, 0.84); // #5856d6
  vec3 c3 = vec3(1.00, 0.22, 0.37); // #ff375f
  vec3 c4 = vec3(0.20, 0.84, 0.29); // #34c759
  
  vec3 col = c1 * o1 + c2 * o2 + c3 * o3 + c4 * o4 + c1 * om;
  
  // noise texture overlay
  float n = fbm(uv * 200.0 + u_time * 0.05) * 0.03;
  col += n;
  
  // dark mode boost
  float alpha = mix(0.15, 0.28, u_dark) * (col.r + col.g + col.b) / 1.5;
  alpha = clamp(alpha, 0.06, 0.25);
  
  gl_FragColor = vec4(col, alpha);
}`

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Shader compile:', gl.getShaderInfoLog(shader))
  }
  return shader
}

function init() {
  const canvas = canvasRef.value
  if (!canvas) return
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false })
  if (!gl) return

  const program = gl.createProgram()!
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  gl.useProgram(program)

  // fullscreen quad
  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
  const apos = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(apos)
  gl.vertexAttribPointer(apos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'u_resolution')
  const uTime = gl.getUniformLocation(program, 'u_time')
  const uMouse = gl.getUniformLocation(program, 'u_mouse')
  const uDark = gl.getUniformLocation(program, 'u_dark')

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)

  const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
  window.addEventListener('mousemove', onMove, { passive: true })
  const onTouch = (e: TouchEvent) => { if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY } }
  window.addEventListener('touchmove', onTouch, { passive: true })

  const start = performance.now()
  let running = true
  const onVisible = () => { running = !document.hidden }
  document.addEventListener('visibilitychange', onVisible)
  const animate = () => {
    if (running) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - start) * 0.001)
      gl.uniform2f(uMouse, mouseX * (window.devicePixelRatio || 1), mouseY * (window.devicePixelRatio || 1))
      gl.uniform1f(uDark, isDark ? 1.0 : 0.0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    animId = requestAnimationFrame(animate)
  }
  animate()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('touchmove', onTouch)
    document.removeEventListener('visibilitychange', onVisible)
    gl.deleteProgram(program)
    gl.deleteBuffer(buf)
  })
}

onMounted(init)
</script>

<style scoped>
.webgl-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>

<style>
@media (prefers-reduced-motion: reduce) {
  .webgl-bg { opacity: 0.12; }
}
</style>
