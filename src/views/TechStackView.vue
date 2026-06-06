<template>
  <div class="sp page-in" style="padding-top:var(--main-header-top)">
    <h2 class="st"><span class="gt">🛠 技术栈全景</span></h2>
    <p class="ss">覆盖前端+后端+工具的完整技术生态，点击卡片查看详情，一键跳转学习教程</p>

    <div v-for="cat in categories" :key="cat.name" class="sc">
      <div class="ch">
        <h3 class="cti">{{cat.icon}} {{cat.name}}</h3>
        <p class="cdd">{{cat.desc}}</p>
        <span class="ctg">{{cat.items.length}} 项</span>
      </div>
      <div class="tg">
        <div v-for="tech in cat.items" :key="tech.name" class="tc" :class="{ex:ex===tech.name}" @click="ex=ex===tech.name?'':tech.name">
          <div class="tch">
            <span class="ticon">{{tech.icon}}</span>
            <div>
              <h4>{{tech.name}}</h4>
              <div class="tlv">
                <span v-for="i in 5" :key="i" class="ld" :class="{on:i<=tech.level}"></span>
                <span class="ltx">{{['','了解','熟悉','掌握','精通','专家'][tech.level]||''}}</span>
              </div>
            </div>
          </div>
          <p class="tsd">{{tech.desc}}</p>

          <div v-if="ex===tech.name" class="tde">
            <div><b>🎯 为什么学:</b> {{tech.why}}</div>
            <div><b>📚 学习时长:</b> {{tech.studyTime}}</div>
            <div><b>🛠 前置知识:</b> {{tech.prerequisites}}</div>
            <div class="tli">
              <a v-if="tech.links" v-for="lk in tech.links" :key="lk.label" :href="lk.url" target="_blank" class="tlk">{{lk.icon}} {{lk.label}}</a>
              <router-link v-if="tech.goTutorial" :to="{path:'/tutorials',query:{tab:tech.goTutorial}}" class="tlk tlk-go" @click="ex=''">📚 本平台教程</router-link>
            </div>
          </div>

          <div v-if="ex!==tech.name" class="tht">点击查看详情</div>
        </div>
      </div>
    </div>

    <div class="lp">
      <h3>🗺️ 推荐学习路径</h3>
      <div class="pf">
        <div v-for="(s,i) in path" :key="i" class="ps">
          <div class="pb">{{i+1}}</div>
          <div class="pc"><strong>{{s.phase}}</strong><p>{{s.items}}</p><span class="pt">{{s.time}}</span></div>
          <div v-if="i<path.length-1" class="pa">↓</div>
        </div>
      </div>
    </div>

    <div class="fq">
      <h3>❓ 常见问题</h3>
      <div v-for="(faq,i) in faqs" :key="i" class="fi" @click="faq.open=!faq.open">
        <div class="fqq"><span>{{faq.q}}</span><span class="fa" :class="{on:faq.open}">▼</span></div>
        <div v-if="faq.open" class="faa">{{faq.a}}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const ex = ref('')

const categories = [
  { icon:'🖥️',name:'前端基础',desc:'网页开发核心技术，必修课',
    items:[
      { icon:'📄',name:'HTML5',desc:'网页结构标记语言',level:5,why:'一切网页的基础',studyTime:'3-5天',prerequisites:'无',goTutorial:'html',
        links:[{icon:'📖',label:'MDN教程',url:'https://developer.mozilla.org/zh-CN/docs/Web/HTML'}]},
      { icon:'🎨',name:'CSS3',desc:'样式与布局设计',level:5,why:'决定网页外观',studyTime:'7-10天',prerequisites:'HTML基础',goTutorial:'css',
        links:[{icon:'📖',label:'MDN教程',url:'https://developer.mozilla.org/zh-CN/docs/Web/CSS'}]},
      { icon:'⚡',name:'JavaScript',desc:'编程语言核心',level:5,why:'让网页有交互能力',studyTime:'15-30天',prerequisites:'HTML+CSS',goTutorial:'js',
        links:[{icon:'📖',label:'MDN教程',url:'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript'}]},
      { icon:'🔷',name:'TypeScript',desc:'类型安全的JS',level:4,why:'大型项目必备',studyTime:'5-7天',prerequisites:'JS基础',goTutorial:'ts',
        links:[{icon:'📖',label:'官方文档',url:'https://www.typescriptlang.org/zh/'}]},
    ]},
  { icon:'🎯',name:'前端框架',desc:'现代开发效率工具',
    items:[
      { icon:'💚',name:'Vue 3',desc:'渐进式框架',level:5,why:'上手简单，国内最广',studyTime:'7-14天',prerequisites:'HTML+CSS+JS',goTutorial:'vue3',
        links:[{icon:'📖',label:'官方文档',url:'https://cn.vuejs.org/'}]},
      { icon:'📦',name:'Vite',desc:'下一代构建工具',level:4,why:'秒启动，HMR极快',studyTime:'1-2天',prerequisites:'了解模块化',
        links:[{icon:'📖',label:'Vite文档',url:'https://cn.vitejs.dev/'}]},
      { icon:'⚛️',name:'React',desc:'声明式UI库',level:3,why:'全球最多，生态最富',studyTime:'10-20天',prerequisites:'JS扎实',goTutorial:'react2',
        links:[{icon:'📖',label:'React文档',url:'https://react.dev/'}]},
      { icon:'📱',name:'Nuxt',desc:'Vue全栈框架',level:3,why:'SSR开箱即用',studyTime:'5-7天',prerequisites:'Vue3基础',goTutorial:'vue3'},
    ]},
  { icon:'🎨',name:'UI与动画',desc:'让网页更好看',
    items:[
      { icon:'🖼️',name:'Canvas',desc:'2D绘图API',level:4,why:'游戏/可视化基石',studyTime:'3-5天',prerequisites:'JS基础',goTutorial:'canvas'},
      { icon:'🔮',name:'Three.js',desc:'3D可视化库',level:3,why:'浏览器3D场景',studyTime:'5-10天',prerequisites:'JS+3D概念',goTutorial:'canvas',
        links:[{icon:'📖',label:'Three.js',url:'https://threejs.org/'}]},
      { icon:'✨',name:'GSAP',desc:'专业动画库',level:4,why:'最强JS动画库',studyTime:'2-3天',prerequisites:'JS基础',goTutorial:'canvas',
        links:[{icon:'📖',label:'GSAP',url:'https://gsap.com/'}]},
      { icon:'🪄',name:'SVG',desc:'矢量图形动画',level:4,why:'无限缩放不失真',studyTime:'2-3天',prerequisites:'HTML基础',goTutorial:'canvas'},
      { icon:'🎭',name:'Tailwind',desc:'原子化CSS',level:3,why:'不用写CSS文件',studyTime:'2-3天',prerequisites:'CSS基础',goTutorial:'css',
        links:[{icon:'📖',label:'Tailwind',url:'https://tailwindcss.com/'}]},
    ]},
  { icon:'🛠️',name:'后端技术',desc:'服务端核心技术栈',
    items:[
      { icon:'🟢',name:'Node.js',desc:'JS运行时',level:4,why:'前后端统一语言',studyTime:'5-7天',prerequisites:'JS基础',goTutorial:'node',
        links:[{icon:'📖',label:'Node.js',url:'https://nodejs.org/'}]},
      { icon:'🚂',name:'Express',desc:'Node框架',level:4,why:'最流行，简单易用',studyTime:'3-5天',prerequisites:'Node.js',goTutorial:'node'},
      { icon:'🗄️',name:'MySQL',desc:'关系型数据库',level:3,why:'最常用数据库',studyTime:'5-7天',prerequisites:'无',goTutorial:'node'},
      { icon:'🍃',name:'MongoDB',desc:'NoSQL数据库',level:3,why:'灵活数据结构',studyTime:'3-5天',prerequisites:'无'},
      { icon:'🐳',name:'Docker',desc:'容器化部署',level:2,why:'环境一致性',studyTime:'3-5天',prerequisites:'Linux基础',goTutorial:'node'},
    ]},
  { icon:'🚀',name:'开发工具',desc:'效率必备工具',
    items:[
      { icon:'🔧',name:'VS Code',desc:'最流行编辑器',level:5,why:'免费/插件丰富',studyTime:'1天',prerequisites:'无',goTutorial:'internet'},
      { icon:'🐙',name:'Git',desc:'版本控制',level:5,why:'团队协作标配',studyTime:'2-3天',prerequisites:'无',goTutorial:'internet',
        links:[{icon:'📖',label:'Git教程',url:'https://git-scm.com/book/zh/v2'}]},
      { icon:'📋',name:'GitHub',desc:'代码托管',level:4,why:'最大代码社区',studyTime:'1天',prerequisites:'Git',goTutorial:'internet'},
      { icon:'🔍',name:'DevTools',desc:'浏览器调试',level:4,why:'调试/性能分析',studyTime:'1-2天',prerequisites:'HTML',goTutorial:'html'},
      { icon:'📦',name:'NPM',desc:'包管理器',level:4,why:'管理项目依赖',studyTime:'1天',prerequisites:'安装Node',goTutorial:'node'},
    ]},
]

const path = [
  {phase:'🌱 第1阶段',items:'HTML5 → CSS3 → JavaScript基础',time:'3-4周'},
  {phase:'🌿 第2阶段',items:'动画布局 → ES6+ → 练手项目',time:'2-3周'},
  {phase:'🌳 第3阶段',items:'Vue3+Vite → TypeScript → 中级项目',time:'3-4周'},
  {phase:'🌲 第4阶段',items:'Node.js+Express → MySQL → 全栈项目',time:'3-4周'},
  {phase:'🏆 第5阶段',items:'Git+Docker → CI/CD → 云部署',time:'2-3周'},
]

const faqs = reactive([
  {q:'零基础能学会吗？',a:'当然可以！本平台从零设计。HTML和CSS像搭积木，JS只需一点逻辑思维。关键是多动手练习。',open:false},
  {q:'学完要多久？',a:'每天2-3小时，约3-4个月到全栈水平。只学前端1-2个月够用。编程是马拉松，保持习惯最重要。',open:false},
  {q:'Vue还是React？',a:'国内Vue多、中文好；外企React更通用。两者核心相似，学一个再学另一个只需1-2周。推荐从Vue开始。',open:false},
  {q:'需要什么电脑？',a:'任何近3年电脑均可(Windows/Mac/Linux)，4G内存足够。VS Code在所有系统运行良好。',open:false},
  {q:'Node.js好学吗？',a:'前端学Node最自然——就是JavaScript！不需新语言。Express几行代码写API，全栈最友好入径。',open:false},
])
</script>

<style scoped>
.sp{max-width:var(--max-width);margin:0 auto;padding:0 24px 100px}
.st{font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:12px;font-weight:800}
.gt{background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ss{text-align:center;color:var(--text-secondary);max-width:600px;margin:0 auto 48px;font-size:1.1rem}
.sc{margin-bottom:56px}
.ch{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.cti{font-size:1.35rem;color:var(--primary);margin:0}
.cdd{color:var(--text-secondary);font-size:.9rem;margin:0;flex:1}
.ctg{font-size:.75rem;padding:2px 10px;background:var(--tag-bg);color:var(--primary);border-radius:20px}
.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.tc{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;cursor:pointer;transition:all .3s}
.tc:hover{border-color:var(--primary);box-shadow:var(--shadow)}
.tc.ex{border-color:var(--primary);box-shadow:var(--shadow-lg)}
.tch{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.tch h4{margin:0;font-size:1rem}
.ticon{font-size:1.8rem}
.tlv{display:flex;align-items:center;gap:3px;margin-top:2px}
.ld{width:7px;height:7px;border-radius:50%;background:var(--border)}
.ld.on{background:var(--primary)}
.ltx{font-size:.65rem;color:var(--text-secondary);margin-left:4px}
.tsd{font-size:.8rem;color:var(--text-secondary);margin:0}
.tde{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:.8rem}
.tde div{margin-bottom:5px}
.tde b{color:var(--primary)}
.tli{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;align-items:center}
.tlk{display:inline-flex;align-items:center;gap:3px;padding:6px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:.75rem;color:var(--primary);text-decoration:none;min-height:44px;min-width:44px}
.tlk:hover{border-color:var(--primary)}
.tlk-go{background:rgba(52,199,89,.15);border-color:var(--success);color:var(--success);font-weight:600}
.tlk-go:hover{background:rgba(52,199,89,.25)}
.tht{font-size:.7rem;color:var(--text-secondary);margin-top:8px;opacity:.5}
.lp{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px;margin-top:40px}
.lp h3{text-align:center;font-size:1.3rem;margin-bottom:28px}
.pf{display:flex;flex-direction:column;align-items:center;gap:2px}
.ps{text-align:center;max-width:360px}
.pb{width:32px;height:32px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;margin:0 auto 6px}
.pc{padding:10px}
.pc strong{color:var(--primary);display:block;margin-bottom:4px}
.pc p{font-size:.85rem;color:var(--text-secondary);margin:4px 0}
.pt{font-size:.75rem;color:var(--accent);font-weight:600}
.pa{font-size:1.4rem;color:var(--primary);margin:2px 0}
.fq{max-width:700px;margin:48px auto 0}
.fq h3{text-align:center;font-size:1.3rem;margin-bottom:24px}
.fi{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;cursor:pointer;transition:all .3s}
.fi:hover{border-color:var(--primary)}
.fqq{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;font-weight:600;font-size:.95rem}
.fa{font-size:.65rem;color:var(--text-secondary);transition:transform .3s}
.fa.on{transform:rotate(180deg)}
.faa{padding:0 20px 16px;color:var(--text-secondary);font-size:.9rem;line-height:1.8}

@media(max-width:640px){
  .sp{padding:0 16px 60px}
  .ss{font-size:.92rem;margin-bottom:32px}
  .tg{grid-template-columns:1fr;gap:10px}
  .tc{padding:16px}
  .lp{padding:20px;margin-top:28px}
  .fqq{padding:12px 16px;font-size:.88rem}
}
</style>
