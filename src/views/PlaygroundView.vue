<template>
  <div class="page-in" style="padding-top:var(--main-header-top)">
    <h2 class="section-title"><span class="gradient-text">💻 代码演练场</span></h2>
    <p class="section-subtitle">实时编写 HTML/CSS/JS，即时预览效果。修改代码自动刷新。</p>

    <div class="pg" style="max-width:var(--max-width);margin:0 auto;padding:0 24px">
      <div class="pg-editor">
        <div class="pg-bar">
          <span class="pg-dots"><i></i><i></i><i></i></span>
          <span class="pg-title">index.html / style.css / script.js</span>
          <div class="pg-tabs">
            <button v-for="t in tabs" :key="t" class="pg-tab" :class="{on:act===t}" @click="act=t">{{t.toUpperCase()}}</button>
          </div>
        </div>
        <div class="pg-body">
          <CodeEditor v-if="act==='html'" v-model="h" language="html" />
          <CodeEditor v-if="act==='css'" v-model="c" language="css" />
          <CodeEditor v-if="act==='js'" v-model="j" language="javascript" />
        </div>
      </div>

      <div class="pg-preview">
        <div class="pg-ph">
          <span>结果预览</span>
          <button class="pg-run" @click="refresh">🔄 刷新</button>
        </div>
        <iframe class="pg-if" :srcdoc="output" sandbox="allow-scripts allow-same-origin allow-modals"></iframe>
      </div>
    </div>

    <div class="pg-tpl" style="max-width:var(--max-width);margin:36px auto;padding:0 24px">
      <h3 style="text-align:center;margin-bottom:16px">📋 快速模板 (点击加载)</h3>
      <div class="pg-tg">
        <button v-for="t in tpls" :key="t.n" class="pg-tb" @click="load(t)">
          <span>{{t.ico}}</span><span>{{t.n}}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
const CodeEditor = defineAsyncComponent(() => import('@/components/CodeEditor.vue'))

const act = ref('html')
const tabs = ['html','css','js']

const h = ref(`<div class="box">
  <h1>Hello LwyJr!</h1>
  <p>修改左边代码，右边自动刷新效果</p>
  <button onclick="sayHi()">点我试试</button>
</div>`)

const c = ref(`*{margin:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5}
.box{text-align:center;padding:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:20px;color:#fff;max-width:400px;animation:fadein .6s}
.box h1{font-size:2em;margin-bottom:10px}
.box button{display:inline-block;margin-top:16px;padding:12px 32px;border:none;border-radius:50px;background:#fff;color:#667eea;font-size:1em;font-weight:700;cursor:pointer;transition:all .3s}
.box button:hover{transform:translateY(-2px);box-shadow:0 6px 25px rgba(0,0,0,.25)}
@keyframes fadein{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`)

const j = ref(`function sayHi(){alert('你好! LwyJr!')}
console.log('代码演练场就绪 — 修改代码试试')`)

const output = computed(()=>{
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'+c.value+'</style></head><body>'+h.value+'<script>'+j.value+'</'+'script></body></html>'
})

function refresh(){ /* srcdoc auto-updates via computed */ }

const tpls = [
  {n:'霓虹灯文字',ico:'🌟',h:'<h1 class="n">NEON</h1>',c:'body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#000;font-family:Arial}.n{color:#fff;font-size:5em;text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #0fa,0 0 82px #0fa,0 0 102px #0fa,0 0 151px #0fa;animation:f 1.5s infinite alternate}@keyframes f{50%{text-shadow:none}}',j:''},
  {n:'波浪背景',ico:'🌊',h:'',c:'body{margin:0;min-height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);overflow:hidden;position:relative}body::after{content:"";position:absolute;bottom:-20%;left:-25%;width:150%;height:60%;background:rgba(255,255,255,.1);border-radius:45%;animation:w 6s linear infinite}body::before{content:"";position:absolute;bottom:-15%;left:-25%;width:150%;height:50%;background:rgba(255,255,255,.08);border-radius:40%;animation:w 8s linear infinite reverse}@keyframes w{from{transform:translateX(0)rotate(0)}to{transform:translateX(-20%)rotate(360deg)}}',j:''},
  {n:'粒子背景',ico:'💥',h:'<canvas id="c"></canvas>',c:'body{margin:0;overflow:hidden;background:#0a0a2e}canvas{display:block}',j:'const cv=document.getElementById("c"),ctx=cv.getContext("2d");let w,h,ps=[];function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight}rs();window.onresize=rs;for(let i=0;i<80;i++)ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,r:Math.random()*2+1,c:Math.random()*360});function draw(){ctx.fillStyle="rgba(10,10,46,.12)";ctx.fillRect(0,0,w,h);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="hsl("+p.c+",70%,60%)";ctx.fill()});requestAnimationFrame(draw)}draw()'},
  {n:'3D卡片',ico:'🃏',h:'<div class="cd"><div class="in"><div class="f">正面</div><div class="b">背面</div></div></div>',c:'body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#1a1a2e;font-family:Arial}.cd{width:200px;height:280px;perspective:1000px}.in{width:100%;height:100%;transition:transform .8s;transform-style:preserve-3d;position:relative}.cd:hover .in{transform:rotateY(180deg)}.f,.b{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff}.f{background:linear-gradient(135deg,#667eea,#764ba2)}.b{background:linear-gradient(135deg,#f093fb,#f5576c);transform:rotateY(180deg)}',j:''},
  {n:'钟表(CSS)',ico:'🕐',h:'<div class="cl"><div class="hh"></div><div class="mh"></div><div class="sh"></div><span class="dot"></span></div>',c:'body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#1a1a2e}.cl{width:180px;height:180px;border:4px solid #667eea;border-radius:50%;position:relative}.hh,.mh,.sh{position:absolute;bottom:50%;left:50%;transform-origin:bottom;border-radius:3px}.hh{width:5px;height:50px;background:#fff;margin-left:-2.5px}.mh{width:3px;height:65px;background:#aaa;margin-left:-1.5px}.sh{width:2px;height:75px;background:#f093fb;margin-left:-1px}.dot{position:absolute;width:10px;height:10px;background:#f093fb;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}',j:'const d=new Date();document.querySelector(".hh").style.transform="rotate("+(d.getHours()%12*30)+"deg)";document.querySelector(".mh").style.transform="rotate("+(d.getMinutes()*6)+"deg)";document.querySelector(".sh").style.transform="rotate("+(d.getSeconds()*6)+"deg)"'},
  {n:'渐变动画',ico:'🎨',h:'',c:'body{margin:0;min-height:100vh;background:linear-gradient(45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab);background-size:400% 400%;animation:g 8s ease infinite}@keyframes g{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}',j:''},
  {n:'彩灯循环',ico:'💡',h:'<div id="ls"></div>',c:'#ls{display:flex;gap:16px;justify-content:center;padding:40px}#ls span{width:40px;height:40px;border-radius:50%}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111}',j:'const ls=document.getElementById("ls"),cs=["#e74c3c","#e67e22","#f1c40f","#2ecc71","#3498db","#9b59b6"];for(let i=0;i<6;i++){let s=document.createElement("span");s.style.background=cs[i];ls.appendChild(s)}let idx=0;setInterval(()=>{document.querySelectorAll("#ls span").forEach((el,i)=>{el.style.opacity=i===idx?"1":"0.2";el.style.transform=i===idx?"scale(1.3)":"scale(1)"});idx=(idx+1)%6},500)'},
  {n:'打字效果',ico:'⌨️',h:'<h1 id="tw"></h1>',c:'body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#1a1a2e;font-family:monospace}#tw{color:#0fa;font-size:2em}#tw::after{content:"|";animation:blink .8s infinite}@keyframes blink{50%{opacity:0}}',j:'const el=document.getElementById("tw"),txts=["Hello World!","你好世界!","LwyJr!","从零到大牛!"];let i=0,c=0;function w(){el.textContent=txts[i].slice(0,c);c++;if(c>txts[i].length){i=(i+1)%txts.length;c=0;setTimeout(w,1500)}else{setTimeout(w,100)}}w()'},
]

function load(t:{h:string;c:string;j:string}){
  h.value=t.h;c.value=t.c;j.value=t.j;act.value='html'
}
</script>

<style scoped>
.pg{display:grid;grid-template-columns:1fr 1fr;gap:20px;min-height:500px}
@media(max-width:900px){.pg{grid-template-columns:1fr}}
@media(max-width:640px){.pg-body{min-height:280px}.pg-if{min-height:250px}}

.pg-editor{background:var(--code-bg);border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
.pg-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--code-header-bg);border-bottom:1px solid var(--code-border)}
.pg-dots{display:flex;gap:6px}.pg-dots i{width:10px;height:10px;border-radius:50%;display:inline-block}
.pg-dots i:nth-child(1){background:var(--code-dot-red)}.pg-dots i:nth-child(2){background:var(--code-dot-yellow)}.pg-dots i:nth-child(3){background:var(--code-dot-green)}
.pg-title{flex:1;text-align:center;color:var(--code-header-text);font-size:.8rem}
.pg-tabs{display:flex;gap:2px}
.pg-tab{padding:5px 14px;background:0 0;color:var(--code-header-text);border-radius:5px;font-size:.78rem;border:none;cursor:pointer;min-height:44px;min-width:44px}
.pg-tab.on{background:var(--primary);color:var(--btn-inverted-text)}
.pg-body{flex:1;min-height:400px}

.pg-preview{background:var(--preview-bg);border-radius:16px;border:1px solid var(--border);overflow:hidden;display:flex;flex-direction:column}
.pg-ph{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:var(--bg);border-bottom:1px solid var(--border);font-size:.85rem;color:var(--text-secondary)}
.pg-run{padding:4px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:.78rem;color:var(--text-secondary);cursor:pointer}.pg-run:hover{border-color:var(--primary)}
.pg-if{flex:1;border:none;min-height:400px}

.pg-tg{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.pg-tb{display:flex;align-items:center;gap:6px;padding:10px 20px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;cursor:pointer;transition:all .3s}
.pg-tb:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:var(--shadow)}
</style>
