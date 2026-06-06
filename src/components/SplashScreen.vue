<template>
  <Teleport to="body">
    <div class="splash-root" :class="['preset-'+preset.id, 'exit-'+preset.exitEffect, { out: leaving }]" :style="rootStyle" @click="dismiss">
      <!-- Noise -->
      <div class="noise" :style="{ opacity: preset.noise }"></div>

      <!-- Mesh layers -->
      <div class="mesh-layer" v-if="preset.mesh" :style="{ background: preset.mesh }"></div>

      <!-- Geometric shapes -->
      <div v-for="i in preset.geoCount" :key="'g'+i" class="geo-shape" :class="preset.geoShapes[(i-1)%preset.geoShapes.length]" :style="geoStyle(i)"></div>

      <!-- Particle canvas -->
      <canvas ref="pCanvas" class="p-canvas"></canvas>

      <!-- Progress -->
      <div class="progress-track"><div class="progress-fill" :style="{ width: progress+'%', background: preset.progressBg }"></div></div>

      <!-- Content -->
      <div class="content">
        <!-- Logo -->
        <div class="mark-wrap" :class="{ in: step>=1 }">
          <div class="mark-ring" :style="preset.logoStyle"><div class="mark-inner"><span class="mark-icon">⚡</span></div></div>
        </div>

        <!-- Title -->
        <h1 class="hero-title" :class="{ in: step>=1 }" :style="{ background: preset.titleGradient, textShadow: preset.titleShadow, '-webkit-background-clip':'text', '-webkit-text-fill-color':'transparent', 'background-clip':'text' }">LwyJr</h1>
        <!-- <p class="hero-tagline" :class="{ in: step>=2 }">从 0 到全栈大牛</p> -->

        <!-- Code block -->
        <div class="code-block" :class="{ in: step>=2 }" :style="{ background: preset.codeBg, 'border-color': preset.codeBorder||'rgba(255,255,255,.06)' }">
          <div class="cb-header">
            <span class="cb-dot cbd-1"></span><span class="cb-dot cbd-2"></span><span class="cb-dot cbd-3"></span>
            <span class="cb-file">server.js</span>
          </div>
          <pre class="cb-code"><span class="cb-out">{{ typedCode }}</span><span class="crs" v-if="typing">|</span></pre>
        </div>

        <!-- Capsules -->
        <div class="capsules-row" :class="{ in: step>=3 }">
          <span v-for="(c,i) in capsules" :key="c" class="cap-item" :style="{ animationDelay: (0.12*i)+'s' }">
            <span class="cap-dot" :style="{ background: preset.accent }"></span>{{ c }}
          </span>
        </div>

        <!-- Counters -->
        <div class="counters-row" :class="{ in: step>=3 }">
          <div class="counter-card" v-for="(c,i) in counters" :key="c.label" :style="{ animationDelay: (0.35+i*0.1)+'s' }">
            <span class="c-num" :style="{ background: 'linear-gradient(135deg,'+preset.accent+','+preset.accent2+')', '-webkit-background-clip':'text', '-webkit-text-fill-color':'transparent', 'background-clip':'text' }">{{ c.num }}</span>
            <span class="c-label">{{ c.label }}</span>
          </div>
        </div>

        <!-- CTA -->
        <button class="cta-btn" :class="{ in: step>=3 }" :style="{ background: preset.ctaBg, boxShadow: preset.ctaGlow }" @click.stop="dismiss">
          <span>Start Learning</span>
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
const emit = defineEmits<{ (e: 'done'): void }>()

// 内联预设，不依赖外部大文件避免模块加载失败
interface Preset { id:number; name:string; bg:string; mesh:string; titleGradient:string; titleShadow:string; logoStyle:Record<string,string>; codeBg:string; codeBorder:string; accent:string; accent2:string; noise:number; pCount:number; pColors:string[]; geoCount:number; geoShapes:string[]; ctaBg:string; ctaGlow:string; progressBg:string; exitEffect:string }
const all:Preset[]=[
  {id:1,name:'Aurora',bg:'#020210',mesh:'radial-gradient(ellipse 60% 50% at 30% 50%,rgba(0,255,65,.12),transparent 50%), radial-gradient(ellipse 50% 60% at 70% 30%,rgba(0,113,227,.1),transparent 50%)',titleGradient:'linear-gradient(135deg,#00ff41,#00d4ff,#00ff41)',titleShadow:'0 0 40px rgba(0,255,65,.3)',logoStyle:{border:'2px solid rgba(0,255,65,.3)','box-shadow':'0 0 30px rgba(0,255,65,.2)'},codeBg:'rgba(0,8,20,.9)',codeBorder:'rgba(0,255,65,.08)',accent:'#00ff41',accent2:'#00d4ff',noise:.015,pCount:50,pColors:['rgba(0,255,65,.15)','rgba(0,212,255,.12)','rgba(88,86,214,.1)'],geoCount:3,geoShapes:['circle','circle','circle'],ctaBg:'linear-gradient(135deg,#00ff41,#00d4ff)',ctaGlow:'0 0 40px rgba(0,255,65,.3)',progressBg:'linear-gradient(90deg,#00ff41,#00d4ff)',exitEffect:'default'},
  {id:2,name:'Purple',bg:'#050510',mesh:'radial-gradient(ellipse 70% 60% at 20% 60%,rgba(138,43,226,.1),transparent 50%), radial-gradient(ellipse 50% 50% at 80% 40%,rgba(0,200,255,.08),transparent 50%)',titleGradient:'linear-gradient(135deg,#a855f7,#7dd3fc,#a855f7)',titleShadow:'0 0 40px rgba(168,85,247,.3)',logoStyle:{border:'2px solid rgba(168,85,247,.3)'},codeBg:'rgba(10,5,25,.9)',codeBorder:'rgba(168,85,247,.08)',accent:'#a855f7',accent2:'#7dd3fc',noise:.015,pCount:45,pColors:['rgba(168,85,247,.12)','rgba(125,211,252,.1)'],geoCount:4,geoShapes:['circle','circle','rounded','circle'],ctaBg:'linear-gradient(135deg,#a855f7,#7dd3fc)',ctaGlow:'0 0 40px rgba(168,85,247,.3)',progressBg:'linear-gradient(90deg,#a855f7,#7dd3fc)',exitEffect:'default'},
  {id:3,name:'Sunset',bg:'#080504',mesh:'radial-gradient(ellipse 60% 50% at 50% 30%,rgba(255,55,95,.1),transparent 50%)',titleGradient:'linear-gradient(135deg,#ff375f,#ff9f0a,#ff375f)',titleShadow:'0 0 40px rgba(255,55,95,.3)',logoStyle:{border:'2px solid rgba(255,55,95,.3)'},codeBg:'rgba(15,5,5,.9)',codeBorder:'rgba(255,55,95,.08)',accent:'#ff375f',accent2:'#ff9f0a',noise:.015,pCount:48,pColors:['rgba(255,55,95,.12)','rgba(255,159,10,.1)'],geoCount:3,geoShapes:['circle','rounded','circle'],ctaBg:'linear-gradient(135deg,#ff375f,#ff9f0a)',ctaGlow:'0 0 40px rgba(255,55,95,.3)',progressBg:'linear-gradient(90deg,#ff375f,#ff9f0a)',exitEffect:'fire'},
  {id:4,name:'Neon',bg:'#0a0a0f',mesh:'',titleGradient:'#ff00ff',titleShadow:'0 0 30px rgba(255,0,255,.6), 0 0 60px rgba(255,0,255,.3), 0 0 90px rgba(0,255,255,.2)',logoStyle:{border:'3px solid rgba(255,0,255,.5)','box-shadow':'0 0 40px rgba(255,0,255,.4)'},codeBg:'rgba(12,0,15,.9)',codeBorder:'rgba(255,0,255,.1)',accent:'#ff00ff',accent2:'#00ffff',noise:.015,pCount:40,pColors:['rgba(255,0,255,.15)','rgba(0,255,255,.12)'],geoCount:4,geoShapes:['rounded','rounded','rounded','rounded'],ctaBg:'linear-gradient(135deg,#ff00ff,#00ffff)',ctaGlow:'0 0 50px rgba(255,0,255,.5)',progressBg:'linear-gradient(90deg,#ff00ff,#00ffff)',exitEffect:'neon'},
  {id:5,name:'Gold',bg:'#0a0a08',mesh:'radial-gradient(ellipse 40% 40% at 50% 30%,rgba(212,175,55,.12),transparent 60%)',titleGradient:'linear-gradient(135deg,#d4af37,#fff8dc,#d4af37)',titleShadow:'0 0 40px rgba(212,175,55,.3)',logoStyle:{border:'2px solid rgba(212,175,55,.4)'},codeBg:'rgba(10,8,5,.9)',codeBorder:'rgba(212,175,55,.1)',accent:'#d4af37',accent2:'#fff8dc',noise:.008,pCount:30,pColors:['rgba(212,175,55,.1)','rgba(255,248,220,.08)'],geoCount:2,geoShapes:['diamond','diamond'],ctaBg:'linear-gradient(135deg,#b8860b,#d4af37,#fff8dc)',ctaGlow:'0 0 40px rgba(212,175,55,.4)',progressBg:'linear-gradient(90deg,#b8860b,#fff8dc)',exitEffect:'gold'},
  {id:6,name:'Matrix',bg:'#000',mesh:'',titleGradient:'#00ff41',titleShadow:'0 0 20px rgba(0,255,65,.5)',logoStyle:{border:'1px solid rgba(0,255,65,.4)','box-shadow':'0 0 20px rgba(0,255,65,.3)'},codeBg:'rgba(0,10,0,.9)',codeBorder:'rgba(0,255,65,.1)',accent:'#00ff41',accent2:'#003300',noise:.01,pCount:80,pColors:['rgba(0,255,65,.1)','rgba(0,255,65,.05)'],geoCount:0,geoShapes:[],ctaBg:'#003300',ctaGlow:'0 0 20px rgba(0,255,65,.4)',progressBg:'linear-gradient(90deg,#003300,#00ff41)',exitEffect:'neon'},
  {id:7,name:'Ocean',bg:'#000510',mesh:'radial-gradient(ellipse 70% 80% at 50% 60%,rgba(0,100,200,.12),transparent 50%)',titleGradient:'linear-gradient(180deg,#7dd3fc,#0284c7,#0c4a6e)',titleShadow:'0 0 40px rgba(2,132,199,.4)',logoStyle:{border:'2px solid rgba(2,132,199,.3)'},codeBg:'rgba(0,5,15,.9)',codeBorder:'rgba(2,132,199,.08)',accent:'#0284c7',accent2:'#7dd3fc',noise:.012,pCount:40,pColors:['rgba(125,211,252,.1)','rgba(2,132,199,.08)'],geoCount:3,geoShapes:['circle','circle','circle'],ctaBg:'linear-gradient(135deg,#0c4a6e,#0284c7,#7dd3fc)',ctaGlow:'0 0 40px rgba(2,132,199,.4)',progressBg:'linear-gradient(90deg,#0c4a6e,#7dd3fc)',exitEffect:'default'},
  {id:8,name:'Minimal',bg:'#060608',mesh:'',titleGradient:'linear-gradient(135deg,#f5f5f7,#999)',titleShadow:'none',logoStyle:{border:'1px solid rgba(255,255,255,.08)'},codeBg:'rgba(10,10,12,.95)',codeBorder:'rgba(255,255,255,.04)',accent:'#ffffff',accent2:'#888',noise:.005,pCount:20,pColors:['rgba(255,255,255,.03)'],geoCount:4,geoShapes:['hex','hex','hex','hex'],ctaBg:'linear-gradient(135deg,#333,#666)',ctaGlow:'none',progressBg:'linear-gradient(90deg,#444,#888)',exitEffect:'default'},
] as const

type PresetTuple = typeof all[number]
const preset = ref<PresetTuple>(all[Math.floor(Math.random()*all.length)])

const step = ref(0)
const leaving = ref(false)
const progress = ref(0)
const typing = ref(true)
const typedCode = ref('')
const pCanvas = ref<HTMLCanvasElement>()

const capsules = ['Node.js 37 Chapters','Live Code Playground','Apple Design','Zero to Full-Stack','30+ Modules']
const counters = [{num:'37',label:'Chapters'},{num:'110+',label:'Demos'},{num:'100%',label:'API Coverage'}]
const codeLines = ['const server = http.createServer(async (req, res) => {','  if (req.method === "GET" && req.url === "/api/books") {','    const data = await fs.promises.readFile("./books.json","utf-8");','    res.writeHead(200, { "Content-Type": "application/json" });','    res.end(data);','  }','});','server.listen(3000, () => console.log("🚀 Ready → port 3000"));']

let charIdx = 0
let typingTimer: ReturnType<typeof setInterval>|null = null
let animFrame = 0

onMounted(() => {
  // Skip splash on revisit within the same session
  if (sessionStorage.getItem('lwyjr-splash-seen')) {
    emit('done')
    return
  }
  sessionStorage.setItem('lwyjr-splash-seen', '1')
  setTimeout(()=>step.value=1,400)
  setTimeout(()=>step.value=2,1000)
  setTimeout(()=>step.value=3,1800)
  const start = Date.now()
  const pt = setInterval(()=>{const p=Math.min(100,((Date.now()-start)/4500)*100);progress.value=p;if(p>=100)clearInterval(pt)},30)
  typingTimer = setInterval(()=>{if(charIdx<codeLines.join('\n').length){typedCode.value=codeLines.join('\n').slice(0,++charIdx)}else{typing.value=false;typingTimer&&clearInterval(typingTimer)}},16)
  nextTick(initParticles)
  setTimeout(()=>{if(!leaving.value)dismiss()},5500)
})

onUnmounted(()=>{typingTimer&&clearInterval(typingTimer);cancelAnimationFrame(animFrame)})

function initParticles(){const cvs=pCanvas.value;if(!cvs)return;cvs.width=window.innerWidth;cvs.height=window.innerHeight;const ctx=cvs.getContext('2d');if(!ctx)return;const pts:Array<{x:number;y:number;vx:number;vy:number;size:number;color:string;life:number;maxLife:number}>=[];
for(let i=0;i<preset.value.pCount;i++){pts.push({x:Math.random()*cvs.width,y:Math.random()*cvs.height,vx:(Math.random()-.5)*.6,vy:-(Math.random()*.8+.3),size:Math.random()*3+1,color:preset.value.pColors[i%preset.value.pColors.length],life:0,maxLife:200+Math.random()*200})}
function animate(){ctx!.clearRect(0,0,cvs!.width,cvs!.height);for(const p of pts){p.x+=p.vx;p.y+=p.vy;p.life++;if(p.life>p.maxLife||p.x<0||p.x>cvs!.width||p.y<-20){p.x=Math.random()*cvs!.width;p.y=cvs!.height+10;p.vx=(Math.random()-.5)*.6;p.vy=-(Math.random()*.8+.3);p.life=0}const alpha=(1-p.life/p.maxLife)*.5;ctx!.beginPath();ctx!.arc(p.x,p.y,p.size,0,Math.PI*2);ctx!.fillStyle=p.color.replace('x',alpha.toFixed(2));ctx!.fill()}
animFrame=requestAnimationFrame(animate)}
animate()}

function geoStyle(i:number){const r=preset.value.geoShapes[(i-1)%preset.value.geoShapes.length]
return {animationDelay:(i*.3)+'s',
animationDuration:(15+i*3)+'s',
...(r==='diamond'?{transform:`rotate(${i*45}deg)`,borderRadius:'8px'}:{})}}

const rootStyle = { background: preset.value.bg }

function dismiss(){if(leaving.value)return;leaving.value=true;progress.value=100;setTimeout(()=>emit('done'),700)}
</script>

<style>
/* ====== Splash Root ====== */
.splash-root {position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;animation:rootIn .6s cubic-bezier(.16,1,.3,1) both;}
.splash-root.out{animation:rootOut .7s cubic-bezier(.4,0,.2,1) forwards;pointer-events:none}
@keyframes rootIn{from{opacity:0}to{opacity:1}}
@keyframes rootOut{to{opacity:0;filter:blur(24px) brightness(.4);transform:scale(1.06)}}

/* Exit effects */
.exit-fire.out{animation:fireOut .7s forwards}
@keyframes fireOut{30%{filter:brightness(3) blur(0)}to{opacity:0;filter:brightness(0) blur(30px);transform:scale(1.1)}}
.exit-neon.out{animation:neonOut .7s forwards}
@keyframes neonOut{30%{filter:saturate(3) brightness(2)}to{opacity:0;filter:saturate(0) brightness(0);transform:scale(1.05)}}
.exit-cosmic.out{animation:cosmicOut .9s forwards}
@keyframes cosmicOut{50%{filter:brightness(2) hue-rotate(90deg)}to{opacity:0;filter:brightness(0) hue-rotate(180deg);transform:scale(1.15)}}
.exit-pixel.out{animation:pixelOut .5s steps(5) forwards}
@keyframes pixelOut{0%{transform:scale(1)}100%{opacity:0;transform:scale(3)}}
.exit-gold.out{animation:goldOut .8s forwards}
@keyframes goldOut{30%{filter:brightness(2) sepia(1)}to{opacity:0;filter:brightness(0) sepia(1);transform:scale(1.08)}}

.noise{position:absolute;inset:0;z-index:1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.mesh-layer{position:absolute;inset:0;z-index:0;filter:blur(80px);opacity:.7;animation:meshFloat 8s ease-in-out infinite}
@keyframes meshFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.1)}66%{transform:translate(-20px,30px) scale(.9)}}

.geo-shape{position:absolute;z-index:0;opacity:.04;pointer-events:none}
.geo-shape.circle{border-radius:50%;border:1px solid rgba(255,255,255,.05)}
.geo-shape.square{border:1px solid rgba(255,255,255,.04)}
.geo-shape.rounded{border-radius:24px;border:1px solid rgba(255,255,255,.04)}
.geo-shape.diamond{border:1px solid rgba(255,255,255,.04)}
.geo-shape.hex{clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);border:1px solid rgba(255,255,255,.04);border-radius:0}
.geo-shape:nth-child(1){width:180px;height:180px;top:10%;left:5%}
.geo-shape:nth-child(2){width:140px;height:140px;top:55%;right:8%}
.geo-shape:nth-child(3){width:100px;height:100px;bottom:12%;left:12%}
.geo-shape:nth-child(4){width:200px;height:200px;top:8%;right:15%}
.geo-shape:nth-child(5){width:120px;height:120px;top:30%;left:50%}
.geo-shape:nth-child(6){width:160px;height:160px;bottom:20%;right:25%}
.geo-shape:nth-child(7){width:90px;height:90px;top:50%;left:3%}
.geo-shape:nth-child(8){width:130px;height:130px;bottom:5%;left:40%}

.p-canvas{position:absolute;inset:0;z-index:0;pointer-events:none}

.progress-track{position:absolute;bottom:0;left:0;right:0;height:2px;z-index:10;background:rgba(255,255,255,.03)}
.progress-fill{height:100%;transition:width .1s linear}

.content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center}

.mark-wrap{margin-bottom:20px;opacity:0;transform:scale(.4);transition:all .7s cubic-bezier(.34,1.56,.64,1) .2s}
.mark-wrap.in{opacity:1;transform:scale(1)}
.mark-ring{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.02)}
.mark-inner{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center}
.mark-icon{font-size:2rem}

.hero-title{font-family:-apple-system,'SF Pro Display','PingFang SC',sans-serif;font-size:clamp(2.6rem,7vw,4.5rem);font-weight:900;letter-spacing:-.05em;margin-bottom:6px;opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.34,1.56,.64,1) .25s;color:#f5f5f7}
.hero-title.in{opacity:1;transform:translateY(0)}
.hero-tagline{font-size:1.05rem;color:#86868b;letter-spacing:.04em;margin-bottom:28px;opacity:0;transform:translateY(8px);transition:all .5s cubic-bezier(.34,1.56,.64,1) .15s}
.hero-tagline.in{opacity:1;transform:translateY(0)}

.code-block{width:90vw;max-width:480px;margin-bottom:20px;border-radius:14px;overflow:hidden;text-align:left;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);opacity:0;transform:translateY(16px) scale(.97);transition:all .6s cubic-bezier(.34,1.56,.64,1) .35s}
.code-block.in{opacity:1;transform:translateY(0) scale(1)}
.cb-header{display:flex;align-items:center;gap:7px;padding:8px 12px;background:rgba(0,0,0,.4);border-bottom:1px solid rgba(255,255,255,.03)}
.cb-dot{width:9px;height:9px;border-radius:50%}.cbd-1{background:#ff5f57}.cbd-2{background:#febc2e}.cbd-3{background:#28c840}
.cb-file{font-family:'SF Mono','Fira Code',monospace;font-size:.68rem;color:#555;margin-left:4px}
.cb-code{padding:12px 14px;margin:0;font-family:'SF Mono','Fira Code',monospace;font-size:.72rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:130px}
.cb-out{color:#98c379}.crs{color:#00ff41;animation:bl .8s step-end infinite}@keyframes bl{50%{opacity:0}}

.capsules-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:24px;opacity:0;transition:opacity .4s .1s}
.capsules-row.in{opacity:1}
.cap-item{display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04);color:#a1a1a6;font-size:.74rem;font-weight:500;backdrop-filter:blur(10px);animation:capIn .5s cubic-bezier(.34,1.56,.64,1) both}
@keyframes capIn{0%{opacity:0;transform:translateY(14px) scale(.85)}100%{opacity:1;transform:translateY(0) scale(1)}}
.cap-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

.counters-row{display:flex;gap:20px;margin-bottom:28px;opacity:0;transition:opacity .4s .1s}
.counters-row.in{opacity:1}
.counter-card{display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 22px;border-radius:16px;background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.03);animation:capIn .5s cubic-bezier(.34,1.56,.64,1) both;min-width:75px}
.c-num{font-family:'SF Mono','Fira Code',monospace;font-size:1.5rem;font-weight:800;background-clip:text}
.c-label{color:#86868b;font-size:.68rem;font-weight:500;letter-spacing:.03em;text-transform:uppercase}

.cta-btn{display:inline-flex;align-items:center;gap:10px;padding:15px 40px;border:none;border-radius:32px;color:#fff;font-size:1.05rem;font-weight:700;cursor:pointer;opacity:0;transform:translateY(16px);transition:all .5s cubic-bezier(.34,1.56,.64,1) .4s}
.cta-btn.in{opacity:1;transform:translateY(0)}
.cta-btn:hover{transform:translateY(-3px) scale(1.05)}
.cta-btn:active{transform:scale(.94)}
.cta-btn svg{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.cta-btn:hover svg{transform:translateX(4px)}

@media(max-width:640px){.hero-title{font-size:2rem}.code-block{max-width:94vw}.cb-code{font-size:.65rem;min-height:110px}.capsules-row{gap:5px}.cap-item{padding:5px 10px;font-size:.66rem}.counters-row{gap:10px}.counter-card{padding:8px 14px}.c-num{font-size:1.2rem}.cta-btn{padding:14px 32px;font-size:.9rem;min-height:44px}}
@media(orientation:landscape) and (max-height:500px){.hero-title{font-size:1.6rem}.code-block{display:none}.capsules-row{display:none}.counters-row{gap:8px}.counter-card{padding:6px 10px}.c-num{font-size:1rem}}
</style>
