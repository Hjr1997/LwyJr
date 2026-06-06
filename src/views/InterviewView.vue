<template>
  <div class="sp page-in" style="padding-top:var(--main-header-top)">
    <h2 class="st"><span class="gt">📋 前端面试题库</span></h2>
    <p class="ss">2026最全面试题集，涵盖字节/腾讯/快手等大厂高频考点，来源掘金/CSDN/面试鸭/牛客网</p>

    <div class="hot-bar">
      <h4>🔥 大厂高频考点 TOP 10</h4>
      <div class="hot-list">
      <div v-for="t in hotTopics" :key="t.name" class="hot-item" @click="scrollToHot(t.name)">
        <span class="hot-name">{{t.name}}</span>
        <span class="hot-count">{{t.count}}次</span>
        <span class="hot-trend" :class="t.trend">{{t.trend==='up'?'↑':'→'}}</span>
      </div>
      </div>
    </div>

    <div class="actions">
      <button class="abtn" :class="{on:mode==='expand'}" @click="mode='expand'">全部展开</button>
      <button class="abtn" :class="{on:mode==='collapse'}" @click="mode='collapse'">全部折叠</button>
      <button class="abtn" :class="{on:mode==='hot'}" @click="mode='hot'">仅高频</button>
      <button class="abtn" :class="{on:mode==='hard'}" @click="mode='hard'">仅困难</button>
      <button class="abtn" :class="{on:mode==='easy'}" @click="mode='easy'">仅基础</button>
      <span class="stats">共 {{totalQ}} 题 · {{totalEasy}} 基础 · {{totalHot}} 高频 · {{totalHard}} 困难</span>
    </div>

    <div v-for="cat in categories" :key="cat.name" class="cat" :data-cat="cat.name">
      <div class="cat-h" @click="toggleCat(cat.name)">
        <span class="cat-icon">{{cat.icon}}</span>
        <h3>{{cat.name}}</h3>
        <span class="cat-desc">{{cat.desc}}</span>
        <span class="cat-count">{{cat.questions.length}} 题</span>
        <span class="cat-arrow" :class="{on:openCats.has(cat.name)}">▼</span>
      </div>
      <div v-if="openCats.has(cat.name)" class="cat-body">
        <div v-for="q in cat.questions" :key="q.q" class="q-item" :class="{hot:q.hot,hard:q.hard}">
          <div class="q-h" @click="toggleQ(q.q)">
            <span class="q-tags">
              <span v-if="q.hot" class="tag hot-tag">高频</span>
              <span v-if="q.hard" class="tag hard-tag">困难</span>
            </span>
            <span class="q-text">{{q.q}}</span>
            <span class="q-arrow" :class="{on:expandedKeys.has(q.q)}">▼</span>
          </div>
          <div v-if="expandedKeys.has(q.q)" class="q-a">
            <div class="q-a-label">💡 答案要点</div>
            <p>{{q.a}}</p>
            <button v-if="q.example" class="ex-btn" @click.stop="openExample(q.example)">
              💻 查看代码示例
            </button>
          </div>
        </div>
      </div>
    </div>

    <ExampleModal ref="exampleModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { interviewQuestions as categories, hotTopics } from '@/data/interview-questions'
import type { IQExample } from '@/data/interview-questions'
import ExampleModal from '@/components/ExampleModal.vue'

const openCats = reactive(new Set<string>())
const expandedKeys = reactive(new Set<string>())
const mode = ref<'expand'|'collapse'|'hot'|'hard'|'easy'>('collapse')
const exampleModal = ref<InstanceType<typeof ExampleModal>|null>(null)

const totalQ = computed(() => categories.reduce((s, c) => s + c.questions.length, 0))
const totalHot = computed(() => categories.reduce((s, c) => s + c.questions.filter(q => q.hot).length, 0))
const totalHard = computed(() => categories.reduce((s, c) => s + c.questions.filter(q => q.hard).length, 0))
const totalEasy = computed(() => categories.reduce((s, c) => s + c.questions.filter(q => !q.hard && !q.hot).length, 0))

function toggleCat(name: string) {
  if (openCats.has(name)) openCats.delete(name)
  else openCats.add(name)
}

function toggleQ(key: string) {
  if (expandedKeys.has(key)) expandedKeys.delete(key)
  else expandedKeys.add(key)
}

function openExample(example: IQExample) {
  exampleModal.value?.open(example)
}

function expandAll() {
  categories.forEach(c => openCats.add(c.name))
  categories.forEach(c => c.questions.forEach(q => expandedKeys.add(q.q)))
}

function collapseAll() {
  openCats.clear()
  expandedKeys.clear()
}

function showOnlyHot() {
  openCats.clear()
  expandedKeys.clear()
  categories.forEach(c => {
    if (c.questions.some(q => q.hot)) openCats.add(c.name)
    c.questions.forEach(q => { if (q.hot) expandedKeys.add(q.q) })
  })
}

function showOnlyHard() {
  openCats.clear()
  expandedKeys.clear()
  categories.forEach(c => {
    if (c.questions.some(q => q.hard)) openCats.add(c.name)
    c.questions.forEach(q => { if (q.hard) expandedKeys.add(q.q) })
  })
}

function showOnlyEasy() {
  openCats.clear()
  expandedKeys.clear()
  categories.forEach(c => {
    const easy = c.questions.filter(q => !q.hard && !q.hot)
    if (easy.length) openCats.add(c.name)
    easy.forEach(q => expandedKeys.add(q.q))
  })
}

// 热门考点名称 → 分类名称的关键词映射
const topicCatMap: Record<string, string> = {
  '事件循环': '异步编程',
  '异步': '异步编程',
  '框架对比': 'Vue vs React 深度对比',
  '虚拟DOM': '虚拟DOM & 框架原理',
  'Diff': '虚拟DOM & 框架原理',
  'Fiber': '虚拟DOM & 框架原理',
  '响应式': 'Vue',
  '闭包': 'JavaScript',
  'Promise': 'JavaScript',
  'SSE': '网络协议',
  'WebSocket': '网络协议',
  '虚拟列表': '性能优化',
  '性能优化': '性能优化',
  '缓存策略': '浏览器',
  'TypeScript': 'TypeScript',
  '防抖': 'JavaScript',
  '节流': 'JavaScript',
}

function scrollToHot(topicName: string) {
  let catName = topicCatMap[topicName]
  if (!catName) {
    // 模糊匹配：遍历映射表的key，检查是否是topicName的子串
    for (const [key, val] of Object.entries(topicCatMap)) {
      if (topicName.includes(key)) { catName = val; break }
    }
  }
  if (!catName) {
    // 最后尝试直接匹配分类名
    const cat = categories.find(c => topicName.includes(c.name) || c.name.includes(topicName))
    catName = cat?.name || ''
  }
  if (!catName) return
  openCats.add(catName)
  nextTick(() => {
    const el = document.querySelector(`[data-cat="${catName}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// mode 变化时触发对应操作
watch(mode, (v) => {
  if (v === 'expand') expandAll()
  else if (v === 'collapse') collapseAll()
  else if (v === 'hot') showOnlyHot()
  else if (v === 'hard') showOnlyHard()
  else if (v === 'easy') showOnlyEasy()
})
</script>

<style scoped>
.sp{max-width:var(--max-width);margin:0 auto;padding:0 24px 100px}
.st{font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:8px;font-weight:900;letter-spacing:-.03em}
.gt{background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ss{text-align:center;color:var(--text-secondary);max-width:600px;margin:0 auto 32px;font-size:1.05rem}

.hot-bar{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px}
.hot-bar h4{margin:0 0 16px;font-size:1rem;font-weight:700}
.hot-list{display:flex;flex-wrap:wrap;gap:8px}
.hot-item{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-full);font-size:.78rem;cursor:pointer;transition:all .25s;min-height:44px}
.hot-item:hover{border-color:var(--primary);transform:translateY(-1px)}
.hot-name{color:var(--text);font-weight:600}
.hot-count{color:var(--primary);font-weight:700}
.hot-trend{color:var(--success);font-weight:700;font-size:.85rem}
.hot-trend.stable{color:var(--text-secondary)}

.actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.abtn{padding:7px 16px;border-radius:var(--radius-full);background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);font-size:.8rem;cursor:pointer;transition:all .25s;min-height:44px;min-width:44px}
.abtn:hover{border-color:var(--primary);color:var(--primary)}
.abtn.on{background:rgba(0,113,227,.1);border-color:var(--primary);color:var(--primary);font-weight:600}
.stats{margin-left:auto;font-size:.78rem;color:var(--text-secondary);white-space:nowrap}

.cat{margin-bottom:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;transition:all .3s}
.cat:hover{border-color:rgba(0,113,227,.3)}
.cat-h{display:flex;align-items:center;gap:10px;padding:18px 22px;cursor:pointer;transition:background .2s}
.cat-h:hover{background:var(--bg)}
.cat-icon{font-size:1.4rem}
.cat-h h3{margin:0;font-size:1.05rem;font-weight:700;min-width:60px}
.cat-desc{color:var(--text-secondary);font-size:.8rem;flex:1}
.cat-count{font-size:.7rem;padding:2px 10px;background:rgba(0,113,227,.08);color:var(--primary);border-radius:20px;font-weight:600;white-space:nowrap}
.cat-arrow{font-size:.6rem;color:var(--text-secondary);transition:transform .3s}
.cat-arrow.on{transform:rotate(180deg)}

.cat-body{border-top:1px solid var(--border)}
.q-item{border-bottom:1px solid var(--border);transition:background .2s}
.q-item:last-child{border-bottom:none}
.q-item:hover{background:var(--bg)}
.q-item.hot{border-left:3px solid var(--warning)}
.q-item.hard{border-left:3px solid var(--danger)}

.q-h{display:flex;align-items:flex-start;gap:10px;padding:14px 22px;cursor:pointer;min-height:44px}
.q-tags{display:flex;gap:4px;flex-shrink:0;padding-top:2px}
.tag{padding:1px 8px;border-radius:10px;font-size:.65rem;font-weight:700;white-space:nowrap}
.hot-tag{background:rgba(255,159,10,.12);color:var(--warning)}
.hard-tag{background:rgba(255,59,48,.1);color:var(--danger)}
.q-text{flex:1;font-size:.88rem;font-weight:500;line-height:1.5;color:var(--text)}
.q-arrow{font-size:.6rem;color:var(--text-secondary);transition:transform .3s;padding-top:5px}
.q-arrow.on{transform:rotate(180deg)}

.q-a{padding:0 22px 18px 56px}
.q-a-label{font-size:.75rem;color:var(--primary);font-weight:700;margin-bottom:6px}
.q-a p{margin:0 0 10px;font-size:.85rem;color:var(--text-secondary);line-height:1.75;background:var(--bg);padding:12px 16px;border-radius:var(--radius);border:1px solid var(--border)}
.ex-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:var(--radius-full);background:rgba(0,113,227,.1);border:1px solid rgba(0,113,227,.25);color:var(--primary);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .25s}
.ex-btn:hover{background:rgba(0,113,227,.18);border-color:var(--primary);transform:translateY(-1px)}

@media(max-width:640px){
  .actions{gap:6px}
  .stats{margin-left:0;width:100%}
  .cat-h{flex-wrap:wrap;gap:6px}
  .cat-desc{width:100%;order:4}
  .q-a{padding-left:22px}
  .hot-list{gap:6px}
  .sp{padding:0 16px 60px}
  .ss{font-size:.92rem}
  .hot-bar{padding:16px}
  .q-h{padding:12px 16px}
  .q-a{padding:0 16px 14px 42px}
}
</style>
