// 章末测验 — 每门课程完成后的小测验
export interface QuizQuestion {
  q: string
  options: string[]
  answer: number  // 正确选项索引 (0-based)
  explain: string // 解释
}

export const quizData: Record<string, QuizQuestion[]> = {
  // HTML 入门 (h1-h4)
  'h4': [
    {q:'HTML 中 <!DOCTYPE html> 的作用是？',options:['声明文档类型为 HTML5','创建一个新标签','引入 CSS 文件','定义网页标题'],answer:0,explain:'<!DOCTYPE html> 告诉浏览器使用 HTML5 标准来渲染页面，必须放在第一行。'},
    {q:'哪个标签用于创建超链接？',options:['<link>','<a>','<href>','<url>'],answer:1,explain:'<a> 标签（anchor）用于创建超链接，href 属性指定目标地址。'},
    {q:'块级元素和行内元素的主要区别？',options:['没有区别','块级独占一行，行内不换行','行内更大','块级更小'],answer:1,explain:'块级元素（如 div、p）独占一行，宽度默认 100%。行内元素（如 span、a）不换行，宽度由内容决定。'},
  ],
  // HTML 中级 (h10-h14)
  'h14': [
    {q:'target="_blank" 应该搭配哪个安全属性？',options:['rel="noopener"','rel="nofollow"','rel="safe"','不需要搭配'],answer:0,explain:'rel="noopener" 防止新页面通过 window.opener 访问原页面，是重要的安全实践。'},
    {q:'<img> 标签的 alt 属性主要作用是？',options:['美化图片','无障碍访问+加载失败时的替代文字','设置图片大小','改变图片格式'],answer:1,explain:'alt 为屏幕阅读器提供图片描述，也在图片加载失败时显示替代文字。这是无障碍设计的核心要求。'},
    {q:'class 和 id 的主要区别？',options:['没有区别','class 可复用，id 唯一','id 可复用，class 唯一','class 只能用于 div'],answer:1,explain:'class 可以给多个元素使用（分类），id 在一个页面中必须唯一（标识）。CSS 用 .class 和 #id 选择。'},
  ],
  // CSS 入门 (c1-c5)
  'c5': [
    {q:'box-sizing: border-box 的作用？',options:['让边框变圆','padding 和 border 包含在 width 内','隐藏元素','改变背景颜色'],answer:1,explain:'border-box 让 width 包含 padding 和 border，更符合直觉。几乎所有现代项目的第一条 CSS 规则都是 *,*::before,*::after{box-sizing:border-box}。'},
    {q:'CSS 中选择器优先级最高的是？',options:['标签选择器','class 选择器','id 选择器','!important'],answer:3,explain:'!important 优先级最高但应尽量避免使用。正常优先级：!important > 内联 > id > class > 标签。'},
    {q:'margin 和 padding 的区别？',options:['没有区别','margin 是外边距，padding 是内边距','margin 是内边距，padding 是外边距','padding 不能设置负值'],answer:1,explain:'margin 控制元素外部的间距（元素与元素之间），padding 控制元素内部的间距（边框与内容之间）。'},
  ],
  // CSS Flexbox (c12-c13)
  'c13': [
    {q:'justify-content: center 作用于哪个方向？',options:['垂直方向','主轴方向','交叉轴方向','Z轴方向'],answer:1,explain:'justify-content 沿主轴（flex-direction 定义的方向，默认水平）对齐。align-items 沿交叉轴对齐。'},
    {q:'flex: 1 等价于？',options:['flex-grow: 1','flex: 1 1 0%','flex-shrink: 1','以上都不对'],answer:1,explain:'flex: 1 是 flex-grow: 1; flex-shrink: 1; flex-basis: 0% 的简写。'},
  ],
  // CSS Grid (c14-c15)
  'c15': [
    {q:'repeat(3, 1fr) 的含义？',options:['创建 3 行','创建 3 列，每列等宽','重复 3 次','创建 1 行 3 列'],answer:1,explain:'fr 是 Grid 的弹性单位。repeat(3, 1fr) 创建 3 列（或行），每列均分剩余空间。'},
    {q:'grid-template-areas 的主要优势？',options:['运行更快','可视化布局，直观易懂','自动响应式','不需要写 CSS'],answer:1,explain:'grid-template-areas 让你用 ASCII 字符"画"出布局，非常直观。配合 @media 可以轻松实现响应式。'},
  ],
  // JS 入门 (j1-j5)
  'j5': [
    {q:'let、const、var 的主要区别？',options:['没有区别','let/const 有块级作用域，var 没有','var 是新的，let 是旧的','const 可以重新赋值'],answer:1,explain:'let 和 const 有块级作用域（{}内有效），var 只有函数作用域。const 声明常量不能重新赋值。现代 JS 推荐用 const 默认，需要修改时用 let。'},
    {q:'=== 和 == 的区别？',options:['没有区别','=== 比较值和类型，== 会类型转换','== 更严格','=== 只能比较数字'],answer:1,explain:'=== 是严格相等（值和类型都相同），== 会先做类型转换再比较。推荐始终使用 ===。'},
    {q:'typeof null 的结果是什么？',options:['"null"','"object"','"undefined"','"boolean"'],answer:1,explain:'typeof null 返回 "object" 是 JavaScript 的一个历史遗留 bug。记忆方法：用 === null 来判断是不是 null。'},
  ],
  // JS 中级 (j14-j20)
  'j20': [
    {q:'map() 和 forEach() 的区别？',options:['没有区别','map() 返回新数组，forEach() 不返回','forEach() 更快','map() 只能用于数字'],answer:1,explain:'map() 对每个元素执行函数并返回新数组，适合数据转换。forEach() 只遍历不返回，适合执行副作用。'},
    {q:'什么是闭包 (Closure)？',options:['一个代码块','函数"记住"其创建时的作用域','关闭浏览器','一种 CSS 属性'],answer:1,explain:'闭包是 JS 最强大的特性之一：函数可以访问其外部作用域的变量，即使外部函数已经执行完毕。'},
    {q:'解构赋值的好处？',options:['让代码变慢','从对象/数组中提取值的简洁语法','必须使用','只能用于数组'],answer:1,explain:'解构赋值（const {name, age} = user）让代码更简洁可读，是现代 JS 最常用的语法之一。'},
  ],
  // JS Promise (j25-j26)
  'j26': [
    {q:'Promise 的三种状态？',options:['开始/进行/结束','pending/fulfilled/rejected','等待/运行/完成','open/close/error'],answer:1,explain:'Promise 有三种状态：pending（进行中）、fulfilled（成功）、rejected（失败）。一旦状态改变，不可逆转。'},
    {q:'async/await 相比 .then() 的优势？',options:['更快','代码像同步写法，更易读','不需要错误处理','只能用于 fetch'],answer:1,explain:'async/await 让异步代码看起来像同步代码，大幅提升可读性。但底层仍然是 Promise。'},
  ],
  // Vue 入门 (v1-v3)
  'v3': [
    {q:'Vue 的响应式是什么意思？',options:['页面会自动刷新','数据变化→视图自动更新','组件会自动创建','不需要写 HTML'],answer:1,explain:'Vue 的响应式系统自动追踪数据变化，当数据改变时，使用该数据的视图会自动更新，不需要手动操作 DOM。'},
    {q:'v-if 和 v-show 的区别？',options:['没有区别','v-if 移除DOM元素，v-show 用CSS隐藏','v-show 更快','v-if 不能用于组件'],answer:1,explain:'v-if 会销毁和重建元素（切换开销大），v-show 只是切换 display（初始渲染开销大）。频繁切换用 v-show，条件很少改变用 v-if。'},
  ],
  // React 入门 (r1-r4)
  'r4': [
    {q:'React 组件必须遵循的规则？',options:['必须以大写字母开头','必须以小写字母开头','必须是 class','不能返回 JSX'],answer:0,explain:'React 组件名必须以大写字母开头，这样 JSX 才能区分原生 HTML 标签和自定义组件。'},
    {q:'为什么要给列表的每个项设置 key？',options:['为了好看','React 用 key 追踪元素变化，提升性能','key 是可选的','用于 CSS 选择'],answer:1,explain:'key 帮助 React 识别哪些元素改变了（增/删/改），从而高效更新 DOM。key 应该用唯一且稳定的值（如 id），不要用数组索引。'},
  ],
  // TypeScript (t1-t5)
  't5': [
    {q:'TypeScript 的主要优势？',options:['运行更快','编译时类型检查，提前发现错误','不需要写 JS','自动生成文档'],answer:1,explain:'TS 在编译阶段检查类型错误，能在代码运行前就发现大量 bug。对大型项目尤其有价值。'},
    {q:'interface 和 type 的区别？',options:['完全一样','interface 可以 extends，type 可以做联合类型','type 更强大','interface 已废弃'],answer:1,explain:'interface 适合定义对象形状（可被 extends 扩展），type 可以做联合类型和更复杂的类型操作。大部分场景可以互换。'},
  ],
  // Node.js (n1-n5)
  'n5': [
    {q:'Node.js 的模块系统是？',options:['AMD','CommonJS (require) 或 ES Modules (import)','UMD','SystemJS'],answer:1,explain:'Node.js 支持 CommonJS (require/module.exports) 和 ES Modules (import/export)。现代项目推荐使用 ES Modules。'},
    {q:'Express 中间件的执行顺序？',options:['随机','按 app.use() 的注册顺序从上到下','按字母顺序','按请求类型'],answer:1,explain:'中间件按注册顺序依次执行。常用的顺序：静态文件 → 解析 body → 路由 → 错误处理。'},
  ],
  // 数据库 (db1-db3)
  'db3': [
    {q:'SQL 和 NoSQL 的主要区别？',options:['没有区别','SQL 有固定 Schema，NoSQL 灵活','SQL 更快','NoSQL 不能查询'],answer:1,explain:'SQL（关系型）需要预定义表结构，适合强一致性场景。NoSQL（文档/键值等）Schema 灵活，适合快速迭代。'},
    {q:'Redis 适合什么场景？',options:['存储大文件','缓存/排行榜/会话存储','替代 MySQL','前端渲染'],answer:1,explain:'Redis 是内存数据库，速度极快，适合做缓存（热点数据）、排行榜（Sorted Set）、会话存储、消息队列等。'},
  ],
}
