<template>
  <div class="sp page-in" style="padding-top:var(--main-header-top)">
    <h2 class="st"><span class="gt">🎓 教程中心</span></h2>
    <p class="ss">从零到全栈的系统化学习，每一步都有可运行代码</p>
    <div class="tt-wrap">
      <!-- 基础 -->
      <div class="tt-label">🟢 基础</div>
      <div class="tt">
        <button v-for="t in tabList" :key="t.v" class="tb" :class="{on:curTab===t.v}" @click="curTab=t.v">{{t.i}} {{t.l}} <span class="tc">{{stepCounts[t.v]||0}}</span></button>
      </div>
      <!-- 核心 -->
      <div class="tt-label">🟡 核心</div>
      <div class="tt">
        <button v-for="t in coreTabList" :key="t.v" class="tb" :class="{on:curTab===t.v}" @click="curTab=t.v">{{t.i}} {{t.l}} <span class="tc">{{stepCounts[t.v]||0}}</span></button>
      </div>
      <!-- 扩展 -->
      <button class="tb adv-toggle" @click="showAdv=!showAdv">{{showAdv?'🟠 扩展 ▴':'🟠 扩展 ▾'}}</button>
      <div v-if="showAdv" class="tt tt-adv" @click="showAdv=false">
        <button v-for="t in advTabList" :key="t.v" class="tb" :class="{on:curTab===t.v}" @click="curTab=t.v">{{t.i}} {{t.l}} <span class="tc">{{stepCounts[t.v]||0}}</span></button>
      </div>
    </div>
    <div class="tl">
      <aside class="ts">
        <h4>📚 {{activeLabel}} 课程</h4>
        <!-- 难度筛选 -->
        <div class="diff-filter">
          <button class="df-btn" :class="{on:diffFilter==='all'}" @click="diffFilter='all'">全部</button>
          <button v-for="d in availableDiffs" :key="d" class="df-btn" :class="{on:diffFilter===d}" @click="diffFilter=d">{{ diffLabels[d] || d }}</button>
        </div>
        <div v-for="tu in filteredAndSorted" :key="tu.id" class="ci" :class="{on:ch===tu.id}" @click="ch=tu.id;renderCodes()">
          <div>
            <div class="ct">{{tu.title}}</div>
            <div class="cm">{{tu.steps.length}}节·{{tu.difficulty}}</div>
          </div>
          <div class="ci-prog">{{tu.steps.filter(s=>store.isTutorialDone(s.id)).length}}/{{tu.steps.length}}</div>
        </div>
        <div v-if="filteredList.length===0" class="em">暂无教程</div>
      </aside>
      <div class="tm">
        <div v-if="cur" :key="cur.id" class="chapter-enter">
          <div class="th"><h3>{{cur.title}}</h3><p class="tdd">{{cur.desc}}</p><span class="db">🎯 {{cur.difficulty}}</span></div>
          <div v-for="(s,i) in cur.steps" :key="s.id" class="step">
            <div class="sh"><span class="sn">{{i+1}}</span><h4>{{s.title}}</h4><button v-if="s.propRef" class="prop-btn" @click.stop="openPropModal(s.propRef)">📋 全属性</button></div>
            <p class="sc" v-html="sanitize(s.content)"></p>
            <div v-if="hasCode(s) && !isNode && !isOverview" class="cp">
              <div class="cbar"><div class="dots"><span></span><span></span><span></span></div><button class="crun" @click="runCode(s.id)">▶ Run</button></div>
              <div class="cbody" :class="{cbodyFull:isFullscreenStep()}">
                <div class="ced" v-show="!isFullscreenStep()"><CodeEditor v-if="stepCodes[s.id]" v-model="stepCodes[s.id].combined" language="html" /></div>
                <div class="cpv" :class="{cpvFull:isFullscreenStep()}"><iframe :id="'frm-'+s.id" class="cif" sandbox="allow-scripts allow-same-origin allow-modals"></iframe></div>
              </div>
            </div>
            <!-- 大纲步骤：不显示任何代码面板，内容即大纲 -->
            <div v-if="isNode && stepCodes[s.id] && stepCodes[s.id].js.trim()" class="cp node-cp">
              <div class="cbar node-bar"><span class="nlabel">Terminal</span><button class="copy-btn" @click="copyNodeCode(s.id, $event)">Copy</button></div>
              <pre class="ncode-pre">{{ stepCodes[s.id].js }}</pre>
              <div v-if="stepCodes[s.id].html.trim()" class="noutput" v-html="sanitize(stepCodes[s.id].html)"></div>
            </div>
            <div v-else-if="isNode && stepCodes[s.id] && stepCodes[s.id].html.trim()" class="cp node-cp">
              <div class="noutput" style="border-top:none;border-radius:0" v-html="sanitize(stepCodes[s.id].html)"></div>
            </div>
            <div v-if="s.tip" class="tip" v-html="sanitize(s.tip)"></div>
            <button class="bcom" :class="{done:store.isTutorialDone(s.id)}" @click="store.markTutorialComplete(s.id)">{{store.isTutorialDone(s.id)?'✓ Completed':'Mark Done'}}</button>
            <div class="step-nav">
              <button v-if="i>0" class="snav-btn" @click="scrollToStep(i-1)">← 上一步</button>
              <button v-if="i<cur.steps.length-1" class="snav-btn snav-next" @click="scrollToStep(i+1)">下一步 →</button>
            </div>
            <!-- 相关概念推荐 -->
            <div v-if="relatedConcepts(s.id).length" class="related-box">
              <span class="related-label">🔗 相关概念：</span>
              <button v-for="rc in relatedConcepts(s.id)" :key="rc.courseId" class="related-link"
                @click="navigateToConcept(rc)">{{ rc.icon }} {{ rc.title }}</button>
            </div>
            <!-- 学习笔记 -->
            <div class="notes-box">
              <button class="notes-toggle" @click="toggleNotes(s.id)">
                {{ noteOpen[s.id] ? '📝 收起笔记' : '📝 学习笔记' }}
                <span v-if="!noteOpen[s.id] && getNoteText(s.id)" class="notes-indicator">●</span>
              </button>
              <div v-if="noteOpen[s.id]" class="notes-editor">
                <textarea
                  :value="getNoteText(s.id)"
                  @input="saveNote(s.id, ($event.target as HTMLTextAreaElement).value)"
                  placeholder="在这里记录你的学习心得、要点总结..."
                  class="notes-textarea"
                  rows="3"
                ></textarea>
                <span class="notes-hint">自动保存到本地 · {{ auth.isLoggedIn ? '已登录：云端同步' : '登录后可云端同步' }}</span>
              </div>
            </div>
            <!-- 挑战练习（仅已完成步骤显示） -->
            <div v-if="store.isTutorialDone(s.id) && getChallenge(s.id)" class="challenge-box">
              <div class="challenge-header">🏆 挑战练习</div>
              <p class="challenge-text">{{ getChallenge(s.id) }}</p>
            </div>
            <!-- 章末测验（仅当所有步骤完成且该章节有测验数据） -->
            <div v-if="i === cur.steps.length-1 && isChapterAllDone(cur) && getQuizForChapter(cur.id)" class="quiz-box">
              <div class="quiz-header">📝 章节测验</div>
              <div v-for="(q, qi) in getQuizForChapter(cur.id)" :key="qi" class="quiz-item" :class="{correct:quizResults[cur.id+'/'+qi]===true,wrong:quizResults[cur.id+'/'+qi]===false}">
                <p class="quiz-q">{{ qi+1 }}. {{ q.q }}</p>
                <div class="quiz-options">
                  <button v-for="(opt, oi) in q.options" :key="oi" class="quiz-opt"
                    :class="{chosen:quizAnswers[cur.id+'/'+qi]===oi,reveal:quizResults[cur.id+'/'+qi]!==undefined}"
                    :disabled="quizResults[cur.id+'/'+qi]!==undefined"
                    @click="checkQuizAnswer(cur.id, qi, oi)">
                    {{ 'ABCD'[oi] }}. {{ opt }}
                  </button>
                </div>
                <div v-if="quizResults[cur.id+'/'+qi]!==undefined" class="quiz-explain" :class="{right:quizResults[cur.id+'/'+qi]}">
                  {{ quizResults[cur.id+'/'+qi] ? '✅ 正确！' : '❌ 不正确' }} {{ q.explain }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="ph"><span class="ph-icon">👈</span><h3>选择一门课程开始学习</h3><p>从左侧选择课程，逐步成长为全栈开发者</p></div>
      </div>
    </div>
  </div>
  <PropModal ref="propModal" />
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { tutorials } from '@/data/tutorials'
import PropModal from '@/components/PropModal.vue'
import { sanitize } from '@/utils/sanitize'
import { quizData } from '@/data/quiz-data'
const CodeEditor = defineAsyncComponent(() => import('@/components/CodeEditor.vue'))

const store = useAppStore()
const auth = useAuthStore()
const route = useRoute()
const curTab = ref((route.query.tab as string) || 'html')
const ch = ref('')
const stepCodes = reactive<Record<string,Record<string,string>>>({})
const propModal = ref<InstanceType<typeof PropModal>|null>(null)

// 基础课程（零基础从这里开始）
const tabList = [
  {i:'🌐',l:'互联网基础',v:'internet'},
  {i:'📄',l:'HTML',v:'html'},{i:'🎨',l:'CSS',v:'css'},
  {i:'⚡',l:'JavaScript',v:'js'},
]
// 核心课程（进阶必修）
const coreTabList = [
  {i:'🔷',l:'TypeScript',v:'ts'},{i:'💚',l:'Vue 3',v:'vue3'},
  {i:'⚛️',l:'React',v:'react2'},{i:'🟢',l:'Node.js',v:'node'},
]
// 扩展课程（按需学习）
const advTabList = [
  {i:'⚡',l:'Vite',v:'vite'},{i:'🧩',l:'Pinia',v:'pinia'},{i:'🗄',l:'Zustand',v:'zustand'},
  {i:'🔷',l:'Dva',v:'dva'},{i:'🎯',l:'Canvas/SVG',v:'canvas'},{i:'🔧',l:'构建工具',v:'build'},
  {i:'🗄',l:'数据库',v:'db'},{i:'🚀',l:'项目实战',v:'project'},{i:'🔗',l:'全栈实战',v:'fullstack'},
]
const allTabs = [...tabList, ...coreTabList, ...advTabList]
const showAdv = ref(false)
const diffFilter = ref('all')
const stepCounts:Record<string,number>={}
tutorials.forEach(t=>{stepCounts[t.category]=(stepCounts[t.category]||0)+t.steps.length})
const filteredList = computed(()=>tutorials.filter(t=>t.category===curTab.value))
const diffOrder: Record<string,number> = {'入门':1,'基础':2,'中级':3,'进阶':4,'高级':5}
const diffLabels: Record<string,string> = {'入门':'入门','基础':'基础','中级':'中阶','进阶':'进阶','高级':'高级'}
const availableDiffs = computed(() => {
  const set = new Set<string>()
  filteredList.value.forEach(t => { if (t.difficulty) set.add(t.difficulty) })
  return Object.keys(diffOrder).filter(d => set.has(d)).sort((a,b) => diffOrder[a]-diffOrder[b])
})
const filteredAndSorted = computed(()=>{
  let list = filteredList.value
  if (diffFilter.value !== 'all') list = list.filter(t => t.difficulty === diffFilter.value)
  return [...list].sort((a,b) => (diffOrder[a.difficulty||'']||9) - (diffOrder[b.difficulty||'']||9))
})
const cur = computed(()=>filteredList.value.find(t=>t.id===ch.value)||null)
const activeLabel = computed(()=>allTabs.find(t=>t.v===curTab.value)?.l||'')
const isNode = computed(()=>{const c=cur.value?.category;return c==='node'||c==='vite'||c==='dva'||c==='pinia'||c==='zustand'||c==='internet'||c==='db'})
const overviewIds = new Set(['h0','c25','j33','t0','r0','v0','i0','n0','net0','cv0','bld0','prj0','db0','d0','p0','z0'])
const isOverview = computed(()=>!!(cur.value&&overviewIds.has(cur.value.id)))

function buildCombined(h:string,c:string,j:string):string{
  let o='';
  const baseCSS='body{margin:0;font-family:sans-serif}';
  o+='<st'+'yle>\n'+baseCSS;
  if(c) o+='\n'+c;
  o+='\n</st'+'yle>\n';
  if(h) o+=h+'\n';
  if(j) o+='\n<scr'+'ipt>\n'+j+'\n</scr'+'ipt>\n';
  return o.trim()
}
function initStepCodes(tutorialId:string){const t=tutorials.find(t=>t.id===tutorialId);if(!t)return;t.steps.forEach(s=>{if(s.code&&!stepCodes[s.id]){const h=s.code.html||'',c=s.code.css||'',j=s.code.js||'';stepCodes[s.id]={html:h,css:c,js:j,combined:buildCombined(h,c,j)}}})}
function hasCode(s:{code?:{html?:string;css?:string;js?:string}}):boolean{if(!s.code)return false;const j=(s.code.js||'').trim();const h=(s.code.html||'').trim();const c=(s.code.css||'').trim();return !!(j||h||c)}

function runCode(stepId:string){
  const iframe=document.getElementById('frm-'+stepId) as HTMLIFrameElement|null;
  if(!iframe)return;
  const cm=stepCodes[stepId];
  if(!cm)return;
  const tut=tutorials.find(t=>t.steps.some(s=>s.id===stepId));
  const cat=tut?.category||'';
  // CDN scripts go in <head> so they load BEFORE user code in <body>
  let cdnHead='';
  if(cat==='vue3') cdnHead='<scr'+'ipt src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></scr'+'ipt>';
  if(cat==='pinia') cdnHead='<scr'+'ipt src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></scr'+'ipt><scr'+'ipt src="https://cdn.jsdelivr.net/npm/pinia@2/dist/pinia.iife.prod.js"></scr'+'ipt>';
  if(cat==='react2'||cat==='zustand'){
    cdnHead='<scr'+'ipt src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></scr'+'ipt><scr'+'ipt src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></scr'+'ipt>';
    if(cat==='zustand') cdnHead+='<scr'+'ipt type="module">import{createStore}from"https://cdn.jsdelivr.net/npm/zustand@4/vanilla.mjs";window.Zustand={createStore};document.dispatchEvent(new Event("zustand-ready"))</scr'+'ipt>';
  }
  const baseCSS='body{margin:0;font-family:sans-serif}';
  const h=cm.html||'';
  const c=cm.css||'';
  const j=cm.js||'';
  const html='<!DOCTYPE html><html><head><meta charset="UTF-8">'+cdnHead+'<st'+'yle>'+baseCSS+c+'</st'+'yle></head><body>'+h+'<scr'+'ipt>'+j+'</scr'+'ipt></body></html>';
  // Use the html (with CDN in <head>) — NOT cm.combined which lacks CDN/HTML wrapper
  const combined=html;
  if(iframe.classList.contains('cif-ov')){
    iframe.addEventListener('load',()=>{const body=iframe.contentDocument?.body;if(body){iframe.style.height=body.scrollHeight+'px';iframe.style.minHeight='auto'}},{once:true});
  }
  iframe.srcdoc=combined;
}
function isFullscreenStep():boolean{if(!cur.value)return false;const cid=cur.value.id;if(cid==='c25'||cid==='c23'||cid==='j33'||cid==='h20')return true;const s=cur.value.steps.find(s=>s.code);return!!(s&&s.title.includes('🎮'))}
function renderCodes(){nextTick(()=>{const t=cur.value;if(t){initStepCodes(t.id);const isN=isNode.value;t.steps.forEach(s=>{if(hasCode(s)&&!isN)setTimeout(()=>runCode(s.id),100)});window.scrollTo({top:0,behavior:'smooth'})}})}
watch(curTab,()=>{diffFilter.value='all';if(filteredList.value.length>0){ch.value=filteredList.value[0].id;renderCodes()}else ch.value=''})
watch(()=>route.query.tab,(tab)=>{if(tab&&allTabs.some(t=>t.v===tab)){curTab.value=tab as string}},{immediate:false})
const onTutNav=(e:Event)=>{const id=(e as CustomEvent).detail;if(!id)return;const tgt=tutorials.find(t=>t.id===id);if(tgt){curTab.value=tgt.category;nextTick(()=>{ch.value=id;renderCodes()})}}
onMounted(()=>{if(filteredList.value.length>0){ch.value=filteredList.value[0].id;renderCodes()}});document.addEventListener('tutNav',onTutNav)
onUnmounted(()=>{document.removeEventListener('tutNav',onTutNav)})
// 相关概念映射 — 连接跨分类知识点
const conceptMap: Record<string, {icon:string;title:string;category:string;courseId:string}[]> = {
  // ── 互联网 ──
  'net1-1': [{icon:'📡',title:'HTTP协议详解',category:'internet',courseId:'net2'}],
  'net2-1': [{icon:'🔒',title:'HTTPS加密原理',category:'internet',courseId:'net2'},{icon:'🔍',title:'URL解析全流程',category:'internet',courseId:'net1'}],
  'net2-2': [{icon:'📊',title:'SQL基础',category:'db',courseId:'db1'},{icon:'📡',title:'HTTP协议详解',category:'internet',courseId:'net2'}],
  // ── 数据库 ──
  'db1-1': [{icon:'🍃',title:'MongoDB文档数据库',category:'db',courseId:'db2'},{icon:'⚡',title:'Redis内存缓存',category:'db',courseId:'db3'}],
  'db2-1': [{icon:'📊',title:'SQL基础',category:'db',courseId:'db1'},{icon:'🔌',title:'REST API服务',category:'project',courseId:'prj3'}],
  'db3-1': [{icon:'🗄',title:'数据库选型',category:'db',courseId:'db0'},{icon:'📊',title:'SQL基础',category:'db',courseId:'db1'}],
  // ── Canvas/SVG ──
  'cv1-1': [{icon:'📐',title:'SVG矢量图形',category:'canvas',courseId:'cv3'},{icon:'🎬',title:'Canvas动画循环',category:'canvas',courseId:'cv2'}],
  'cv2-1': [{icon:'🎨',title:'Canvas 2D基础',category:'canvas',courseId:'cv1'},{icon:'⚡',title:'JavaScript基础',category:'js',courseId:'j1'}],
  // ── 构建工具 ──
  'bld1-1': [{icon:'📦',title:'Webpack核心概念',category:'build',courseId:'bld2'},{icon:'🚀',title:'esbuild极速打包',category:'build',courseId:'bld3'}],
  'bld2-1': [{icon:'⚡',title:'Vite构建工具',category:'build',courseId:'bld1'}],
  // ── 项目实战 ──
  'prj1-1': [{icon:'📄',title:'HTML基础',category:'html',courseId:'h1'},{icon:'🎨',title:'CSS入门',category:'css',courseId:'c1'}],
  'prj2-1': [{icon:'💚',title:'Vue 3框架',category:'vue3',courseId:'v1'},{icon:'🧩',title:'Pinia状态管理',category:'pinia',courseId:'p1'}],
  'prj3-1': [{icon:'🟢',title:'Node.js基础',category:'node',courseId:'n1'},{icon:'📊',title:'SQL基础',category:'db',courseId:'db1'}],
  // ── Fullstack ──
  'fs1-1': [{icon:'🟢',title:'Node.js基础',category:'node',courseId:'n1'},{icon:'🌐',title:'互联网基础',category:'internet',courseId:'net1'}],
  'fs2-2': [{icon:'📊',title:'SQL基础',category:'db',courseId:'db1'},{icon:'🔌',title:'REST API项目',category:'project',courseId:'prj3'}],
  // ── HTML 核心概念关联 ──
  'h1-1': [{icon:'🎨',title:'CSS入门',category:'css',courseId:'c1'}],
  'h1-2': [{icon:'🎨',title:'CSS基础语法',category:'css',courseId:'c1'}],
  'h3-3': [{icon:'🎨',title:'CSS Display',category:'css',courseId:'c10'},{icon:'📐',title:'CSS盒模型',category:'css',courseId:'c5'}],
  'h4-1': [{icon:'🎨',title:'CSS选择器',category:'css',courseId:'c2'}],
  'h10-1': [{icon:'🎨',title:'CSS伪类:hover',category:'css',courseId:'c3'},{icon:'🌐',title:'URL解析流程',category:'internet',courseId:'net1'}],
  'h11-1': [{icon:'🎨',title:'CSS背景',category:'css',courseId:'c6'},{icon:'🎨',title:'CSS滤镜',category:'css',courseId:'c21'}],
  'h15-1': [{icon:'⚡',title:'JS表单操作',category:'js',courseId:'j29'}],
  'h17-1': [{icon:'🌐',title:'互联网基础',category:'internet',courseId:'net1'}],
  'h19-2': [{icon:'🎨',title:'CSS Grid布局',category:'css',courseId:'c14'},{icon:'🎨',title:'CSS响应式',category:'css',courseId:'c19'}],
  'h22-1': [{icon:'🎯',title:'Canvas 2D基础',category:'canvas',courseId:'cv1'}],
  // ── CSS 核心概念关联 ──
  'c1-1': [{icon:'📄',title:'HTML基础',category:'html',courseId:'h1'}],
  'c3-1': [{icon:'⚡',title:'JS事件处理',category:'js',courseId:'j28'}],
  'c5-3': [{icon:'📄',title:'HTML块级vs行内',category:'html',courseId:'h3'}],
  'c6-3': [{icon:'🎨',title:'CSS毛玻璃效果',category:'css',courseId:'c21'}],
  'c10-1': [{icon:'📄',title:'HTML块级vs行内',category:'html',courseId:'h3'}],
  'c11-2': [{icon:'🎨',title:'CSS z-index',category:'css',courseId:'c11'}],
  'c12-1': [{icon:'🎨',title:'CSS Grid布局',category:'css',courseId:'c14'}],
  'c14-1': [{icon:'🎨',title:'CSS Flexbox',category:'css',courseId:'c12'}],
  'c16-1': [{icon:'🎨',title:'CSS动画@keyframes',category:'css',courseId:'c18'},{icon:'🎨',title:'CSS Transform',category:'css',courseId:'c17'}],
  'c18-1': [{icon:'🎨',title:'CSS过渡',category:'css',courseId:'c16'},{icon:'⚡',title:'JS RAF动画',category:'js',courseId:'j24'}],
  'c20-1': [{icon:'🎨',title:'CSS暗色主题',category:'css',courseId:'c20'},{icon:'⚡',title:'JS主题切换',category:'js',courseId:'j30'}],
  'c22-1': [{icon:'🎨',title:'CSS选择器',category:'css',courseId:'c2'}],
  'c23-1': [{icon:'🎨',title:'CSS响应式',category:'css',courseId:'c19'}],
  'c30-1': [{icon:'🎯',title:'Canvas路径绘制',category:'canvas',courseId:'cv1'}],
  // ── JS 核心概念关联 ──
  'j1-1': [{icon:'📄',title:'HTML基础',category:'html',courseId:'h1'},{icon:'🎨',title:'CSS基础',category:'css',courseId:'c1'}],
  'j2-1': [{icon:'🔷',title:'TypeScript类型系统',category:'ts',courseId:'t2'}],
  'j3-1': [{icon:'🔷',title:'TypeScript基础类型',category:'ts',courseId:'t2'}],
  'j5-1': [{icon:'🔷',title:'TS类型收窄',category:'ts',courseId:'t5'}],
  'j7-1': [{icon:'🔷',title:'TS函数类型',category:'ts',courseId:'t4'}],
  'j8-1': [{icon:'💚',title:'Vue Methods',category:'vue3',courseId:'v4'},{icon:'⚛️',title:'React Hooks',category:'react2',courseId:'r3'}],
  'j9-1': [{icon:'🔷',title:'TS作用域',category:'ts',courseId:'t2'}],
  'j14-1': [{icon:'💚',title:'Vue v-for',category:'vue3',courseId:'v3'},{icon:'⚛️',title:'React列表渲染',category:'react2',courseId:'r4'}],
  'j16-1': [{icon:'🔷',title:'TS Interface',category:'ts',courseId:'t3'},{icon:'💚',title:'Vue Reactive',category:'vue3',courseId:'v4'}],
  'j21-1': [{icon:'🔷',title:'TS Class',category:'ts',courseId:'t8'},{icon:'⚛️',title:'React组件',category:'react2',courseId:'r2'}],
  'j22-1': [{icon:'🔌',title:'REST API项目',category:'project',courseId:'prj3'},{icon:'🟢',title:'Node.js基础',category:'node',courseId:'n1'}],
  'j23-1': [{icon:'🟢',title:'Node.js错误处理',category:'node',courseId:'n1'}],
  'j25-1': [{icon:'🟢',title:'Node.js异步',category:'node',courseId:'n1'},{icon:'⚛️',title:'React useEffect',category:'react2',courseId:'r5'}],
  'j26-1': [{icon:'🔌',title:'REST API项目',category:'project',courseId:'prj3'},{icon:'🌐',title:'HTTP协议',category:'internet',courseId:'net2'}],
  'j27-1': [{icon:'💚',title:'Vue模板语法',category:'vue3',courseId:'v1'},{icon:'⚛️',title:'React JSX',category:'react2',courseId:'r1'}],
  'j28-1': [{icon:'💚',title:'Vue v-on',category:'vue3',courseId:'v2'},{icon:'⚛️',title:'React事件',category:'react2',courseId:'r3'}],
  'j30-2': [{icon:'💚',title:'Pinia持久化',category:'pinia',courseId:'p1'}],
  'j31-1': [{icon:'🎨',title:'CSS属性选择器',category:'css',courseId:'c2'}],
  'j32-1': [{icon:'🟢',title:'Node.js模块',category:'node',courseId:'n1'},{icon:'⚡',title:'Vite构建',category:'build',courseId:'bld1'}],
  // ── Vue 核心概念关联 ──
  'v1-1': [{icon:'⚡',title:'JS DOM操作',category:'js',courseId:'j27'}],
  'v2-1': [{icon:'⚡',title:'JS事件处理',category:'js',courseId:'j28'}],
  'v3-1': [{icon:'⚡',title:'JS条件语句',category:'js',courseId:'j5'}],
  'v4-1': [{icon:'⚡',title:'JS变量',category:'js',courseId:'j2'},{icon:'⚛️',title:'React useState',category:'react2',courseId:'r3'}],
  'v5-1': [{icon:'⚛️',title:'React useMemo',category:'react2',courseId:'r5'}],
  'v7-1': [{icon:'⚛️',title:'React Props',category:'react2',courseId:'r2'}],
  'v11-1': [{icon:'⚛️',title:'React Router',category:'react2',courseId:'r2'}],
  'v11-2': [{icon:'⚛️',title:'React Context',category:'react2',courseId:'r7'},{icon:'🧩',title:'Zustand',category:'zustand',courseId:'z1'}],
  // ── React 核心概念关联 ──
  'r1-1': [{icon:'💚',title:'Vue组件',category:'vue3',courseId:'v1'},{icon:'📄',title:'HTML基础',category:'html',courseId:'h1'}],
  'r2-1': [{icon:'💚',title:'Vue组件',category:'vue3',courseId:'v1'}],
  'r3-1': [{icon:'💚',title:'Vue ref',category:'vue3',courseId:'v4'},{icon:'⚡',title:'JS闭包',category:'js',courseId:'j8'}],
  'r5-1': [{icon:'💚',title:'Vue watchEffect',category:'vue3',courseId:'v5'}],
  'r7-1': [{icon:'💚',title:'Vue provide/inject',category:'vue3',courseId:'v9'},{icon:'🧩',title:'Pinia',category:'pinia',courseId:'p1'}],
  // ── TS 核心概念关联 ──
  't1-1': [{icon:'⚡',title:'JS数据类型',category:'js',courseId:'j3'}],
  't2-1': [{icon:'⚡',title:'JS变量',category:'js',courseId:'j2'}],
  't3-1': [{icon:'⚡',title:'JS对象',category:'js',courseId:'j16'},{icon:'💚',title:'Vue Props',category:'vue3',courseId:'v7'}],
  't6-1': [{icon:'💚',title:'Vue Composables',category:'vue3',courseId:'v10'},{icon:'⚛️',title:'React自定义Hook',category:'react2',courseId:'r5'}],
  't10-1': [{icon:'💚',title:'Vue3+TS',category:'vue3',courseId:'v1'},{icon:'⚛️',title:'React+TS',category:'react2',courseId:'r1'}],
}
function relatedConcepts(stepId: string) { return conceptMap[stepId] || [] }
function navigateToConcept(rc: {category:string;courseId:string}) {
  curTab.value = rc.category
  nextTick(() => { ch.value = rc.courseId; renderCodes(); window.scrollTo({top:0,behavior:'smooth'}) })
}

// 挑战练习 — 完成后显示的练习提示（仅概念步骤，🎯实战步骤跳过）
const challengeMap: Record<string, string> = {
  // ── 互联网 ──
  'net1-1': '打开浏览器开发者工具（F12）→ Network 标签，刷新任意页面，观察每个请求的耗时。哪个阶段最慢？',
  'net2-1': '用浏览器访问 https://httpstat.us/404 和 https://httpstat.us/500，观察不同的 HTTP 状态码响应。',
  // ── 数据库 ──
  'db1-1': '用 SQL 写出：查询年龄大于 20 岁的用户，按注册时间倒序排列，取前 10 条。',
  'db2-1': 'MongoDB 和 MySQL 的最大区别是什么？什么场景用 MongoDB 比 MySQL 更合适？写出你的分析。',
  'db3-1': '用 Redis Sorted Set 设计一个「文章阅读排行榜」，记录每篇文章的阅读次数并按排名展示。',
  // ── Canvas/SVG ──
  'cv1-1': '修改代码，在 Canvas 上画一个笑脸（圆形脸 + 两个眼睛 + 弧线嘴巴）。',
  'cv2-1': '修改弹球代码：添加 3 个不同颜色的球，让它们互相碰撞反弹。',
  // ── 构建工具 ──
  'bld1-1': '用 Vite 创建一个新项目，添加一个简单的 Vue 组件，体验 Vite 的 HMR 热更新速度。',
  // ── 项目实战 ──
  'prj1-1': '在你的博客页面添加一个「联系我」表单（姓名 + 邮箱 + 留言 + 提交按钮），用 CSS 美化。',
  'prj2-1': '给待办应用添加「截止日期」功能，到期未完成的任务用红色标注。',
  'prj3-1': '在 REST API 中添加 GET /api/books/search?q=JavaScript 搜索端点，支持按书名模糊搜索。',

  // ── HTML 关键概念挑战 ──
  'h1-1': '用你自己的话解释：如果把网页比作一个人，HTML、CSS、JavaScript 分别是什么？',
  'h1-2': '创建你的第一个 .html 文件，在里面写 "Hello, 我的名字是___"，然后用浏览器打开它。',
  'h2-1': '查看任意网页的源代码（右键→查看页面源代码），找到 <!DOCTYPE html> 和 <html> 标签的位置。',
  'h2-3': '为你的网页添加 charset、viewport 和 description 三个 meta 标签，并解释每个的作用。',
  'h3-1': '写出 5 个块级元素和 5 个行内元素的名称，然后用代码验证它们的行为差异。',
  'h3-3': '写一个 demo：把 span 变成块级、把 div 变成行内、把 p 变成行内块。观察每种情况的差异。',
  'h4-1': '给一个 <a> 标签同时添加 href、target、title、class 四个属性，解释每个属性的作用。',
  'h4-3': '找出 3 个你之前不知道的 HTML 全局属性，写出它们的用途和示例代码。',
  'h5-2': '为一个「公司官网」设计标题层级结构（从 h1 到 h4），用代码写出框架。',
  'h6-1': '写一段包含 <p>、<br>、<hr>、<pre> 四种标签的 HTML，内容是一篇简短的技术文章。',
  'h7-1': '写一句包含 <strong>、<em>、<mark>、<del> 四种标签的话，让屏幕阅读器能正确读出语义。',
  'h8-1': '用 <blockquote> 引用一句名言，加上 cite 属性标注来源，用 CSS 美化引用样式。',
  'h8-2': '写一段包含 <code>、<kbd>、<samp>、<var> 四个标签的技术文档片段。',
  'h9-2': '在 HTML 中写出以下符号：版权符、商标符、小于号、大于号、and符、双引号、单引号、欧元符、左箭头、右箭头。不使用复制粘贴！',
  'h10-1': '创建 3 个链接：一个跳转到外部网站（新标签）、一个跳转到页面内锚点、一个发送邮件。',
  'h10-3': '给链接添加 download 属性，让点击链接时直接下载文件而不是打开。写出完整代码。',
  'h11-1': '在你的网页中插入一张图片，分别测试不带 alt、带空 alt、带描述性 alt 三种情况。',
  'h12-1': '用 <ul> 写一个导航菜单，用 <ol> 写一个操作步骤，用 <dl> 写一个术语解释列表。',
  'h13-1': '创建一个 3 行 × 4 列的表格，表头用 <th>，数据用 <td>，用 CSS 添加边框和斑马纹。',
  'h14-1': '用 div 和 span 分别包裹一段文字，给它们不同的 class，用 CSS 验证它们的默认行为差异。',
  'h14-3': '把你的一个组件的 class 命名从随意命名改为 BEM 命名规范。对比前后的可读性差异。',
  'h15-1': '创建一个包含 text、email、password、number、date 五种 input 的表单，添加提交按钮。',
  'h16-2': '创建一个调查表单，包含：文本输入、单选、多选、下拉框、文本域、提交按钮。',
  'h17-1': '用 iframe 嵌入一个 YouTube 视频和一张 Google 地图，添加 sandbox 属性提高安全性。',
  'h18-1': '用 <video> 标签嵌入一段视频，添加 controls、autoplay、muted、loop、poster 属性。',
  'h19-2': '用 header+nav+main+aside+footer 搭建一个完整的博客页面布局骨架。',
  'h19-4': '找出 5 个全局属性（如 title、tabindex、hidden、contenteditable、dir），每个写一个使用示例。',
  'h21-1': '用 <details>+<summary> 做一个 FAQ 折叠面板，包含至少 3 个问答。不使用任何 JS。',
  'h22-3': '用 <map>+<area> 做一张中国地图的图片热区，点击不同省份显示不同提示。',

  // ── CSS 关键概念挑战 ──
  'c1-1': '用三种方式（内联、内部、外部）给同一个 h1 设置颜色，验证优先级。解释哪个方式最推荐？',
  'c1-3': '用选择器给 3 个 p 标签设置不同的颜色：第一个用标签选择器、第二个用 class、第三个用 id。',
  'c2-1': '创建一个 HTML 结构，然后用 4 种基础选择器（标签、class、id、通配符）分别设置样式。',
  'c2-2': '写出以下关系的 CSS 选择器：后代、子代、相邻兄弟、后续兄弟。每种写一个实际使用场景。',
  'c3-1': '给一个链接设置 4 种状态样式：未访问、hover、active、已访问。每个状态用不同的颜色。',
  'c3-3': '用 :not() 选择器给「除了最后一个以外」的所有列表项添加下边框。',
  'c4-1': '用 HEX、RGB、HSL、颜色名四种方式写出同一个蓝色，对比哪种最直观。',
  'c4-3': '用 HSL 创建一个单色配色方案：选择一个 hue，用不同 saturation 和 lightness 生成 5 个颜色。',
  'c5-1': '创建一个 div，分别设置 content-box 和 border-box 两种 box-sizing。width 设为 200px，padding 设为 20px。两种模式下的实际宽度分别是多少？',
  'c5-2': '在你的 CSS 文件顶部添加 *,*::before,*::after{box-sizing:border-box}。解释为什么要这样做。',
  'c6-1': '给一个 div 设置：背景颜色、背景图片、背景重复、背景位置、背景大小。用简写和分开写两种方式。',
  'c6-3': '创建一个从左到右、从蓝到紫的线性渐变背景。再创建一个从中心扩散的径向渐变。',
  'c7-3': '用 border-radius 创建：一个圆角矩形(8px)、一个正圆(50%)、一个胶囊形(999px)。',
  'c8-1': '分别用 text-align:left/center/right/justify 显示同一段文字，观察差异。思考什么时候用 justify？',
  'c8-3': '同一段文字，分别设置 line-height 为 1.2、1.5、2.0。观察可读性的变化。总结最佳行高是多少？',
  'c9-1': '为你的网页设置一个字体系列：系统字体 → PingFang SC → Microsoft YaHei → sans-serif。解释这个字体栈的回退逻辑。',
  'c9-2': '比较 px、em、rem、% 四种单位的区别。用代码演示一个父元素和子元素的字号级联效果。',
  'c10-1': '创建 3 个 div，分别设置为 block、inline、inline-block。观察它们在宽度、高度、margin 上有什么不同？',
  'c11-2': '创建父元素 relative + 子元素 absolute 的经典组合。把子元素定位到父元素的右下角。',
  'c11-3': '做一个 sticky 导航栏：滚动超过 100px 后固定在顶部，带毛玻璃模糊背景效果。',
  'c11-4': '创建 3 个重叠的彩色方块，用 z-index 控制层叠顺序。观察父元素的层叠上下文如何影响子元素的 z-index。',
  'c12-2': '用 Flexbox 实现：4 个方块在容器中水平居中、两端对齐、等间距分布。每种用一行 CSS 完成。',
  'c12-3': '用 Flexbox 实现一个元素在容器中「水平+垂直」完美居中。这是面试最高频的 CSS 问题！',
  'c13-1': '创建 3 个不等宽的 Flex 子元素，让它们填满整行。分别测试 flex:1/flex:2/flex:1 和 flex:auto 的差异。',
  'c14-2': '用 Grid 的 auto-fill+minmax 创建响应式卡片网格：最小 250px，自动填充，不需要任何 @media 查询！',
  'c15-2': '用 grid-template-areas 画出一个经典页面布局：「头部 头部 头部 / 侧栏 内容 内容 / 底部 底部 底部」。',
  'c16-2': '分别用 ease、ease-in、ease-out、cubic-bezier(.34,1.56,.64,1) 实现按钮 hover 效果。感受每种缓动的视觉差异。',
  'c17-1': '用 translate 实现一个元素在 hover 时平滑向上移动 8px。为什么用 translate 而不用 top？',
  'c18-1': '用 @keyframes 做一个「呼吸灯」动画：元素从 opacity:1 → 0.4 → 1 循环，2 秒一个周期，无限循环。',
  'c19-1': '写出 3 个 @media 断点：手机(≤640px)、平板(≤1024px)、桌面(>1024px)。每个断点改变背景颜色。',
  'c20-1': '在 :root 中定义 3 个 CSS 变量（主色、辅色、强调色），然后在 5 个不同地方使用它们。修改一次变量值，所有地方自动更新。',
  'c21-1': '用 filter 给一张图片添加：灰度、模糊、亮度降低三种效果。hover 时恢复原图。',
  'c22-1': '计算以下选择器的特异性（用 0,0,0,0 格式）：#header .nav a、.nav a:hover、a、ul > li:first-child。',
  'c23-1': '用 clamp() 设置一个标题字号：最小值 1.5rem、首选 4vw、最大值 3rem。调整浏览器宽度观察流体变化。',
  'c24-2': '用 ::before 和 ::after 给一个按钮添加前后装饰元素。不使用额外的 HTML 标签。',
  'c29-1': '用 scroll-snap 做一页全屏滚动的产品展示页：3 个 section，每次滚动精准吸附到下一个全屏。',
  'c30-1': '用 clip-path 创建一个六边形图片和一个人字形遮罩。比较 circle()、polygon()、inset() 三种裁剪函数。',

  // ── JS 关键概念挑战 ──
  'j1-1': '用你自己的话解释：JavaScript 在浏览器中扮演什么角色？举 3 个实际网页中 JS 发挥作用的例子。',
  'j1-2': '写出 JS 的 5 条基本语法规则（如：区分大小写、分号结尾...），每条配一个示例。',
  'j2-1': '分别用 let、const、var 声明 3 个变量，给它们赋不同类型的值。尝试修改 const 变量，观察报错。',
  'j2-3': '用 const 声明一个对象，然后修改对象内部的属性。为什么 const 对象可以修改属性？',
  'j3-1': '写出 JS 的 8 种数据类型（7 种原始类型 + Object），每种举一个例子。',
  'j4-1': '写一个计算器：接收两个数字和一个运算符（+、-、*、/、%），输出计算结果。处理除数为 0 的情况。',
  'j5-1': '分别用 == 和 === 比较以下值：0 和 false、"" 和 0、null 和 undefined、[] 和 false。记录结果并解释为什么。',
  'j5-4': '列出 JS 中所有的 falsy 值（共 6 个主要的值）。写代码验证每个值在 if 语句中的行为。',
  'j6-2': '用 for 循环输出 1 到 100。遇到 3 的倍数输出 "Fizz"、5 的倍数输出 "Buzz"、同时是 3 和 5 的倍数输出 "FizzBuzz"。这是著名的面试题！',
  'j7-1': '写一个函数，接收一个名字参数，返回 "你好，XXX！欢迎来到编程世界"。分别用声明式、表达式、箭头函数三种方式实现。',
  'j7-3': '写一个 sum 函数，可以接收任意数量的参数，返回它们的总和。用剩余参数语法实现。',
  'j8-1': '写代码演示 this 在以下 4 种情况下的值：全局作用域、对象方法、事件处理函数、箭头函数。',
  'j8-2': '写一个「计数器」闭包：外部函数返回内部函数，内部函数每次调用让计数 +1 并返回当前值。',
  'j9-1': '写代码演示 var 和 let 在块级作用域中的行为差异（用 for 循环 + setTimeout 经典面试题）。',
  'j10-1': '创建一个多行字符串：包含用户的名字、年龄、爱好，使用模板字面量（反引号）和 ${} 插值。',
  'j11-2': '写一个函数：接收一个 URL 字符串，提取出域名部分（如 https://www.example.com/path → www.example.com）。',
  'j12-1': '演示 JS 中的浮点数精度问题：计算 0.1 + 0.2 的结果。解释为什么，以及如何正确处理。',
  'j13-2': '写一个随机抽奖程序：给定一个名字数组，随机选出一个中奖者。确保每次结果都不一样。',
  'j14-1': '创建一个数组，用 push/pop/shift/unshift/splice 五种方法操作它，每一步打印数组的变化。',
  'j15-1': '对一个数字数组，依次用 map(fn)、filter(fn)、reduce(fn) 进行链式操作。实现：筛选偶数 → 翻倍 → 求和。',
  'j16-1': '创建一个「用户」对象，包含 5 个属性（姓名、年龄、邮箱、爱好数组、地址对象）。练习增删改查操作。',
  'j17-2': '创建一个嵌套对象，分别用浅拷贝（展开运算符）和深拷贝（structuredClone）复制它。修改原对象的嵌套属性，观察两种拷贝的差异。',
  'j18-2': '写一个「距离春节还有多久」的倒计时：用当前时间和目标时间之间的时间戳差计算天、时、分、秒。',
  'j19-1': '用 Set 给一个包含重复元素的数组去重。用 Map 存储学生的成绩，实现按名字查询分数的功能。',
  'j20-1': '从一个 API 响应对象中解构提取 5 个字段，给其中 2 个设置默认值，给 1 个重命名。',
  'j21-1': '用 class 创建一个「图书」类：包含书名、作者、价格属性，以及一个打折方法。用 new 创建 3 本不同的书。',
  'j22-1': '把一个 JS 对象用 JSON.stringify 转成字符串，再用 JSON.parse 转回来。测试函数、undefined、Date 在 JSON 中的行为。',
  'j23-1': '写一个安全的除法函数：用 try/catch 处理除数为 0、参数不是数字、结果不是有限数三种错误情况。',
  'j24-1': '用 setTimeout 实现：页面上显示「3、2、1、发射！」，每个数字间隔 1 秒。解释为什么不用 setInterval？',
  'j25-1': '创建一个 Promise：模拟网络请求，1.5 秒后随机成功（80%）或失败（20%）。用 .then/.catch 处理两种结果。',
  'j26-1': '用 async/await 重写上面的 Promise 练习。对比两种写法的可读性差异。',
  'j27-1': '用纯 JS（不用框架）创建一个页面：包含标题、段落、按钮。点击按钮，动态添加一个新的列表项。',
  'j28-1': '写一个事件委托：给 ul 绑定一个 click 事件，无论列表有多少 li（包括后来动态添加的），点击每个 li 都能弹出其文本内容。',
  'j29-1': '创建一个登录表单：包含用户名和密码输入框。点击提交时用 JS 读取值，验证非空，显示结果。',
  'j30-2': '用 localStorage 实现：用户选择一个主题色 → 保存到本地 → 下次访问自动应用。提供「清除设置」按钮。',
  'j31-1': '用正则表达式验证：手机号（1 开头的 11 位数字）、邮箱（xxx@xxx.xxx）、URL（http/https 开头）。',
  'j32-1': '把一个 JS 文件拆成 3 个模块（utils.js、data.js、main.js），用 export/import 关联。对比拆分前后的代码组织。',
  'j34-1': '用 fetch 从 https://jsonplaceholder.typicode.com/posts 获取数据，显示前 5 篇文章的标题到页面上。',

  // ── Vue 关键概念挑战 ──
  'v1-1': '用 Vue 的 {{ }} 插值显示：当前时间（每秒更新）、一个计算属性（名字反转）、一个方法返回值。用你自己的话解释「响应式」是什么意思。',
  'v2-1': '用 v-bind 动态绑定一个元素的 class 和 style。点击按钮时切换 class。对比原生 JS 的做法，感受 Vue 的简洁。',
  'v3-1': '做一个可筛选的列表：用 v-if/v-else-if/v-else 切换显示「全部/进行中/已完成」三组数据。',
  'v4-1': '用 ref 实现一个计数器：点击 +1、-1、重置。用 reactive 实现一个用户表单：姓名+年龄+邮箱，实时显示输入内容。',
  'v5-1': '做一个购物车：商品列表 + 单价 + 数量。用 computed 计算总价，当数量变化时自动更新。对比用普通方法的区别。',
  'v7-1': '创建父子组件：父组件传 props（名字、年龄、头像URL）给子组件「用户卡片」。子组件用 defineProps 接收并展示。',
  'v8-1': '写一个组件，在 onMounted 中发起 API 请求，在 onUnmounted 中清理定时器。用生命周期的四个阶段解释代码执行顺序。',
  'v10-1': '把计数器逻辑抽成一个 useCounter composable。在两个不同组件中使用它，验证状态是否共享/独立。',
  'v11-1': '用 Vue Router 创建 3 个页面（首页/关于/联系），配置导航链接和路由视图。添加路由过渡动画。',
  'v11-2': '用 Pinia 创建一个全局用户 store（登录状态 + 用户名 + 头像）。在导航栏和用户页面中同时使用，测试状态共享。',

  // ── React 关键概念挑战 ──
  'r1-1': '分别用 React.createElement 和 JSX 写同一个卡片组件（包含标题+描述+按钮）。感受 JSX 的简洁。',
  'r2-1': '创建父子组件：父组件传 name/age/role 三个 props 给子组件。子组件用默认值和类型检查（PropTypes）。',
  'r3-1': '用 useState 做一个计数器：包含 +1、-1、重置三个按钮。点击超过 10 次显示「太厉害了！」提示。',
  'r4-2': '用 map() 渲染一个用户列表。每个用户有唯一的 key（用 id 而不是 index）。添加「删除」按钮，点击从列表中移除。',
  'r5-1': '写一个组件：用 useEffect 在组件挂载时 fetch 数据，在依赖变化时重新 fetch，在卸载时 cleanup。解释依赖数组的作用。',
  'r7-1': '用 Context 实现全局主题切换：Provider 提供 theme + toggleTheme，深层嵌套的子组件也能读取和切换主题。',

  // ── TS 关键概念挑战 ──
  't1-1': '把一段 JS 代码（包含一个函数和几个变量）复制到 .ts 文件中，观察 TS 编译器给出的类型提示和错误。',
  't2-1': '声明一个变量，分别尝试用 string、number、boolean、string[]、[string,number] 五种类型注解。故意赋错类型，看编译器报什么错。',
  't3-1': '定义一个 User 接口（id/number、name/string、email/string、age?/number），用它来约束一个函数参数。测试传入缺少字段和多余字段时的类型错误。',
  't4-1': '写一个函数，参数有明确类型注解，返回值也有类型注解。尝试传入错误的参数类型，观察编译器的保护作用。',
  't6-1': '写一个泛型函数 identity<T>(arg:T):T，分别传入 string、number、object 类型调用。再写一个泛型接口，用于约束 API 响应的 data 字段类型。',
  't9-2': '用 Partial<T>、Pick<T,K>、Omit<T,K>、Record<K,V> 四个工具类型分别处理 User 接口。解释每个工具类型的用途。',
}
function getChallenge(stepId: string): string | null { return challengeMap[stepId] || null }

// ── 章末测验 ──
const quizAnswers = reactive<Record<string,number>>({})
const quizResults = reactive<Record<string,boolean>>({})
function getQuizForChapter(chapterId: string) { return quizData[chapterId] || null }
function isChapterAllDone(chapter: { steps: { id: string }[] }): boolean {
  return chapter.steps.every(s => store.isTutorialDone(s.id))
}
function checkQuizAnswer(chapterId: string, qi: number, oi: number) {
  const key = chapterId + '/' + qi
  const quiz = quizData[chapterId]
  if (!quiz || quizResults[key] !== undefined) return
  quizAnswers[key] = oi
  quizResults[key] = oi === quiz[qi].answer
}

// ── 学习笔记 ──
const NOTES_KEY = 'lwyjr-notes'
const noteOpen = reactive<Record<string,boolean>>({})
const notesMap = reactive<Record<string,string>>((() => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') } catch { return {} } })())
function toggleNotes(stepId: string) { noteOpen[stepId] = !noteOpen[stepId] }
function getNoteText(stepId: string): string { return notesMap[stepId] || '' }
function saveNote(stepId: string, text: string) {
  notesMap[stepId] = text
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notesMap)) } catch {}
  // 如果已登录，延迟同步到服务器
  if (auth.isLoggedIn) {
    debouncedSyncNote(stepId, text)
  }
}
let syncTimers: Record<string, ReturnType<typeof setTimeout>> = {}
function debouncedSyncNote(stepId: string, text: string) {
  if (syncTimers[stepId]) clearTimeout(syncTimers[stepId])
  syncTimers[stepId] = setTimeout(async () => {
    try {
      await fetch('/api/notes/' + stepId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify({ content: text }),
      })
    } catch { /* 静默 */ }
  }, 2000)
}

function openPropModal(propRef:string){const[cat,key]=propRef.split('.');if(cat&&key)propModal.value?.open(cat,key)}
function scrollToStep(idx:number){nextTick(()=>{const steps=document.querySelectorAll('.step');if(steps[idx])steps[idx].scrollIntoView({behavior:'smooth',block:'start'})})}
const copiedBtns = new Set<string>()
function copyNodeCode(stepId:string,e:MouseEvent){const cm=stepCodes[stepId];if(!cm||!cm.js)return;const btn=e.currentTarget as HTMLElement;if(!btn||copiedBtns.has(stepId))return;copiedBtns.add(stepId);const orig=btn.textContent;btn.textContent='Copied!';navigator.clipboard.writeText(cm.js).then(()=>{setTimeout(()=>{btn.textContent=orig;copiedBtns.delete(stepId)},1500)}).catch(()=>{btn.textContent=orig;copiedBtns.delete(stepId)})}
</script>

<style scoped>
.sp{max-width:var(--max-width);margin:0 auto;padding:0 24px calc(100px + env(safe-area-inset-bottom, 0))}
.st{font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:8px;font-weight:900;letter-spacing:-.03em}
.gt{background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ss{text-align:center;color:var(--text-secondary);max-width:560px;margin:0 auto 36px;font-size:1.05rem;font-weight:400}
.tt-wrap{position:relative;margin-bottom:32px;z-index:101}
.tt-label{font-size:.68rem;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.06em;padding:4px 2px 2px;margin-top:8px}
.tt-label:first-child{margin-top:0}
.tt{display:flex;gap:2px;justify-content:flex-start;flex-wrap:wrap;background:var(--bg-glass);padding:4px;border-radius:var(--radius-full);backdrop-filter:blur(12px);max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;position:sticky;top:calc(var(--nav-height) + env(safe-area-inset-top, 0));border:1px solid var(--border);scroll-snap-type:x proximity;}
.tt::-webkit-scrollbar{display:none}
.tt::before,.tt::after{content:'';position:sticky;top:0;bottom:0;min-width:24px;flex-shrink:0;z-index:1;pointer-events:none}
.tt::before{left:0;background:linear-gradient(to right,var(--bg-glass),transparent)}
.tt-adv{position:absolute;top:100%;left:0;right:0;margin-top:4px;border-top:1px solid var(--border);padding-top:8px;border-radius:var(--radius-full);z-index:200;box-shadow:var(--shadow-lg)}
.adv-toggle{color:var(--text-tertiary);font-size:.78rem}
.adv-toggle:hover{color:var(--primary)}
.tb{padding:9px 16px;background:transparent;border:none;color:var(--text-secondary);font-size:.82rem;font-weight:500;cursor:pointer;transition:all .3s var(--spring-bouncy);white-space:nowrap;min-height:44px;min-width:44px;display:inline-flex;align-items:center;gap:4px;scroll-snap-align:start}
.tb:hover{color:var(--text)}
.tb.on{background:var(--bg-card);color:var(--primary);box-shadow:var(--shadow-sm);font-weight:600;transform:scale(1.02);border-radius: var(--radius-full);}
.tc{font-size:.7rem;padding:2px 7px;border-radius:var(--radius-full);font-weight:600}
.tb.on .tc{background:rgba(0,113,227,.1);color:var(--primary)}
.tl{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
@media(max-width:900px){
  .tl{grid-template-columns:1fr}
  .tt{position:relative;top:auto;z-index:auto;border-radius:var(--radius-full)}
  .ts{
    display:flex;
    position:static;
    top:auto;
    max-height:none;
    overflow-x:auto;
    overflow-y:hidden;
    flex-wrap:nowrap;
    gap:8px;
    padding:12px;
    margin-bottom:20px;
    border-radius:var(--radius-lg);
    scrollbar-width:none;
    z-index: 99999;
  }
  .ts::-webkit-scrollbar{display:none}
  .ts h4{display:none}
  .ci{flex-shrink:0;padding:8px 14px;border:1px solid var(--border);white-space:nowrap}
  .cm{display:none}
  .tt{border-radius: var(--radius)}
}
.ts{position:sticky;top:calc(var(--main-header-top) + 24px);background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;max-height:68vh;overflow-y:auto;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:var(--shadow-sm)}
.ts h4{margin-bottom:14px;font-size:.9rem;font-weight:700;color:var(--text);letter-spacing:-.01em}
.ci{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius);cursor:pointer;transition:all .25s var(--spring-bouncy);margin-bottom:2px;position:relative}
.ci:hover{background:rgba(0,113,227,.06);transform:translateX(4px)}
.ci.on{background:rgba(0,113,227,.1);font-weight:600;transform:translateX(3px)}
.ci.on::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:3px;background:var(--primary);border-radius:2px;animation:barIn .3s ease}
@keyframes barIn{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.ct{font-size:.82rem;font-weight:600}.cm{font-size:.7rem;color:var(--text-secondary)}
.ci-prog{font-size:.65rem;color:var(--text-tertiary);margin-left:auto;white-space:nowrap}
.em{text-align:center;padding:24px;color:var(--text-secondary);font-size:.82rem}
.tm{min-height:400px}
.chapter-enter{animation:chapterIn .4s cubic-bezier(.16,1,.3,1) both}
@keyframes chapterIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.th{margin-bottom:24px;background:var(--bg-glass);border-radius:var(--radius-lg);padding:24px;border:1px solid var(--border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.th h3{font-size:1.4rem;font-weight:800;margin-bottom:6px;letter-spacing:-.02em}
.tdd{color:var(--text-secondary);margin-bottom:8px;font-size:.95rem}
.db{display:inline-block;padding:4px 12px;background:rgba(0,113,227,.08);color:var(--primary);border-radius:var(--radius-full);font-size:.8rem;margin-bottom:20px}
.step{background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:20px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:all .35s var(--spring-smooth)}
.step:hover{border-color:var(--primary);box-shadow:0 4px 20px rgba(0,113,227,.06);transform:translateY(-1px)}
.sh{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sn{width:28px;height:28px;background:var(--gradient-brand);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex-shrink:0}
.sh h4{font-size:1rem;margin:0}
.prop-btn{flex-shrink:0;margin-left:auto;padding:3px 10px;background:rgba(0,113,227,.06);color:var(--primary);border:1px solid rgba(0,113,227,.15);border-radius:20px;font-size:.7rem;font-weight:600;cursor:pointer;transition:all .22s var(--spring-bouncy);white-space:nowrap}
.prop-btn:hover{background:rgba(0,113,227,.12);border-color:var(--primary);transform:scale(1.06)}
.sc{color:var(--text-secondary);line-height:1.7;margin-bottom:12px}
.cp{background:var(--code-bg);border-radius:var(--radius);overflow:hidden;margin:12px 0;border:1px solid var(--code-border)}
.cbar{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--code-header-bg);border-bottom:1px solid var(--code-border)}
.cbar .dots{display:flex;gap:6px}
.cbar .dots span{width:10px;height:10px;border-radius:50%}
.cbar .dots span:nth-child(1){background:var(--code-dot-red)}.cbar .dots span:nth-child(2){background:var(--code-dot-yellow)}.cbar .dots span:nth-child(3){background:var(--code-dot-green)}
.crun{padding:4px 14px;background:var(--success);color:#fff;border:none;border-radius:var(--radius-full);font-size:.75rem;font-weight:700;cursor:pointer;transition:all .2s var(--spring-bouncy)}
.crun:hover{transform:scale(1.08);box-shadow:0 0 12px rgba(52,199,89,.35)}
.cbody{display:grid;grid-template-columns:1fr 1fr;min-height:220px}
.cbodyFull{grid-template-columns:1fr}
@media(max-width:768px){.cbody{grid-template-columns:1fr}}
.ced{border-right:1px solid var(--code-border)}
.ctx{width:100%;height:100%;min-height:220px;resize:none}
.cpv{position:relative;background:var(--preview-bg)}
.cpvFull{flex:1;min-height:500px}
.cif{width:100%;height:100%;border:none;min-height:220px}
.cif-ov{height:auto;min-height:clamp(420px,85vh,900px)}
.tip{background:rgba(255,159,10,.08);border-radius:var(--radius);padding:12px 16px;font-size:.9rem;color:var(--text-secondary);margin-top:12px;border-left:3px solid var(--warning)}
.bcom{margin-top:12px;padding:8px 20px;border-radius:var(--radius-full);background:transparent;border:1px solid var(--border);color:var(--text-secondary);font-size:.85rem;cursor:pointer;transition:all .3s var(--spring-bouncy)}
.bcom:hover{border-color:var(--primary);color:var(--primary)}
.bcom.done{background:rgba(52,199,89,.1);border-color:var(--success);color:var(--success)}
.step-nav{display:flex;gap:10px;margin-top:12px;margin-bottom:env(safe-area-inset-bottom,8px)}
.snav-btn{padding:6px 18px;border-radius:var(--radius-full);background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);font-size:.82rem;cursor:pointer;transition:all .25s var(--spring-bouncy)}
.snav-btn:hover{border-color:var(--primary);color:var(--primary)}
.snav-next{margin-left:auto;background:var(--primary);color:#fff;border-color:var(--primary)}
.snav-next:hover{background:var(--primary-dark);transform:translateY(-1px)}
.ph{text-align:center;padding:100px 20px;color:var(--text-secondary);background:var(--bg-glass);border-radius:var(--radius-xl);border:1px solid var(--border);backdrop-filter:blur(20px)}
.ph-icon{font-size:3rem;display:block;margin-bottom:8px}
.ph h3{margin:16px 0 8px;color:var(--text);font-weight:700}
.node-cp{border:1px solid var(--node-border)}
.node-bar{background:rgba(52,199,89,.08);gap:8px}
.nlabel{color:#339933;font-size:.75rem;font-weight:600}
.ncode-pre{color:#e6edf3;padding:12px 14px;margin:0;font-family:'SF Mono','Fira Code',monospace;font-size:.82rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;background:#0d1117}
@media(max-width:640px){.ncode-pre{font-size:.85rem}}
.noutput{background:#0a0a0a;padding:8px 14px;min-height:20px;color:#ccc;font-size:.82rem;line-height:1.7}
.copy-btn{padding:3px 10px;background:rgba(0,113,227,.08);color:var(--primary);border:1px solid rgba(0,113,227,.15);border-radius:20px;font-size:.68rem;font-weight:600;cursor:pointer;transition:all .22s cubic-bezier(.34,1.56,.64,1);white-space:nowrap}
.copy-btn:hover{background:rgba(0,113,227,.15);border-color:var(--primary);transform:scale(1.06)}

/* 难度筛选 */
.diff-filter{display:flex;gap:4px;margin:0 0 10px;padding:4px;background:var(--bg-glass);border-radius:8px}
.df-btn{flex:1;padding:4px 6px;font-size:.68rem;font-weight:600;border:none;border-radius:6px;background:transparent;color:var(--text-tertiary);cursor:pointer;transition:all .2s}
.df-btn.on{background:var(--primary);color:#fff;box-shadow:0 1px 3px rgba(0,113,227,.3)}
.df-btn:hover:not(.on){color:var(--text-secondary);background:rgba(0,113,227,.06)}

/* 相关概念推荐 */
.related-box{padding:12px 16px;margin-top:8px;background:rgba(0,113,227,.04);border-radius:10px;border:1px solid rgba(0,113,227,.08);display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.related-label{font-size:.72rem;color:var(--text-tertiary);font-weight:600}
.related-link{padding:3px 10px;font-size:.72rem;background:var(--bg-glass);border:1px solid var(--border);border-radius:16px;color:var(--primary);cursor:pointer;transition:all .2s;white-space:nowrap}
.related-link:hover{background:rgba(0,113,227,.08);border-color:var(--primary);transform:translateY(-1px)}

/* 学习笔记 */
.notes-box{margin-top:12px}
.notes-toggle{padding:6px 14px;background:rgba(0,113,227,.04);border:1px solid rgba(0,113,227,.08);border-radius:8px;color:var(--primary);font-size:.76rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
.notes-toggle:hover{background:rgba(0,113,227,.1);border-color:var(--primary)}
.notes-indicator{color:var(--danger);font-size:.5rem;animation:pulse 2s infinite}
.notes-editor{margin-top:8px}
.notes-textarea{width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(0,113,227,.15);background:rgba(0,113,227,.04);color:var(--text);font-size:.82rem;line-height:1.7;resize:vertical;font-family:inherit;outline:none;transition:border-color .2s;box-sizing:border-box}
.notes-textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--focus-ring)}
.notes-hint{display:block;margin-top:4px;font-size:.64rem;color:var(--text-tertiary)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* 挑战练习 */
.challenge-box{margin-top:12px;padding:14px 18px;background:linear-gradient(135deg,rgba(255,159,10,.06),rgba(255,55,95,.04));border:1px solid rgba(255,159,10,.15);border-radius:10px}
.challenge-header{font-size:.76rem;font-weight:700;color:var(--warning,#ff9f0a);margin-bottom:6px}
.challenge-text{font-size:.82rem;color:var(--text-secondary);line-height:1.7;margin:0}

/* 章末测验 */
.quiz-box{margin-top:16px;padding:18px 20px;background:var(--bg-glass);border:1px solid var(--border);border-radius:12px}
.quiz-header{font-size:.9rem;font-weight:700;color:var(--text);margin-bottom:14px}
.quiz-item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)}
.quiz-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.quiz-item.correct{background:rgba(52,199,89,.04);margin:-8px -8px 6px;padding:8px 8px 14px;border-radius:8px}
.quiz-item.wrong{background:rgba(255,59,48,.04);margin:-8px -8px 6px;padding:8px 8px 14px;border-radius:8px}
.quiz-q{font-size:.82rem;font-weight:600;color:var(--text);margin:0 0 8px;line-height:1.5}
.quiz-options{display:flex;flex-direction:column;gap:6px}
.quiz-opt{padding:8px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text-secondary);font-size:.8rem;text-align:left;cursor:pointer;transition:all .2s}
.quiz-opt:hover:not(:disabled){border-color:var(--primary);background:rgba(0,113,227,.04)}
.quiz-opt.chosen{border-color:var(--primary);background:rgba(0,113,227,.08);color:var(--primary);font-weight:600}
.quiz-opt.reveal.correct{border-color:var(--success);background:rgba(52,199,89,.1);color:var(--success)}
.quiz-opt.reveal.wrong{border-color:var(--danger);background:rgba(255,59,48,.08);color:var(--danger)}
.quiz-opt:disabled{cursor:default}
.quiz-explain{margin-top:8px;padding:8px 12px;border-radius:8px;font-size:.76rem;line-height:1.6}
.quiz-explain.right{background:rgba(52,199,89,.08);color:var(--success)}
.quiz-explain:not(.right){background:rgba(255,59,48,.06);color:var(--text-secondary)}

@media(max-width:900px){
  .diff-filter{gap:2px;padding:2px}
  .df-btn{font-size:.64rem;padding:3px 4px}
}
</style>
