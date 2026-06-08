<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="visible" class="sheet-overlay" @click.self="close">
        <div class="sheet-container">
          <!-- Handle -->
          <div class="sheet-handle" />
          <!-- Header -->
          <div class="sheet-header">
            <h2 class="sheet-title">{{ data.name || data.tag || data.property }}</h2>
            <button class="sheet-close" @click="close" aria-label="关闭">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(128,128,128,0.2)"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <!-- Body -->
          <div class="sheet-body">
            <p class="sheet-desc" v-if="data.desc">{{ data.desc }}</p>

            <!-- Usage -->
            <div v-if="data.usage" class="sheet-section">
              <h4 class="section-h">💡 用法示例</h4>
              <pre class="sheet-code">{{ data.usage }}</pre>
            </div>

            <!-- HTML: attrs -->
            <div v-if="data.attrs" class="sheet-section">
              <h4 class="section-h">📋 属性列表</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="a in data.attrs" :key="a.name">
                      <td class="td-k">{{ a.name }}</td>
                      <td class="td-t">{{ a.type }}</td>
                      <td class="td-d">{{ a.default }}</td>
                      <td class="td-v">{{ a.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- childAttrs -->
            <div v-if="data.childAttrs" v-for="c in data.childAttrs" :key="c.element" class="sheet-section">
              <h4 class="section-h">📋 {{ c.element }} 子元素属性</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="a in c.attrs" :key="a.name">
                      <td class="td-k">{{ a.name }}</td><td class="td-t">{{ a.type }}</td><td class="td-d">{{ a.default }}</td><td class="td-v">{{ a.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- childTags -->
            <div v-if="data.childTags" class="sheet-section">
              <h4 class="section-h">🏷️ 子标签</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>标签</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="t in data.childTags" :key="t.tag"><td class="td-k">{{ t.tag }}</td><td class="td-v">{{ t.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- tags list -->
            <div v-if="data.tags" class="sheet-section">
              <h4 class="section-h">🏷️ 标签列表</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>标签</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="t in data.tags" :key="t.tag"><td class="td-k">{{ t.tag }}</td><td class="td-v">{{ t.desc }}{{ t.attrs && t.attrs.length ? ' (' + t.attrs.map((a: any) => a.name + ': ' + a.desc).join(', ') + ')' : '' }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- entities -->
            <div v-if="data.entities" class="sheet-section">
              <h4 class="section-h">📝 常用实体</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>实体</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="e in data.entities" :key="e.name"><td class="td-k"><code>{{ e.name }}</code></td><td class="td-v">{{ e.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- concepts -->
            <div v-if="data.concepts" class="sheet-section">
              <h4 class="section-h">📖 核心概念</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>概念</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="c in data.concepts" :key="c.name"><td class="td-k">{{ c.name }}</td><td class="td-v">{{ c.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- methods -->
            <div v-if="data.methods" class="sheet-section">
              <h4 class="section-h">⚙️ 方法/属性</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>名称</th><th v-if="hasMethodType">类型</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="m in data.methods" :key="m.name">
                      <td class="td-k">{{ m.name }}</td>
                      <td v-if="hasMethodType" class="td-t">{{ m.type || m.scope || '' }}</td>
                      <td class="td-v">{{ m.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- properties (for JS entries like Math, History) -->
            <div v-if="data.properties" class="sheet-section">
              <h4 class="section-h">📦 属性</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="p in data.properties" :key="p.name"><td class="td-k">{{ p.name }}</td><td class="td-t">{{ p.type }}</td><td class="td-v">{{ p.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- events -->
            <div v-if="data.events" class="sheet-section">
              <h4 class="section-h">🎯 事件</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>事件</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="e in data.events" :key="e.name"><td class="td-k">{{ e.name }}</td><td class="td-v">{{ e.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- eventTypes (for js.event) -->
            <div v-if="data.eventTypes" class="sheet-section">
              <h4 class="section-h">🎯 事件类型</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>事件名</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="e in data.eventTypes" :key="e.name"><td class="td-k">{{ e.name }}</td><td class="td-v">{{ e.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- options (for js.fetch) -->
            <div v-if="data.options" class="sheet-section">
              <h4 class="section-h">⚙️ 配置选项</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>参数</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="o in data.options" :key="o.name"><td class="td-k">{{ o.name }}</td><td class="td-v">{{ o.desc }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CSS: props -->
            <div v-if="data.props" class="sheet-section">
              <h4 class="section-h">📋 属性列表</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>属性</th><th>可选值</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="p in data.props" :key="p.name">
                      <td class="td-k">{{ p.name }}</td><td class="td-t">{{ p.values }}</td><td class="td-v">{{ p.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CSS: 常用断点 -->
            <div v-if="data['常用断点']" class="sheet-section">
              <h4 class="section-h">📱 常用断点</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>断点</th><th>写法</th></tr></thead>
                  <tbody>
                    <tr v-for="(val, key) in data['常用断点']" :key="key"><td class="td-k">{{ key }}</td><td class="td-v"><code>{{ val }}</code></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- JS: 对比 -->
            <div v-if="data['对比']" class="sheet-section">
              <h4 class="section-h">⚖️ 对比</h4>
              <div class="sheet-table-wrap">
                <table class="sheet-table">
                  <thead><tr><th>方案</th><th>说明</th></tr></thead>
                  <tbody>
                    <tr v-for="(val,key) in data['对比']" :key="key"><td class="td-k">{{ key }}</td><td class="td-v">{{ val }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- JS DOM methods -->
            <div v-if="data.jsMethods" class="sheet-section">
              <h4 class="section-h">⚡ JavaScript 操作</h4>
              <div v-for="m in data.jsMethods" :key="m.code" class="js-item">
                <span class="js-cat">{{ m.category }}</span>
                <pre class="js-code">{{ m.code }}</pre>
                <p class="js-desc">{{ m.desc }}</p>
              </div>
            </div>

            <!-- tips -->
            <div v-if="data.tips" class="sheet-section">
              <h4 class="section-h">💡 要点</h4>
              <ul class="sheet-tips">
                <li v-for="t in data.tips" :key="t" v-html="sanitize(t)"></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { sanitize } from '@/utils/sanitize'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

const visible = ref(false)
const data = ref<any>({})
const hasMethodType = computed(() => data.value.methods?.some((m:any) => m.type || m.scope))
const { lock, unlock } = useBodyScrollLock()

let cache: any = null
async function loadRef() {
  if (!cache) cache = (await import('@/data/props-reference.json')).default
  return cache
}

async function open(category: string, key: string) {
  const ref = await loadRef()
  const cat = (ref as any)[category]
  if (!cat || !cat[key]) return
  data.value = cat[key]
  visible.value = true
  lock()
}

function close() {
  visible.value = false
  // 延迟解锁 body，等 leave 动画完成（.3s）后恢复
  setTimeout(() => { unlock() }, 320)
}

// ESC key to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  unlock() // 组件卸载时安全恢复滚动
})
defineExpose({ open, close })
</script>

<style scoped>
/* Sheet Overlay */
.sheet-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:0;background:rgba(0,0,0,.45);touch-action:none}
@media(min-width:768px){.sheet-overlay{align-items:center;padding:24px}}

/* Sheet Container */
.sheet-container{background:var(--bg-elevated,#fff);border-radius:var(--radius-xl,24px) var(--radius-xl,24px) 0 0;max-width:820px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 -8px 40px rgba(0,0,0,.15);border:1px solid var(--border,rgba(0,0,0,.08));overflow:hidden;transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .5s cubic-bezier(.34,1.56,.64,1)}
@media(min-width:768px){.sheet-container{border-radius:var(--radius-xl,24px);max-height:85vh}}

/* Handle */
.sheet-handle{width:36px;height:5px;background:var(--text-tertiary,#ccc);border-radius:3px;margin:10px auto 0;opacity:.4}
@media(min-width:768px){.sheet-handle{display:none}}

/* Header */
.sheet-header{display:flex;align-items:center;justify-content:space-between;padding:16px 24px 12px;flex-shrink:0}
.sheet-title{margin:0;font-size:1.2rem;font-weight:700;color:var(--text);letter-spacing:-.02em}
.sheet-close{width:44px;height:44px;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);transition:all .2s var(--spring-smooth,cubic-bezier(.16,1,.3,1));flex-shrink:0}
.sheet-close:hover{background:rgba(0,0,0,.06);transform:scale(1.1)}
[data-theme='dark'] .sheet-close:hover{background:rgba(255,255,255,.08)}

/* Body */
.sheet-body{padding:4px 24px 24px;overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch}
.sheet-desc{color:var(--text-secondary);font-size:.92rem;line-height:1.65;margin:0 0 16px}

/* Sections */
.sheet-section{margin-bottom:20px}
.section-h{font-size:.82rem;font-weight:700;color:var(--primary);margin:0 0 8px;letter-spacing:.02em;text-transform:uppercase}

/* Code */
.sheet-code{background:var(--bg,rgba(0,0,0,.03));color:var(--text);padding:14px 18px;border-radius:var(--radius,12px);font-family:'SF Mono','Fira Code',monospace;font-size:.78rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;margin:0;border:1px solid var(--border,rgba(0,0,0,.06))}
[data-theme='dark'] .sheet-code{background:rgba(255,255,255,.04)}

/* Table */
.sheet-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border,rgba(0,0,0,.06));border-radius:var(--radius,12px)}
.sheet-table{width:100%;border-collapse:collapse;font-size:.78rem}
.sheet-table th{background:rgba(0,113,227,.06);color:var(--primary);padding:8px 12px;text-align:left;font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;border-bottom:1px solid var(--border,rgba(0,0,0,.04))}
.sheet-table td{padding:7px 12px;border-bottom:1px solid rgba(0,0,0,.03);color:var(--text-secondary);vertical-align:top;line-height:1.5}
.td-k{color:var(--text);font-weight:600;font-family:'SF Mono',monospace;font-size:.76rem;white-space:nowrap}
.td-t{color:var(--primary);font-size:.72rem;white-space:nowrap}
.td-d{color:var(--text-tertiary);font-size:.72rem}
.td-v{font-size:.8rem}

/* JS DOM methods */
.js-item{margin-bottom:10px;padding:10px 14px;background:rgba(0,113,227,.04);border-radius:var(--radius-sm,10px);border-left:2px solid var(--primary)}
.js-cat{font-size:.68rem;color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.js-code{background:rgba(0,0,0,.03);margin:6px 0 4px;padding:8px 12px;border-radius:8px;font-size:.7rem;line-height:1.45}
.js-desc{color:var(--text-secondary);font-size:.75rem;margin:0}

/* Tips */
.sheet-tips{margin:0;padding-left:18px;color:var(--text-secondary);font-size:.85rem;line-height:1.8}
.sheet-tips code{background:rgba(0,113,227,.08);padding:1px 6px;border-radius:4px;color:var(--primary);font-size:.8rem}

@media(max-width:640px){
  .sheet-container{border-radius:24px 24px 0 0}
  .sheet-body{padding:4px 16px 20px}
  .sheet-header{padding:12px 16px 10px}
  .sheet-table{font-size:.7rem}
}
</style>

<!-- Transition exactly matching ExampleModal (unscoped for Vue dynamic classes) -->
<style>
/* 基础状态：overlay 常驻 backdrop-filter */
.sheet-overlay {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sheet-enter-active{transition:opacity .5s cubic-bezier(.34,1.56,.64,1),backdrop-filter .5s ease,-webkit-backdrop-filter .5s ease}
.sheet-enter-active .sheet-container{transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .5s cubic-bezier(.34,1.56,.64,1)}
.sheet-enter-from{opacity:0;backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px)}
.sheet-enter-from .sheet-container{opacity:0;transform:translateY(100%) scale(.88)}
@media(min-width:768px){.sheet-enter-from .sheet-container{transform:translateY(40px) scale(.88)}}

.sheet-leave-active{transition:opacity .25s ease,backdrop-filter .25s ease,-webkit-backdrop-filter .25s ease}
.sheet-leave-active .sheet-container{transition:transform .25s cubic-bezier(.4,0,.2,1),opacity .25s ease}
.sheet-leave-to{opacity:0;backdrop-filter:none;-webkit-backdrop-filter:none;transform:none}
.sheet-leave-to .sheet-container{opacity:0;transform:translateY(40%) scale(.9)}
@media(min-width:768px){.sheet-leave-to .sheet-container{transform:translateY(15px) scale(.94)}}
</style>
