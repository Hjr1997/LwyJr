<template>
  <div class="sp page-in" style="padding-top:var(--nav-height)">
    <h2 class="st"><span class="gt">🎓 教程中心</span></h2>
    <p class="ss">从零到全栈的系统化学习，每一步都有可运行代码</p>
    <div class="tt">
      <button v-for="t in tabList" :key="t.v" class="tb" :class="{on:curTab===t.v}" @click="curTab=t.v">{{t.i}} {{t.l}} <span class="tc">{{stepCounts[t.v]||0}}</span></button>
    </div>
    <div class="tl">
      <aside class="ts">
        <h4>📚 {{activeLabel}} 课程</h4>
        <div v-for="tu in filteredList" :key="tu.id" class="ci" :class="{on:ch===tu.id}" @click="ch=tu.id;renderCodes()"><div><div class="ct">{{tu.title}}</div><div class="cm">{{tu.steps.length}}节·{{tu.difficulty}}</div></div></div>
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
            <div v-if="hasCode(s) && !isNode && isOverview" class="cp">
              <div class="cbar"><span class="cbar-label">📑 课程大纲预览</span></div>
              <div class="cpv"><iframe :id="'frm-'+s.id" class="cif cif-ov" sandbox="allow-scripts allow-same-origin allow-modals"></iframe></div>
            </div>
            <div v-if="isNode && stepCodes[s.id] && stepCodes[s.id].js.trim()" class="cp node-cp">
              <div class="cbar node-bar"><span class="nlabel">Terminal</span><button class="copy-btn" @click="copyNodeCode(s.id, $event)">Copy</button></div>
              <pre class="ncode-pre">{{ stepCodes[s.id].js }}</pre>
              <div v-if="stepCodes[s.id].html.trim()" class="noutput" v-html="sanitize(stepCodes[s.id].html)"></div>
            </div>
            <div v-else-if="isNode && stepCodes[s.id] && stepCodes[s.id].html.trim()" class="cp node-cp">
              <div class="noutput" style="border-top:none;border-radius:0" v-html="sanitize(stepCodes[s.id].html)"></div>
            </div>
            <div v-if="s.tip" class="tip" v-html="sanitize(s.tip)"></div>
            <button class="bcom" :class="{done:store.isTutorialDone(s.id)}" @click="store.markTutorialComplete(s.id)">{{store.isTutorialDone(s.id)?'Done':'Mark Done'}}</button>
          </div>
        </div>
        <div v-else class="ph"><span style="font-size:3rem">👈</span><h3>Select a course</h3><p>Start from HTML basics</p></div>
      </div>
    </div>
  </div>
  <PropModal ref="propModal" />
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { tutorials } from '@/data/tutorials'
import PropModal from '@/components/PropModal.vue'
import { sanitize } from '@/utils/sanitize'
const CodeEditor = defineAsyncComponent(() => import('@/components/CodeEditor.vue'))

const store = useAppStore()
const route = useRoute()
const curTab = ref((route.query.tab as string) || 'html')
const ch = ref('')
const stepCodes = reactive<Record<string,Record<string,string>>>({})
const propModal = ref<InstanceType<typeof PropModal>|null>(null)

const tabList = [
  {i:'🌐',l:'互联网基础',v:'internet'},{i:'📄',l:'HTML',v:'html'},{i:'🎨',l:'CSS',v:'css'},
  {i:'⚡',l:'JavaScript',v:'js'},{i:'🔷',l:'TypeScript',v:'ts'},{i:'💚',l:'Vue 3',v:'vue3'},
  {i:'🗄',l:'Zustand',v:'zustand'},{i:'🔷',l:'Dva',v:'dva'},{i:'⚛️',l:'React',v:'react2'},
  {i:'🧩',l:'Pinia',v:'pinia'},{i:'⚡',l:'Vite',v:'vite'},{i:'🎯',l:'Canvas/SVG',v:'canvas'},
  {i:'🔧',l:'构建工具',v:'build'},{i:'🚀',l:'项目实战',v:'project'},{i:'🟢',l:'Node.js',v:'node'},
  {i:'🗄',l:'数据库',v:'db'},{i:'🔗',l:'Fullstack',v:'fullstack'},
]
const stepCounts:Record<string,number>={}
tutorials.forEach(t=>{stepCounts[t.category]=(stepCounts[t.category]||0)+t.steps.length})
const filteredList = computed(()=>tutorials.filter(t=>t.category===curTab.value))
const cur = computed(()=>filteredList.value.find(t=>t.id===ch.value)||null)
const activeLabel = computed(()=>tabList.find(t=>t.v===curTab.value)?.l||'')
const isNode = computed(()=>{const c=cur.value?.category;return c==='node'||c==='vite'||c==='dva'||c==='pinia'||c==='zustand'})
const overviewIds = new Set(['h0','c25','j33','t0','r0','v0','i0'])
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
function renderCodes(){nextTick(()=>{const t=cur.value;if(t){initStepCodes(t.id);const isN=t.category==='node';t.steps.forEach(s=>{if(hasCode(s)&&!isN)setTimeout(()=>runCode(s.id),100)});window.scrollTo({top:0,behavior:'smooth'})}})}
watch(curTab,()=>{if(filteredList.value.length>0){ch.value=filteredList.value[0].id;renderCodes()}else ch.value=''})
watch(()=>route.query.tab,(tab)=>{if(tab&&tabList.some(t=>t.v===tab)){curTab.value=tab as string}},{immediate:false})
const onTutNav=(e:Event)=>{const id=(e as CustomEvent).detail;if(!id)return;const tgt=tutorials.find(t=>t.id===id);if(tgt){curTab.value=tgt.category;nextTick(()=>{ch.value=id;renderCodes()})}}
onMounted(()=>{if(filteredList.value.length>0){ch.value=filteredList.value[0].id;renderCodes()}});document.addEventListener('tutNav',onTutNav)
onUnmounted(()=>{document.removeEventListener('tutNav',onTutNav)})
function openPropModal(propRef:string){const[cat,key]=propRef.split('.');if(cat&&key)propModal.value?.open(cat,key)}
const copiedBtns = new Set<string>()
function copyNodeCode(stepId:string,e:MouseEvent){const cm=stepCodes[stepId];if(!cm||!cm.js)return;const btn=e.currentTarget as HTMLElement;if(!btn||copiedBtns.has(stepId))return;copiedBtns.add(stepId);const orig=btn.textContent;btn.textContent='Copied!';navigator.clipboard.writeText(cm.js).then(()=>{setTimeout(()=>{btn.textContent=orig;copiedBtns.delete(stepId)},1500)}).catch(()=>{btn.textContent=orig;copiedBtns.delete(stepId)})}
</script>

<style scoped>
.sp{max-width:var(--max-width);margin:0 auto;padding:0 24px 100px}
.st{font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:8px;font-weight:900;letter-spacing:-.03em}
.gt{background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ss{text-align:center;color:var(--text-secondary);max-width:560px;margin:0 auto 36px;font-size:1.05rem;font-weight:400}
.tt{display:flex;gap:2px;justify-content:center;flex-wrap:wrap;margin-bottom:32px;background:var(--bg-glass);padding:4px;border-radius:var(--radius-full);backdrop-filter:blur(12px);max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tt::-webkit-scrollbar{display:none}
.tb{padding:9px 16px;border-radius:var(--radius-full);background:transparent;border:none;color:var(--text-secondary);font-size:.82rem;font-weight:500;cursor:pointer;transition:all .3s var(--spring-bouncy);white-space:nowrap;min-height:44px;min-width:44px;display:inline-flex;align-items:center;gap:4px}
.tb:hover{color:var(--text)}
.tb.on{background:var(--bg-card);color:var(--primary);box-shadow:var(--shadow-sm);font-weight:600;transform:scale(1.02)}
.tc{font-size:.7rem;padding:2px 7px;border-radius:var(--radius-full);font-weight:600}
.tb.on .tc{background:rgba(0,113,227,.1);color:var(--primary)}
.tl{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
@media(max-width:900px){
  .tl{grid-template-columns:1fr}
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
  }
  .ts::-webkit-scrollbar{display:none}
  .ts h4{display:none}
  .ci{flex-shrink:0;padding:8px 14px;border:1px solid var(--border);white-space:nowrap}
  .cm{display:none}
}
.ts{position:sticky;top:calc(var(--nav-height) + 24px);background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;max-height:68vh;overflow-y:auto;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:var(--shadow-sm)}
.ts h4{margin-bottom:14px;font-size:.9rem;font-weight:700;color:var(--text);letter-spacing:-.01em}
.ci{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius);cursor:pointer;transition:all .25s var(--spring-bouncy);margin-bottom:2px;position:relative}
.ci:hover{background:rgba(0,113,227,.06);transform:translateX(4px)}
.ci.on{background:rgba(0,113,227,.1);font-weight:600;transform:translateX(3px)}
.ci.on::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:3px;background:var(--primary);border-radius:2px;animation:barIn .3s ease}
@keyframes barIn{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.ct{font-size:.82rem;font-weight:600}.cm{font-size:.7rem;color:var(--text-secondary)}
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
@media(max-width:700px){.cbody{grid-template-columns:1fr}}
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
.ph{text-align:center;padding:100px 20px;color:var(--text-secondary);background:var(--bg-glass);border-radius:var(--radius-xl);border:1px solid var(--border);backdrop-filter:blur(20px)}
.ph h3{margin:16px 0 8px;color:var(--text);font-weight:700}
.node-cp{border:1px solid rgba(51,153,51,.3)}
.node-bar{background:rgba(51,153,51,.08);gap:8px}
.nlabel{color:#339933;font-size:.75rem;font-weight:600}
.ncode-pre{color:#e6edf3;padding:12px 14px;margin:0;font-family:'SF Mono','Fira Code',monospace;font-size:.78rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;background:#0d1117}
.noutput{background:#0a0a0a;padding:8px 14px;min-height:20px;color:#ccc;font-size:.82rem;line-height:1.7}
.copy-btn{padding:3px 10px;background:rgba(0,113,227,.08);color:var(--primary);border:1px solid rgba(0,113,227,.15);border-radius:20px;font-size:.68rem;font-weight:600;cursor:pointer;transition:all .22s cubic-bezier(.34,1.56,.64,1);white-space:nowrap}
.copy-btn:hover{background:rgba(0,113,227,.15);border-color:var(--primary);transform:scale(1.06)}
</style>
