# LwyJr 项目规范 — Apple 设计主管

## 角色
Apple 顶尖产品主管 + 技术主管。面向全球小白用户。
对比 W3Schools/MDN/freeCodeCamp 做最优教程体验。

## 动画铁律
- 每个交互有动画: hover/click/切换/弹窗/滚动/页面加载
- Spring: `cubic-bezier(.34,1.56,.64,1)` | Smooth: `cubic-bezier(.16,1,.3,1)`
- 按钮: `:active{scale(.96)}` 全局 | 聚焦: `0 0 0 3px rgba(0,113,227,.15)`
- **Transition 必须非 scoped** (Vue 动态类无 data-v-xxx)
- **禁用 router `<Transition>`**: 路由切换用各页面 `page-in` CSS animation + IntersectionObserver

## DeskLamp 台灯主题切换 (DeskLamp.vue)

### 设计理念
- Pixar 风格桌面台灯，替代旧 `button.theme-toggle`
- 位于 NavBar `.nav-actions` 区域 (60×60px 可点击区)
- **隐喻**: 拉灯绳 = 开关灯 = 切换网站明暗主题
- **物理感**: 灯绳有弹性回弹、灯泡有呼吸脉动、光锥有真实的放射形态

### Canvas 渲染 (330×330, CSS scale(0.5) → 视觉 165×165)
- **Canvas 尺寸**: `CW=330, CH=330` — 四周留出 30px+ 余量，防止珠子被截取
- **台灯内移**: `LOX=120, LOY=64`（灯体左上角偏移）
- **灯体尺寸**: `LW=72, LH=140`
- **灯中心**: `LCX=156, SHADE_T=84, SHADE_B=128`
- **线锚点**: `WIRE_SX=161, WIRE_SY=130`
- **珠子静止位**: `BEAD_RX=161, BEAD_RY=160`
- **CSS 定位**: `position:fixed; top:-29px; right:15px; transform:scale(0.5); transform-origin:top right; z-index:99999`
- **视觉位置不变**: top/right 偏移量配合 canvas 内部偏移，灯泡视觉坐标与旧版完全一致
- **Teleport to body**: 通过 `<Teleport to="body">` 渲染，避免 NavBar overflow 裁剪

### 四层光效 (Teleported to body)

| z-index | 层 | 用途 |
|---------|-----|------|
| 1 | `.dark-curtain` | **关灯暗场**: 从灯泡位置向外径向变暗，四角保留微光 |
| 2 | `.light-cone` | **光锥**: `clip-path: circle()` 从灯泡放射扩散/回缩 |
| 3 | `.ambient-fill` | **环境填充**: 暖色调房间光晕，延迟于光锥淡入 |
| 1001 | `.toggle-flash` | **切换闪光**: 开关瞬间 0.35s 白闪，中心亮 → 扩散消失 |

### 灯光动画时序

**开灯** (dark → light):
```
0ms     flashing = true → flashBang 开始
120ms   store.toggleTheme() → 主题切换
300ms   flashing = false
0ms     spreading = true → coneBlossom: circle(8px)→circle(200vmax), 0.9s
250ms   ambient-fill fading-in → opacity 1 (0.5s, 延迟 0.25s)
1000ms  spreading = false
```

**关灯** (light → dark):
```
0ms     flashing = true → flashBang 0.35s
0ms     retracting = true → coneWilt: circle(200vmax)→circle(4px), 0.4s
0ms     ambient-fill fading-out → opacity 0 (0.3s)
350ms   store.toggleTheme() → 主题切换
350ms   retracting = false
600ms   dark-curtain.is-off → opacity 1 (暗场 0.6s fade in)
```

### 拉绳交互
- `mousedown` / `touchstart` → 记录 grabY，hitTest 判断是否在珠子区域
- `mousemove` / `touchmove` → `pullX/pullY = clamp(delta, -MAX_PULL, MAX_PULL)` (MAX_PULL=65 → canvas ±130px)
- 超过 **20px** 阈值 → `triggered=true` + `navigator.vibrate(15)` + bead 抖动
- `mouseup` / `touchend` → 弹簧回弹 (`requestAnimationFrame` 动画循环 + spring 插值)
- 超过阈值 → `fire()` 主题切换
- **回退**: 点击灯体任意位置同样触发
- **四方向不截取**: Canvas 330×330 确保 bead 在任何拖拽方向都有 30px+ 余量

### 位置追踪
- `trackBulbPosition()` → `getBoundingClientRect()` → `bx/by` ref
- 灯泡屏幕坐标: `bx = r.right - (LCX+5)*0.5`, `by = r.top + (SHADE_B+10)*0.5`
- 监听: `resize` + `scroll` (passive)
- 所有光效层通过 `--bx` `--by` CSS 变量定位放射中心

### CSS 变量
- `--bx`: 灯泡屏幕 X 坐标
- `--bt`: 灯泡屏幕 Y 坐标 (注意: 代码中 `bx/by` ref 对应 `--bx/--by` CSS 变量)
- 设置到 overlay div 的 `:style`，Teleported 元素直接使用

### 禁止事项
- **禁止回退到旧的 theme-toggle 按钮**
- **禁止四层光效中任何一层缺失或顺序错乱**
- **禁止 reduced-motion 下保留动画**: 直接切换状态无过渡

## FloatingChatBot 浮动机器人 (FloatingChatBot.vue)

### 设计理念
- 全局浮动聊天组件，位于页面右下角
- 在 `App.vue` 中渲染（`FooterSection` 之后），所有页面均可见
- `position: fixed; bottom: 28px; right: 28px; z-index: 100000`

### 组件结构
- **触发按钮**: `.chatbot-trigger` — 56×56 蓝色圆形按钮，hover 放大 + 阴影增强
- **聊天窗口**: `.chatbot-window` — 打开时展开，Transition 果冻入场
- **多 Agent 切换**: 下拉选择器，4 个 AI 助手角色
- **Markdown 渲染**: `marked` v18+ + `highlight.js` 代码高亮
- **代码复制**: `code-copy-btn` 内嵌在 markdown 渲染的代码块中

### 四个 AI 助手角色
| ID | 名称 | 角色 | 系统提示词重点 |
|----|------|------|---------------|
| gpt4 | GLM-4 Flash | 通用AI助手 | 前端开发教学，适合零基础 |
| claude | 创意写手 | 文案与写作 | 文案策划、内容创作 |
| gemini | 全栈导师 | 前后端开发 | Vue/React/TypeScript/Node.js |
| copilot | 代码搭子 | 实时写代码 | 直接给代码，TypeScript |

### API 配置
- 端点: `/api/chat`（Node 代理 → `open.bigmodel.cn/api/paas/v4/chat/completions`）
- 模型: `glm-4-flash`
- API Key: 服务端 `.env.local` 的 `AI_API_KEY`（无 `VITE_` 前缀，不暴露到浏览器）
- 请求安全: 请求体 base64 编码，SSE 流式响应通过 Node 代理透传

### 状态管理
- `isOpen` / `showSelector` / `selectedAgentId` / `inputText` / `messages` / `isLoading`
- 对话历史持久化: `localStorage` key = `lwybot_history`
- 切换 Agent 时清空历史 + 显示新 Agent 问候语

### 禁止事项
- **禁止移出 App.vue**: 必须全局渲染，不可放回 HomeView 等单页面
- **禁止降低 z-index**: 必须高于所有页面内容 (100000)
- **禁止删除 Agent 切换功能**: 4 个助手角色必须保留

## WebGL 背景规范 (WebGLBackground.vue)
- 原生 WebGL 片段着色器，无外部依赖
- 4 个流动光晕球体: 品牌色蓝(`#0071e3`) / 紫(`#5856d6`) / 粉(`#ff375f`) / 绿(`#34c759`)
- 鼠标交互: `u_mouse` uniform → 光晕随光标微移
- 暗色模式: `u_dark` uniform 控制透明度 (`0.15` light / `0.28` dark)
- 分形噪声纹理: 4 层 FBM (Fractional Brownian Motion) 叠加
- DPR 适配: `Math.min(window.devicePixelRatio, 2)` 防止高分屏性能问题
- 生命周期: `onUnmounted` 清理 `cancelAnimationFrame` + `deleteProgram` + `deleteBuffer` + remove listeners
- **禁止回退到原 Canvas 粒子背景** (50点+连线方案已废弃)

## 3D 视差倾斜规范 (use3DTilt)
- Apple TV 卡片风格: 鼠标悬停时卡片跟随鼠标位置倾斜
- `requestAnimationFrame` 节流 → `perspective(${p}px) rotateX/Y scale3d`
- 鼠标移出: 平滑回弹至 `rotateX(0) rotateY(0) scale3d(1,1,1)`
- 配置参数: `maxTilt`(默认8°) `perspective`(默认800px) `scale`(默认1.02) `speed`(默认400ms)
- 过渡曲线: `cubic-bezier(.16,1,.3,1)` — 复用 smooth spring
- **必须应用的页面**: HomeView(`.feature-card, .preview-card`)、GalleryView(`.gallery-card`)、RoadmapView(`.roadmap-card`)
- **禁止直接操作 transform 覆盖 3D tilt**: 其他样式通过 margin/padding/opacity 实现，避免冲突

## 鼠标聚光灯规范 (SpotlightWrapper.vue)
- 通过 `<slot>` 包裹任意 Hero/首屏区域
- 径向渐变: `radial-gradient(600px circle at X Y, rgba(0,113,227,.08), rgba(88,86,214,.04) 30%, transparent 70%)`
- `lerp` 平滑插值（因子 0.08）实现惯性跟随
- `requestAnimationFrame` 循环驱动，`pointer-events: none` 不阻挡交互
- 当前应用: HomeView Hero 区域

## 滚动进度条规范 (useScrollProgress)
- 页面顶部 3px 渐变条（`var(--gradient-brand)`）
- `transform: scaleX(progress)` 驱动 — GPU 加速，避免 layout thrashing
- `requestAnimationFrame` + `ticking` 标志防抖
- z-index: 1001（高于 NavBar 1000）
- 样式: `.scroll-progress-bar` 在 App.vue 非 scoped `<style>` 中定义

## 页面动画体系
| 场景 | 方式 | 动画 |
|------|------|------|
| 页面加载 | 根元素 `class="page-in"` | fadeIn + slideUp 12px .4s |
| 路由切换 | `<Suspense>` + shimmer 骨架屏 | 骨架屏闪烁 → 新页面 `page-in` |
| 章节切换 | `:key` + `chapter-enter` animation | fadeIn + slideUp 10px .4s |
| 卡片滚动 | `IntersectionObserver` + `reveal-up` | translateY(48px)→0, stagger 70ms |
| 交错揭示 | `IntersectionObserver` + `reveal-stagger` + `reveal-stagger-item` | 子元素 60ms 间隔依次 reveal |
| 侧边栏点击 | `scrollIntoView({behavior:'smooth'})` | 内容区滚动到顶部 |
| 弹窗 | 非 scoped `<style>` Transition sheet | iOS26 果冻 .5s 入场 / .3s 回弹出场 |
| 弹窗关闭 | ESC / 遮罩点击 / 关闭按钮 | body scroll lock 恢复 |
| 3D 卡片倾斜 | `requestAnimationFrame` + `perspective/rotateX/Y/scale3d` | 鼠标位置驱动倾斜 / 移出回弹 |
| 聚光灯 | `requestAnimationFrame` + `radial-gradient` + `lerp` | 鼠标惯性跟随光晕 |
| 滚动进度 | `requestAnimationFrame` + `transform:scaleX` | GPU 加速进度条 |
| WebGL 背景 | `requestAnimationFrame` + GLSL 着色器 | 4x流动光晕 + 噪声纹理 |
| 台灯拉绳 | 拖动 `deltaX/Y` + RAF spring 回弹 + 阈值触发 | 四方向不截取 + 弹簧开关灯 + 暖光扩散/回缩 + 灯泡脉动 |
| 磁吸光标 | `mouseenter/mousemove/mouseleave` + `translate3d` | 按钮跟随光标微移 4-8px |
| reduced-motion | `@media (prefers-reduced-motion)` + `useReducedMotion` | 禁用所有动画/过渡，内容直接可见 |

## 路由过渡规范
- 路由视图由 `<Suspense>` 包裹 → 切换时展示 **shimmer 骨架屏**（非空白加载）
- 骨架屏结构: `.page-skeleton` > `.skeleton-hero`(280px) + `.skeleton-grid`(6个`.skeleton-card` 180px)
- shimmer keyframes: `background-position` 200% → -200%
- 骨架屏卡片按 `animation-delay: calc(var(--i) * 100ms)` 依次闪烁
- **智能预加载**: NavBar 链接通过 `data-prefetch` 属性 + `IntersectionObserver`（rootMargin:200px）预取即将访问的路由组件

## 弹窗规范 (PropModal)
- 入场: `.5s cubic-bezier(.34,1.56,.64,1)` — container `scale(.88)→1` + `translateY(100%)→0`
- 关闭: `.3s cubic-bezier(.68,-.3,.32,1.3)` — container `scale(1)→.8` + `translateY→80%`
- 结构: Teleport to body → Transition name="sheet" → v-if
- 交互: ESC关闭 / 遮罩关闭 / body overflow hidden
- `.sheet-container` 默认 `transition:transform .5s...,opacity .5s...`

## 全属性弹窗
- 每个 TutorialStep `propRef` → `props-reference.json` (86条目)
- `344/344 = 100%` propRef 覆盖率
- **教程正文不得内嵌速查表/参考卡片** — 属性查询走弹窗
- 中文引号用「」不用 ASCII `"`（防 JSON 解析错误）

## 间距规范
- 页面: `padding-top: var(--nav-height)` **禁止 +40px**
- 教程页: `.sp{padding:0 24px 100px}`

## 色彩 (Apple 色板)
| 角色 | 值 |
|------|-----|
| 主色 | #0071e3 |
| 辅色 | #5856d6 |
| 强调 | #ff375f |
| 成功 | #34c759 |
| 警告 | #ff9f0a |
| 亮底 | #ffffff |
| 暗底 | #000 |
| 文字 | #1d1d1f / #86868b |

## 主题自适应设计系统 (Theme-Adaptive Design)

### 核心变量体系
所有动画效果、光晕、渐变、边框均通过 CSS 变量在亮/暗主题间自适应切换，切换时带 `transition .5s var(--spring-smooth)` 平滑过渡。

### 亮色主题特有色调
| 变量 | 值 | 用途 |
|------|-----|------|
| `--gradient-text` | `linear-gradient(135deg,#0071e3,#5856d6)` | 标题渐变 |
| `--gradient-hero` | `linear-gradient(135deg,#0071e3,#5856d6,#0071e3)` | Hero 区域渐变 |
| `--glow-primary` | `rgba(0,113,227,.18)` | 卡片/按钮光晕 |
| `--glow-primary-strong` | `rgba(0,113,227,.3)` | hover 强光晕 |
| `--glow-secondary` | `rgba(88,86,214,.12)` | feature card 二级光晕 |
| `--hero-badge-bg` | `rgba(0,113,227,.08)` | Hero badge 背景 |
| `--hero-badge-text` | `#0071e3` | Hero badge 文字 |
| `--stat-number-color` | `#0071e3` | 统计数字颜色 |
| `--shape-opacity` | `.06` | 浮动形状透明度 |
| `--tag-bg` | `rgba(0,113,227,.08)` | 标签背景 |
| `--selection-bg` | `rgba(0,113,227,.18)` | 选中文字背景 |
| `--focus-ring` | `rgba(0,113,227,.5)` | 键盘聚焦环 |
| `--nav-scrolled-shadow` | `0 2px 24px rgba(0,0,0,.06)` | 导航栏滚动阴影 |
| `--card-shine-bg-hover` | `rgba(255,255,255,.08)` | 卡片光泽效果 |
| `--code-bg` | `#f0f0f5` | 代码编辑器背景 |
| `--code-text` | `#1d1d1f` | 代码编辑器文字 |
| `--code-border` | `rgba(0,0,0,.06)` | 代码面板边框 |
| `--code-header-bg` | `rgba(0,0,0,.04)` | 代码面板标题栏背景 |
| `--code-header-text` | `#86868b` | 代码面板标题文字 |
| `--preview-bg` | `#ffffff` | 预览 iframe / 模态面板背景 |
| `--preview-header-text` | `#86868b` | 预览面板标题文字 |
| `--preview-border` | `rgba(0,0,0,.06)` | 预览面板边框 |
| `--modal-overlay-bg` | `rgba(0,0,0,.3)` | 弹窗遮罩背景 |
| `--modal-close-bg` | `rgba(0,0,0,.06)` | 弹窗关闭按钮背景 |
| `--roadmap-dot-border` | `#fff` | 路线图圆点边框 |

### 暗色主题特有色调
| 变量 | 值 | 用途 |
|------|-----|------|
| `--gradient-text` | `linear-gradient(135deg,#2997ff,#bf5af2)` | 标题渐变 (更亮蓝→紫) |
| `--gradient-hero` | `linear-gradient(135deg,#2997ff,#bf5af2,#64d2ff)` | Hero 三色渐变 |
| `--glow-primary` | `rgba(41,151,255,.28)` | 光晕增强 (暗底需要更强) |
| `--glow-primary-strong` | `rgba(41,151,255,.45)` | hover 强光晕增强 |
| `--glow-secondary` | `rgba(191,90,242,.18)` | 二级光晕偏紫 |
| `--hero-badge-bg` | `rgba(41,151,255,.14)` | Badge 背景加深 |
| `--hero-badge-text` | `#2997ff` | Badge 文字变亮 |
| `--stat-number-color` | `#2997ff` | 统计数字变亮 |
| `--shape-opacity` | `.1` | 浮动形状更明显 |
| `--tag-bg` | `rgba(41,151,255,.14)` | 标签背景加深 |
| `--selection-bg` | `rgba(41,151,255,.3)` | 选中背景加深 |
| `--focus-ring` | `rgba(41,151,255,.6)` | 聚焦环更亮 |
| `--nav-scrolled-shadow` | `0 2px 24px rgba(0,0,0,.5)` | 导航阴影更深 |
| `--card-shine-bg-hover` | `rgba(255,255,255,.07)` | 卡片光泽更柔和 |
| `--code-bg` | `#1c1c1e` | 代码编辑器背景 (深色) |
| `--code-text` | `#e5e5ea` | 代码编辑器文字 |
| `--code-border` | `rgba(255,255,255,.06)` | 代码面板边框 |
| `--code-header-bg` | `rgba(0,0,0,.3)` | 代码面板标题栏背景 |
| `--code-header-text` | `#a1a1a6` | 代码面板标题文字 |
| `--preview-bg` | `#0a0a1e` | 预览 iframe / 模态面板背景 |
| `--preview-header-text` | `#8892b0` | 预览面板标题文字 |
| `--preview-border` | `rgba(255,255,255,.06)` | 预览面板边框 |
| `--modal-overlay-bg` | `rgba(0,0,0,.5)` | 弹窗遮罩更深 |
| `--modal-close-bg` | `rgba(255,255,255,.1)` | 弹窗关闭按钮背景 |
| `--roadmap-dot-border` | `#1c1c1e` | 路线图圆点边框 |

### 主题切换平滑过渡
- `body`: `background` 和 `color` 有 `transition .35s var(--spring-smooth)`
- `.gradient-text`: 渐变背景有 `.5s` 过渡
- `.hero-badge`: 背景和文字有 `.5s` 过渡
- `.stat-number`: 颜色有 `.5s` 过渡
- `.tag`: 背景有 `.5s` 过渡
- `.floating-shape`: 透明度有 `.8s` 过渡
- `.scroll-progress-bar`: 渐变有 `.5s` 过渡
- 所有 `--bg-card`, `--border`, `--shadow-*` 变量自动继承过渡
- `.card`: 背景和边框有 `.35s` 过渡
- `.modal-overlay`: 背景有过渡
- `.roadmap-dot`: 边框有过渡

### 代码编辑器/预览面板主题自适应规则
- 代码编辑器面板 (`.cp`, `.pg-editor`, `.code-textarea`) 使用 `--code-bg` / `--code-text` / `--code-border` 变量
- 代码面板标题栏使用 `--code-header-bg` / `--code-header-text` 变量
- macOS 红黄绿圆点使用 `--code-dot-red` / `--code-dot-yellow` / `--code-dot-green` 变量
- 预览 iframe 面板使用 `--preview-bg` 变量
- 弹窗预览面板标题使用 `--preview-header-text` / `--preview-border` 变量
- **Node.js 终端面板例外**: `.ncode-pre`(GitHub 暗色终端) 和 `.noutput` 保持固定深色背景，不随主题变化
- **代码块 (ChatBot markdown)**: `.code-block` 保持 `#0d1117` 深色背景（GitHub 风格，不随主题变化）

### 禁止事项
- **禁止硬编码 rgba 光晕/阴影颜色** — 必须用 `--glow-*` / `--shadow-*` 变量
- **禁止暗色主题使用亮色主题的蓝色** — 暗色主题主色必须用 `#2997ff` 系列更亮的蓝
- **禁止省略 transition** — 主题切换时所有颜色变化必须有平滑过渡

## 字体
系统: `-apple-system,'SF Pro Display','PingFang SC'` | 代码: `'SF Mono','Fira Code'`
标题 700-900 letter-spacing:-.02em | 正文 line-height:1.7

## 性能优化铁律

### 构建分包策略 (vite.config.ts)
- **Vendor chunk**: Vue/Pinia/Vue-Router → 独立 `vendor` hash chunk (命中浏览器缓存)
- **Three.js chunk**: `node_modules/three` → 独立 `three` chunk (非首屏按需)
- **数据分片**:
  - `props-reference` (233KB) → `data-props`
  - `animations` (71KB) → `data-animations`
  - `tutorials.ts` 聚合入口 → `data-tutorials-index`
  - 各 JSON 教程文件 → `tutorials` chunk
- **构建目标**: `es2020` (减少 polyfill 体积)
- **chunk size warning**: 500KB 阈值（原 2000KB 过大）

### 运行时优化
- `.below-fold`: `content-visibility: auto; contain-intrinsic-size: 0 400px` — 跳过视口外内容渲染
- `scroll-progress-bar`: `transform: scaleX()` 替代 `width`，GPU 加速
- WebGL 背景: `devicePixelRatio` 上限 2 + **Page Visibility API 暂停**，防止 Tab 不可见时浪费 GPU
- 3D tilt: `requestAnimationFrame` 节流 + `cancelAnimationFrame` 清理
- 路由预加载: **IntersectionObserver + `data-prefetch` 智能预取**（仅预取即将访问的页面）
- SplineScene: **`defineAsyncComponent` 懒加载**，首屏不加载 3D 模型
- 教程代码: **`initStepCodes` 按需初始化**，仅构建当前选中课程的代码

### 依赖管理
- **gasp / prismjs / splitpanes**: 已从 package.json 移除（代码中 0 引用，增加 npm install 耗时）
- **three**: 保留（animations.ts 动画代码字符串中通过 CDN importmap 引用）
- **禁止添加未使用的 npm 依赖** — 安装前确认代码中有 `import` 语句

## 玻璃态
`backdrop-filter:saturate(180%) blur(20px)` — 导航/卡片/弹窗

## Apple 无障碍铁律 (HIG Accessibility)

### 主题自动检测
- **初始化**: `index.html` 内联 `<script>` 在 Vue 挂载前设置 `data-theme` (防闪烁)
- **优先级**: localStorage `lwyjr-theme-preference` > `prefers-color-scheme` > 默认 light
- **动态跟随**: `main.ts` 中监听 `matchMedia('(prefers-color-scheme: dark)').change` — 仅当用户未手动设置时
- **持久化**: `store.toggleTheme()` → `localStorage.setItem('lwyjr-theme-preference', theme)`
- **系统集成**: `color-scheme: light dark` 让原生控件/滚动条匹配主题
- **CSS 回退**: `@media (prefers-color-scheme: dark) { :root:not([data-theme]) }` 处理 JS 未加载场景

### reduced-motion 尊重系统设置
- **CSS 覆盖**: `@media (prefers-reduced-motion: reduce)` — 禁用所有 animation/transition、强制 `scroll-behavior: auto`
- **滚动揭示**: 在 reduced 模式下强制 `opacity:1; transform:none` 让所有内容可见
- **WebGL 背景**: 保留但降低透明度 (`opacity: 0.12`)
- **Composable** (`useReducedMotion.ts`): 提供 `prefersReducedMotion` ref 用于 JS 侧判断

### 键盘导航
- **Skip-link**: `.skip-link` — Tab 键跳转到 `#main-content` (z-index 10000)
- **Focus-visible**: 仅键盘导航时显示 3px 蓝色光环 (`outline: 3px solid rgba(0,113,227,.5)`)
- **鼠标点击**: `:focus:not(:focus-visible) { outline: none }` 无丑陋轮廓
- **移动端菜单**: Escape 键关闭 `menuOpen = false`
- **NavBar**: `role="navigation"` + `role="menubar"` + `role="menuitem"` + `aria-expanded`

### ARIA 语义
- NavBar: `aria-label="主导航"`, `aria-expanded` 控制菜单状态
- 暗色按钮: `aria-label="切换到亮色主题"` / `"切换到暗色主题"`
- 移动菜单按钮: `aria-expanded` + `aria-label` 动态切换
- 路由: `<main id="main-content" tabindex="-1">` 可聚焦
- ErrorBoundary: `role="alert" aria-live="assertive"` 屏幕阅读器即时读取

### 错误边界
- `ErrorBoundary.vue`: `onErrorCaptured` 捕获子组件错误
- 展示优雅回退 UI (图标 + 标题 + 重试按钮)
- 防止单个页面崩溃影响全局

### HTML Head 元标签
- `theme-color` light/dark: 浏览器工具栏着色匹配主题
- `apple-mobile-web-app-capable`: PWA 全屏模式
- `viewport-fit=cover`: 刘海屏安全区域
- `description` meta: SEO 描述
- **必须保留这些 meta tag**

## 可用 CSS 动画类 (animations.css)
| 类名 | 效果 |
|------|------|
| `.spring-in` `.spring-up` | Spring 弹入 |
| `.reveal-up` + `.revealed` | Scroll reveal (配合 IntersectionObserver) |
| `.reveal-stagger` + `.reveal-stagger-item` | 父元素进视口后子元素依次入场 (60ms 间隔 × 8) |
| `.page-in` | 页面入场 fade-slide |
| `.stagger` | 子元素依次入场 |
| `.hover-lift` `.hover-glow` `.hover-scale` | hover 反馈 |
| `.card-shine` | hover 光扫效果 |
| `.underline-reveal` | 下划线展开 |
| `.pressable` | 按压反馈 |
| `.slide-up` `.fade-in` | 简单入场 |
| `.scroll-fade-in` `.scroll-slide-up` | 原生 scroll-driven 动画 (`animation-timeline:view()`, 渐进增强) |
| `.below-fold` | 视口外 `content-visibility:auto` 性能优化 |
| `.animate-bounce-in` | 弹窗果冻入场 |

## CSS 兼容类（不可删）
`.section-padding` `.section-title` `.section-subtitle` `.modal-overlay` `.btn`
`.btn-primary` `.btn-outline` `.btn-glow` `.gallery-card` `.filter-btn`
`.gallery-filters` `.gallery-grid` `.roadmap-container` `.roadmap-line`
`.roadmap-step` `.roadmap-dot` `.roadmap-card` `.code-block` `.phase-legend`
`.card-icon` `.card-title` `.card-desc` `.card-tags` `.tag` `.tag-category`
`.tag-difficulty` `.playground-container` `.tech-container` `.tech-card` `.tech-icon`

## 文件结构（不可删除）
```
CLAUDE.md
index.html
package.json
vite.config.ts          ← 包含 AI 代理 + Source Guard Vite plugin
ai-proxy.mjs            ← 独立 Node 代理服务器（生产模式）
.env.local              ← AI_API_KEY（不提交到 git）
src/main.ts
src/data/{tutorials.ts, h/c/j/t/r/v/i/d/z/p-tutorials.json, node-*.json, props-reference.json, roadmap.ts, animations.ts, splash-presets.ts}
src/utils/sanitize.ts
src/monaco-env.ts
src/components/{NavBar.vue, FooterSection.vue, PropModal.vue, WebGLBackground.vue, SpotlightWrapper.vue, DeskLamp.vue, SplashScreen.vue, CountUp.vue, ErrorBoundary.vue, FloatingChatBot.vue, SplineScene.vue, SearchModal.vue, CodeEditor.vue}
src/views/{HomeView, TutorialView, GalleryView, RoadmapView, PlaygroundView, TechStackView, NotFoundView}.vue
src/composables/{useScrollReveal.ts, use3DTilt.ts, useScrollProgress.ts, useReducedMotion.ts, useMagneticCursor.ts, useRobotMind.ts}
src/styles/{main.css, animations.css}
```
- **node-a.json** → node-e.json: Node.js 教程 35章, 拆为5个文件 (每个≤50KB)
- **t-tutorials.json**: TypeScript 教程 10章 (TS/JS 对比式教学)
- **r-tutorials.json**: React 教程 8章 (React.createElement 无 JSX 编译器)
- **i-tutorials.json**: Vite 教程 8章 (<b>终端风格</b>, 和 Node 一样不跑 iframe)
- 拆分原因: 单文件 207KB 会导致 Vite Vue SFC 编译器解析失败

## TutorialView 代码面板规范

### 分类渲染逻辑
| 条件 | 面板类型 | 布局 |
|------|---------|------|
| 非 Node + 非大纲 | 标准面板 | 左编辑器 + 右 iframe + ▶运行 |
| 非 Node + 大纲 | 大纲面板 | 无编辑器 + 无运行按钮 + 📑课程大纲预览 |
| Node + 非大纲 | 终端面板 | 🖥️终端 + iframe + ▶运行 |
| Node + 实战步骤 | 终端面板 | 🖥️终端 + 📋复制代码 + ▶运行 |

### 大纲章节 ID（固定，不可删改）
```
h0  → HTML 完全学习大纲
c25 → CSS 完整学习大纲
j33 → JavaScript 完整学习大纲
v0  → Vue3 完整学习大纲
n0  → Node.js 完全学习大纲（无 code 字段）
```
规则: `overviewIds = new Set(['h0','c25','j33','v0','n0'])` — 大纲章节:
- **无编辑器** (textarea 隐藏)
- **无 ▶运行按钮** (只需静态 iframe 预览)
- **类名**: `.ov-cp` `.ov-bar` `.ov-label` `.ov-wrap`
- n0 已移除 `code` 字段，不渲染任何代码面板
- **大纲 iframe 自适应高度**: 通过 `runCode()` 中 `cif-ov` class 检测 → `load` 事件 → `body.scrollHeight` 精确设置 `iframe.style.height`，确保恰好等于内容高度、无多余空白、无滚动条

### 代码编辑器规范 (Monaco Editor)
- **组件**: `src/components/CodeEditor.vue` — 封装 Monaco Editor，通过 `defineAsyncComponent` 懒加载
- **环境配置**: `src/monaco-env.ts` — Vite URL 依赖模式配置 Web Worker（json/css/html/ts 各自独立 Worker）
- **Vite 分包**: `vite.config.ts` 中 `monaco-editor` → 独立 `monaco` chunk，不阻塞首屏
- **特性**: 语法高亮、智能补全、括号着色、行号折叠、自动格式化、暗色/亮色主题自动跟随（MutationObserver 监听 `<html>` class）
- **v-model 双向绑定**: 支持多语言（html/css/javascript），`automaticLayout: true` 自适应容器
- **无代码步骤不渲染**: `hasCode(s)` 检查 js/html/css 是否有非空内容，空步骤不显示编辑器面板

### Node.js 终端面板规范
Node.js 教学使用 **按内容类型渲染**（不用 iframe，不用运行按钮）:
- **有 js 代码时**: 显示 Terminal 面板（`.node-cp`）— 🖥️终端代码 + Copy 按钮 + 可选 html 输出
- **仅有 html 可视化时**: 显示轻量 Preview 面板（`.node-cp`，无 Terminal 标题栏）— 仅 html 内容
- **无任何代码**: 不显示任何面板
- **类名**: `.node-cp` `.node-bar` `.ncode-pre` `.noutput`
- **边框色**: `border:1px solid rgba(51,153,51,.3)` — Node.js 绿
- **代码区**: `background:#0d1117`，等宽字体，从 `stepCodes[s.id].js` 渲染 `<pre>`
- **输出区**: 从 `stepCodes[s.id].html` `v-html` 渲染，显示终端预期输出
- **不运行**: `renderCodes()` 跳过 node 类别的 `runCode()` 调用
- **不复用 iframe**: Node 教程完全不创建 iframe，直接在当前 DOM 渲染

### Node.js 复制代码按钮
- 所有有 `js` 代码的 node 步骤都显示 **📋 复制代码** 按钮
- 点击调用 `copyNodeCode(stepId, $event)` → `navigator.clipboard.writeText(stepCodes[id].js)`
- 复制后按钮文字变为 `✅ 已复制`，1.5s 后恢复
- 按钮用于将 Node.js 代码复制到用户本地终端执行

## Node.js 教程数据规范 (node-tutorials.json)
- **API 准确性**: 所有模块 API 均对标 `nodejs.org/docs/latest/api/` v26.2.0
- **章节编号**: n0 大纲 + n1-n37 内容章节（38 条记录）
- **步骤结构**: 每章 2-4 步，实战步骤为最后一步
- **code 字段**: `html`(终端展示) + `js`(模拟输出) + `css`(可选)
- **n0 大纲**: 无 `code` 字段 — 只显示 content 文本描述
- **propRef 覆盖率**: `100%` — 每步必须设置 propRef 指向 props-reference.json

## 面试题代码示例规范 (ExampleModal)

### 数据结构
- `IQExample` 接口: `{ title, code, language?, steps?, output?, expand? }`
- 每道面试题 `IQ` 接口新增可选 `example?: IQExample` 字段
- 数据文件: `src/data/interview-questions.ts`

### ExampleModal 组件 (src/components/ExampleModal.vue)
- 弹窗方式: Teleport to body + v-if + Transition sheet 动画
- 4 个区域: 代码块(带复制按钮) → 执行步骤 → 输出结果 → 拓展知识
- 桌面: 居中模态框 | 移动: 底部抽屉
- 入口: InterviewView 展开答案区域 "💻 查看代码示例" 按钮
- `defineExpose({ open })` 暴露 open 方法

### 示例编写规范
- 每道面试题都应有 `example` 代码示例
- 代码必须可直接运行/演示核心概念
- `steps` 数组: 逐步解释执行流程
- `expand` 数组: 相关拓展知识点
- `language` 字段: 指定代码语言（html/javascript/css/typescript）

## 面试题热门话题映射 (topicCatMap)

### 设计
- InterviewView 中 `topicCatMap` record 映射热门话题名 → 分类名
- 查找优先级: 精确映射 → 模糊包含 → 直接匹配
- 解决话题名(如"闭包")无法匹配分类名(如"JavaScript")的问题

### 映射表示例
```ts
const topicCatMap: Record<string, string> = {
  '闭包': 'JavaScript', 'Promise相关': '异步编程',
  'SSE': '网络协议', '虚拟列表': '性能优化',
  // ...
}
```

## 已修复 Bug 记录

### 1. nextTick 未导入 (InterviewView.vue)
- **问题**: `scrollToHot()` 使用 `nextTick` 但未从 vue 导入
- **修复**: 添加 `nextTick` 到 `import { ... } from 'vue'`

### 2. SplineScene wheel 事件无限循环 (SplineScene.vue)
- **问题**: `onWheel` 缺少 `forwarding` 防重入守卫，导致事件冒泡循环 → 栈溢出
- **修复**: `onWheel()` 开头添加 `if (forwarding) return`（与 `onPointerMove/Down/Up` 一致）

### 3. TutorialView runCode 不反映编辑 (TutorialView.vue)
- **问题**: `runCode()` 读取原始 `cm.html/css/js` 而非编辑后的 `cm.combined`
- **修复**: 优先使用 `cm.combined`（用户编辑后的内容）
- `buildCombined()`: CSS包`<style>`, HTML原样, JS包`<script>`，保留原始格式
- 移除所有自定义格式化函数(fmtCSS/fmtHTML)

### 4. Monaco Editor 代码格式化策略 (CodeEditor.vue)
- **核心原则**: 保留 JSON 原始格式，不做二次格式化
- **经验教训**: 自定义 `DocumentFormattingEditProvider` 会导致已格式化代码出现双重缩进（"更乱了"）
- **最终方案**: 只启用 `formatOnPaste: true`，不做自动格式化

## 检查清单
- [ ] 动画反馈？Transition 非 scoped？
- [ ] 弹窗 ESC+遮罩+果冻入场/出场？
- [ ] TutorialView: reveal-up + stagger + scrollIntoView？
- [ ] 教程无内嵌速查表？
- [ ] 间距: nav-height 无 +40px？
- [ ] propRef 100%？
- [ ] JSON 验证通过？
- [ ] 大纲章节无运行按钮 + 无编辑器？
- [ ] Node 章节终端面板 + 全屏模式？
- [ ] Node 实战步骤 📋复制代码 + copyNodeCode 功能正常？
- [ ] Node API 签名对标官方 v26.2.0 文档？
- [ ] 其他页面样式正常？
- [ ] WebGL背景不干扰内容交互？(`pointer-events: none`)
- [ ] 3D tilt 已应用到 HomeView/GalleryView/RoadmapView 卡片？
- [ ] 3D tilt 不与其他 transform 冲突？（用 margin/padding/opacity 替代直接 transform）
- [ ] 路由切换有 skeleton 骨架屏？（非空白白屏）
- [ ] 滚动进度条 z-index 1001，不被 NavBar 遮挡？
- [ ] 无未使用的 npm 依赖？（gasp/prismjs/splitpanes 已移除）
- [ ] vite.config 分包策略合理？vendor/three/data-props/data-animations/data-tutorials-index/tutorials
- [ ] 骨架屏 shimmer 动画使用 GPU 加速（background-position）？
- [ ] `prefers-reduced-motion` 覆盖所有动画/过渡？
- [ ] 主题初始化脚本在 `index.html` `<head>` 中防止闪烁？
- [ ] 系统主题变化时自动跟随？(main.ts matchMedia listener)
- [ ] Skip-link 可被 Tab 键触发？
- [ ] `:focus-visible` 替代 `:focus` 避免鼠标点击时显示轮廓？
- [ ] NavBar 有 `role` + `aria-label` + `aria-expanded`？
- [ ] 移动菜单 Escape 关闭？
- [ ] ErrorBoundary 包裹 `<router-view>`？
- [ ] DeskLamp 拉绳拖动 >20px 触发开关？弹簧回弹正常？四方向不被截取？
- [ ] DeskLamp Canvas 330×330？CSS scale(0.5) + top:-29px + right:15px 视觉位置正确？
- [ ] DeskLamp 灯光扩散/回缩动画流畅？`--bx/--by` 实时追踪位置？
- [ ] DeskLamp Teleport to body 渲染？
- [ ] FloatingChatBot 在 App.vue 全局渲染？所有页面右下角可见？
- [ ] FloatingChatBot z-index 100000？不被 NavBar/台灯遮挡？
- [ ] FloatingChatBot 4 个 Agent 角色保留？对话历史 localStorage 持久化？
- [ ] SplineScene 用 canvas 元素（非 div）传给 @splinetool/runtime Application？
- [ ] SplineScene onWheel 有 forwarding 防重入守卫？
- [ ] 旧 `.theme-toggle` 样式已从 main.css 移除？
- [ ] 主题自适应变量：所有光晕/阴影/渐变/标签颜色均使用 `--glow-*` / `--tag-bg` 等变量？
- [ ] 暗色主题使用 `#2997ff` 系列蓝色而非 `#0071e3`？
- [ ] 主题切换时所有颜色变化有 `transition .5s var(--spring-smooth)` 平滑过渡？
- [ ] gradient-text 使用 `--gradient-text` 变量（亮色蓝→紫，暗色亮蓝→亮紫）？
- [ ] 浮动形状 opacity 使用 `--shape-opacity` 变量（亮色 .06，暗色 .1）？
- [ ] 按钮光晕脉冲使用 `--btn-glow-color` 变量？
- [ ] 选中文字、聚焦环使用主题自适应变量？
- [ ] 代码编辑器面板使用 `--code-bg` / `--code-text` / `--code-border` 主题自适应变量？
- [ ] 预览 iframe 面板使用 `--preview-bg` 主题自适应变量？
- [ ] 弹窗遮罩使用 `--modal-overlay-bg` / 关闭按钮使用 `--modal-close-bg` 主题自适应变量？
- [ ] Playground 编辑器面板标题栏和 Tab 使用 `--code-header-bg` / `--code-header-text` 变量？
- [ ] Node.js 终端面板保持固定深色背景（不随主题变化）？
- [ ] 路线图圆点边框使用 `--roadmap-dot-border` 变量？
- [ ] 404 页面存在且路由 catch-all 配置正确？
- [ ] SplineScene 通过 `defineAsyncComponent` 懒加载？
- [ ] WebGL 背景在 Tab 不可见时暂停渲染（Page Visibility API）？
- [ ] SplashScreen 同 session 内只播放一次（sessionStorage 检查）？
- [ ] TutorialView stepCodes 按需初始化（initStepCodes）而非全量预构建？
- [ ] 路由预加载使用 IntersectionObserver 智能预取（data-prefetch）？
- [ ] 全局搜索 Cmd/Ctrl+K 可用？
- [ ] v-html 内容均经过 DOMPurify 消毒？
- [ ] index.html 包含 Open Graph + Twitter Card meta 标签？
- [ ] 面试题热门话题 topicCatMap 映射完整？
- [ ] 面试题 ExampleModal 组件集成正常？所有题目有 example？
- [ ] 所有 AI 请求通过 Node 代理？无 VITE_AI_API_KEY 暴露？
- [ ] 浏览器 Network Tab 中看不到 API Key、系统 Prompt？
- [ ] Source Guard 插件正常工作？地址栏访问 .vue/.ts/.json 返回 403？
- [ ] FloatingChatBot 使用 /api/chat 端点 + base64 编码？
- [ ] 移动端 Safe Area 适配正常（iPhone 刘海屏/底部 Home Indicator）？
- [ ] 移动端触控目标 ≥ 44px（Apple HIG）？
- [ ] 移动端禁用 sticky hover（@media hover:none）？
- [ ] FloatingChatBot 移动端近乎全屏显示？
- [ ] 横屏小高度（≤500px）Hero 区域正常压缩？

## 性能优化规范 (2026-06 新增)

### WebGL 背景帧率控制
- **Page Visibility API**: Tab 不可见时 `document.hidden === true` → 跳过 `drawArrays` 调用，仅保持 RAF 循环
- **恢复机制**: Tab 重新可见时自动恢复渲染，无需重新初始化
- **事件监听清理**: `onUnmounted` 中移除 `visibilitychange` 监听器
- `WebGLBackground.vue` 中实现:

```ts
let running = true
const onVisible = () => { running = !document.hidden }
document.addEventListener('visibilitychange', onVisible)
const animate = () => {
  if (running) { /* uniform 更新 + drawArrays */ }
  animId = requestAnimationFrame(animate)
}
// onUnmounted: document.removeEventListener('visibilitychange', onVisible)
```

### SplineScene 懒加载
- **首屏不加载**: SplineScene 通过 `defineAsyncComponent(() => import(...))` 异步加载
- **优先级**: 3D 模型是装饰性元素，首屏渲染优先级最低
- **实现**: 在 `App.vue` 中:
```ts
const SplineScene = defineAsyncComponent(() => import('@/components/SplineScene.vue'))
```

### 教程数据按需初始化
- **旧方案**: `tutorials.forEach(...)` 在组件加载时构建全部 stepCodes（浪费内存）
- **新方案**: `initStepCodes(tutorialId)` 仅在用户选中某课程时构建该课程的代码
- **调用时机**: `renderCodes()` → `initStepCodes(t.id)` → `runCode(s.id)`
- **内存节省**: 首次只初始化 1 个课程的代码，而非全部 11 个分类

### 路由智能预取
- **旧方案**: `requestIdleCallback` 一次性 `import()` 全部 5 个懒加载视图
- **新方案**: `IntersectionObserver` + `data-prefetch` 属性 → 仅预取用户即将访问的页面
- **实现**: NavBar 中的链接添加 `data-prefetch="/path"` 属性，`rootMargin: '200px'` 提前触发
- **回退**: 无 `data-prefetch` 属性的链接不触发预取

### SplashScreen 同 session 跳过
- **首次访问**: 正常播放启动画面
- **同 session 内回访**: `sessionStorage.getItem('lwyjr-splash-seen')` 存在则直接 `emit('done')`
- **新 session**: sessionStorage 自动清除，重新播放
- **实现**:
```ts
onMounted(() => {
  if (sessionStorage.getItem('lwyjr-splash-seen')) {
    emit('done')
    return
  }
  sessionStorage.setItem('lwyjr-splash-seen', '1')
  // ... 正常播放逻辑
})
```

## 404 页面规范 (NotFoundView.vue)
- **路由**: `/:pathMatch(.*)*` catch-all 匹配所有未注册路径
- **静态导入**: NotFoundView 不使用懒加载（确保即时显示）
- **设计**: Apple 风格 — 大号渐变 404 + 描述 + 返回首页按钮
- **动画**: `page-in` 入场动画
- **禁止**: 空白页面、纯文本 "404"、跳转自动重定向到首页（应让用户自主选择）

## 教程分类命名规范 (Tab Category Mapping)
- Vue 3 教程: JSON `category: "vue3"` → Tab `v: 'vue3'`
- React 教程: JSON `category: "react"` → Tab `v: 'react'`
- CDN 加载逻辑: `cat==='vue3'` 加载 Vue CDN, `cat==='react'` 加载 React CDN
- v-tutorials.json 已全部更新为 `"vue3"`
- TechStackView / RoadmapView 中的 goTutorial 引用已同步更新

## v-html 安全规范 (DOMPurify)
- **工具**: `src/utils/sanitize.ts` — 导出 `sanitize(html: string)` 函数
- **依赖**: `dompurify` (npm)
- **必须消毒的 v-html 位置**:
  - TutorialView: `s.content` (步骤内容), `s.tip` (提示), `stepCodes[id].html` (Node 输出)
  - FloatingChatBot: `renderMd(msg.text)` (AI Markdown 渲染结果)
  - PropModal: `data.tips` (属性提示列表)
- **允许的标签**: a, b, br, code, del, em, h1-h6, hr, i, img, ins, li, ol, p, pre, s, span, strong, sub, sup, table/thead/tbody/tr/td/th, ul, blockquote, div, mark, small
- **允许的属性**: href, target, rel, class, id, style, src, alt, title, data-*, aria-*, role
- **iframe 过滤**: 仅允许 same-origin iframe（src 必须为 about: 或 blob: 开头）

## 全局搜索规范 (SearchModal.vue)
- **触发**: `Cmd/Ctrl + K` 全局快捷键
- **渲染**: Teleport to body, z-index 1000000
- **搜索范围**: 教程标题/描述/步骤内容 + 动画标题/描述
- **最大结果**: 12 条
- **交互**: 上下键导航 + Enter 选择 + ESC 关闭 + 点击遮罩关闭
- **结果跳转**: 教程跳转到 `/tutorials?tab=xxx`, 动画跳转到 `/gallery`
- **在 App.vue 中渲染**: `<SearchModal ref="searchModal" />`

## SEO 规范
- **index.html**: 包含 `<link rel="canonical">`
- **Open Graph**: og:type, og:title, og:description, og:url, og:site_name, og:locale
- **Twitter Card**: twitter:card=summary_large_image, twitter:title, twitter:description
- **robots.txt**: `public/robots.txt` — Allow all + Sitemap 链接
- **sitemap.xml**: `public/sitemap.xml` — 6 个页面路由

## AI 请求安全代理架构 (2026-06 新增)

### 设计目标
所有 AI API 请求必须通过 Node 代理中间件，**API Key 和系统 Prompt 永远不暴露到浏览器**。

### 架构
```
浏览器 (base64 编码请求)
  → POST /api/think  (机器人心里话，单次响应，base64 编码)
  → POST /api/chat   (聊天对话，SSE 流式响应)
  → Node 代理中间件 (vite.config.ts 内联 / ai-proxy.mjs 独立)
    → 解码 base64 → 注入 API Key → 转发到 open.bigmodel.cn
    → 编码响应 (think: base64 / chat: SSE 透传)
  → 返回给浏览器
```

### 端点说明
| 端点 | 用途 | 请求 | 响应 |
|------|------|------|------|
| `/api/think` | 机器人心里话 | base64(JSON) | base64(JSON) |
| `/api/chat` | FloatingChatBot | base64(JSON) | SSE stream |

### 浏览器 Network Tab 中的效果
- 请求 URL: `POST /api/think` 或 `POST /api/chat`
- Content-Type: `text/plain`
- Body: `eyJtb2RlbCI6...` (base64 编码，看不到模型名、prompt、API Key)
- Response (think): base64 编码的 JSON
- Response (chat): SSE 流（内容为 AI 聊天文本，不含敏感信息）
- **无 `Authorization` header**，无 API Key，无系统 Prompt

### Dev 模式
- Vite plugin (`createAiProxyPlugin`) 内联在 `vite.config.ts`
- `configureServer` 同步注册 middleware
- API Key 从 `.env.local` 读取（`AI_API_KEY=...`）

### 生产模式
- 运行 `node ai-proxy.mjs`（端口 3001）
- 前端将 `/api/think` 和 `/api/chat` 代理到此服务器
- 或通过 Nginx/Caddy 反向代理到 ai-proxy

### 环境变量
- `.env.local` 中 `AI_API_KEY=xxx`（**无 `VITE_` 前缀**，否则会暴露到浏览器）
- 已在 `.gitignore` 中排除

### 源文件保护 (Source Guard)
- `createSourceGuardPlugin` Vite plugin
- 浏览器地址栏直接访问 `.vue/.ts/.json` → 403
- Vite 模块加载（`Accept: */*`）→ 正常放行
- 区分方式: 浏览器导航发 `Accept: text/html`，Vite 发 `Accept: */*`

### 禁止事项
- **禁止在前端代码中使用 `import.meta.env.VITE_AI_API_KEY`**
- **禁止在前端 fetch 请求中添加 `Authorization` header**
- **禁止直接在前端调用 `open.bigmodel.cn` 的任何端点**
- **禁止移除 Source Guard 插件**

## 移动端适配规范 (Mobile-First Responsive, 2026-06 新增)

### 断点体系 (基于 Tailwind CSS / GitHub 最佳实践)
| 断点 | 宽度 | 目标设备 |
|------|------|---------|
| xs | ≤640px | 手机竖屏 |
| sm | ≤768px | 手机横屏 /小平板 |
| md | ≤1024px | 平板 / 小笔记本 |
| lg | >1024px | 桌面 |

### 已实现的移动端优化

#### Safe Area Insets (iPhone 刘海屏 + Home Indicator)
- `body`: `padding: env(safe-area-inset-*)`
- `navbar`: `padding-top: env(safe-area-inset-top)` + 动态高度补偿
- `viewport-fit=cover` 在 index.html 中已配置

#### 触控目标 (Apple HIG: min 44×44pt)
- `@media (pointer: coarse)` 下所有可交互元素 min-height: 44px
- 包含: `.btn`, `.nav-link`, `.filter-btn`, `.editor-tab`, `.modal-close`

#### 文字缩放
- `≤640px`: html font-size 降至 15px，标题/副标题/按钮自动按比例缩小
- 标题使用 `clamp()` 流体排版

#### 布局响应
| 区域 | 桌面 | ≤640px |
|------|------|--------|
| Hero 按钮 | 横排 | 竖排全宽 |
| Gallery Grid | 2-3列 | 1列 |
| Tech Stack | 3列 | 1列 |
| Playground | 2列 | 1列 |
| Modal | 居中 | 底部抽屉式 |
| 路线图 | 居中双列 | 左侧单列 |

#### 触控设备优化
- `@media (hover: none)`: 禁用所有 hover transform 效果（防止 sticky hover）
- `-webkit-overflow-scrolling: touch`: 代码块原生滚动
- `-webkit-tap-highlight-color: transparent`: 按钮无高亮闪烁

#### FloatingChatBot 移动端
- 触发按钮: 56px → 48px
- 窗口: `calc(100vw - 16px)`, `calc(100vh - 80px)`, 近乎全屏
- 位置: bottom/right 28px → 16px

#### iOS PWA 支持
- `apple-mobile-web-app-capable`: yes
- `apple-mobile-web-app-status-bar-style`: black-translucent
- `@media (display-mode: standalone)`: body padding-top 补偿

#### 横屏适配
- `orientation: landscape + max-height: 500px`: Hero 区域压缩，隐藏统计数字

### 文件位置
- 全局移动 CSS: `src/styles/main.css` 末尾 "Mobile-First Responsive System" 区域
- 组件内移动 CSS: 各 .vue `<style>` 中的 `@media` 规则
- FloatingChatBot 移动: `src/components/FloatingChatBot.vue` 末尾

### 禁止事项
- **禁止删除 Safe Area 相关 CSS** (env(safe-area-inset-*))
- **禁止删除 `@media (pointer: coarse)` 触控目标规则**
- **禁止删除 `@media (hover: none)` 禁用 hover 规则**
- **禁止在移动端使用小于 44px 的触控目标**

## 导航与链接规范 (Navigation & Link Audit, 2026-06 新增)

### 路由表
| 路径 | 组件 | 名称 |
|------|------|------|
| `/` | HomeView | home |
| `/gallery` | GalleryView | gallery |
| `/roadmap` | RoadmapView | roadmap |
| `/tutorials` | TutorialView | tutorials |
| `/tutorials?tab=html` | TutorialView | — (query 驱动 tab 切换) |
| `/playground` | PlaygroundView | playground |
| `/techstack` | TechStackView | techstack |
| `/interview` | InterviewView | interview |
| `/:pathMatch(.*)*` | NotFoundView | not-found (404) |

### 链接审计清单
所有 `<a>`, `<router-link>`, `router.push()`, `@click` 导航必须指向有效路由。

| 位置 | 链接/操作 | 目标 | 状态 |
|------|-----------|------|------|
| NavBar Logo | `<router-link to="/">` | HomeView | ✅ |
| NavBar 菜单 7项 | `<router-link :to="item.path">` | 各视图 | ✅ |
| Footer 4链接 | `<router-link to="/xxx">` | 首页/动画/路径/教程 | ✅ (已从 `<a href="#">` 修复) |
| Hero 按钮 | `<router-link to="/roadmap">` / `/gallery` | 对应视图 | ✅ |
| Home preview-card 5项 | `@click="$router.push(p.path)"` | gallery/roadmap/tutorials/playground/techstack | ✅ |
| TechStack "本平台教程" | `<router-link :to="{path:'/tutorials',query:{tab:xxx}}">` | TutorialView + 自动切换 tab | ✅ (已从 hash 修复为 query) |
| Roadmap 卡片 | `getTutorialLink(step)` → `/tutorials?tab=xxx` | TutorialView + 自动切换 tab | ✅ (已从 hash 修复为 query) |
| TechStack 外链 | `<a :href="lk.url" target="_blank">` | MDN/Vite/React 等 | ✅ |
| NotFound "返回首页" | `<router-link to="/">` | HomeView | ✅ |
| Skip link | `<a href="#main-content">` | main 元素 | ✅ |

### TutorialView Tab 跨组件导航
- **TechStackView → TutorialView**: 使用 `query.tab` 参数（如 `?tab=html`、`?tab=vue3`）
- **RoadmapView → TutorialView**: 使用 `query.tab` 参数（`getTutorialLink` 返回 `/tutorials?tab=${cat}`）
- TutorialView 初始化 `curTab = route.query.tab || 'html'`
- `watch(route.query.tab)` 监听动态变化，自动切换对应 tab

### TutorialView Tab 完整列表 (17个)
| Emoji | 标签 | v值 | 有教程内容 |
|-------|------|-----|-----------|
| 🌐 | 互联网基础 | `internet` | ❌ 待添加 |
| 📄 | HTML | `html` | ✅ |
| 🎨 | CSS | `css` | ✅ |
| ⚡ | JavaScript | `js` | ✅ |
| 🔷 | TypeScript | `ts` | ✅ |
| 💚 | Vue 3 | `vue3` | ✅ |
| 🗄 | Zustand | `zustand` | ✅ |
| 🔷 | Dva | `dva` | ✅ |
| ⚛️ | React | `react2` | ✅ |
| 🧩 | Pinia | `pinia` | ✅ |
| ⚡ | Vite | `vite` | ✅ |
| 🎯 | Canvas/SVG | `canvas` | ❌ 待添加 |
| 🔧 | 构建工具 | `build` | ❌ 待添加 |
| 🚀 | 项目实战 | `project` | ❌ 待添加 |
| 🟢 | Node.js | `node` | ✅ |
| 🗄 | 数据库 | `db` | ❌ 待添加 |
| 🔗 | Fullstack | `fullstack` | ✅ |

### RoadmapView → TutorialView 步骤映射
| 步骤ID | 标题 | Tab |
|--------|------|-----|
| 1 | 认识互联网 | `internet` |
| 2 | HTML基础 | `html` |
| 3 | CSS入门 | `css` |
| 4 | CSS进阶 | `css` |
| 5 | JS基础 | `js` |
| 6 | JS进阶 | `js` |
| 7 | Canvas/SVG | `canvas` |
| 8 | 构建工具 | `build` |
| 9 | Vue 3 | `vue3` |
| 10 | TypeScript | `ts` |
| 11 | 项目实战 | `project` |
| 12 | Node.js | `node` |
| 13 | 数据库 | `db` |
| 14 | 前后端联调 | `fullstack` |
| 15 | 全栈实战 | `fullstack` |

### TutorialView 移动端课程列表
- `≤900px`: 侧边栏从纵向列表变为横向滚动条（`flex + overflow-x:auto + scrollbar-width:none`）
- 课程卡片水平排列，可滑动选择，`flex-shrink:0` 防止压缩
- 隐藏课程标题（h4）和课时信息（.cm），只显示课程名

### 触控目标 (Touch Targets, 全组件覆盖)
全局 `@media (pointer: coarse)` 规则覆盖以下类名：
`.btn, .nav-link, .filter-btn, .editor-tab, .code-tab-btn, .pg-tab, .abtn, .tb, .hot-item, .q-h, .cat-h, .tlk, .crun, .pg-run, .prop-btn, .ex-btn, .bcom`

### 禁止事项
- **禁止使用 `<a href="#xxx">` 做 SPA 内导航** — 必须用 `<router-link>` 或 `router.push()`
- **禁止在 `<router-link>` 中使用 hash（如 `/tutorials#html`）** — 必须用 `query` 参数（`?tab=html`）
- **禁止在移动端隐藏课程列表而不提供替代方案** — 必须提供横向滚动或折叠菜单

## 技术债务清单
- [ ] TutorialView 变量名过度压缩 (sp/st/gt/tt/tb/tc/tl/ts/ci/ch) — 降低可读性，逐步重构
- [ ] FloatingChatBot 使用自定义 DOM 事件 `tutNav` 跨 iframe 通信 — 跨 iframe 无法用 Pinia，保留 CustomEvent
- [ ] Three.js 动画依赖 CDN importmap — 离线不可用，可接受作为教育平台特性
- [ ] 缺少 SSR/SEO (vite-ssg) — 后续版本规划
- [ ] favicon 仍为 vite.svg — 后续替换为品牌 logo

## 优化优先级总表
| 优先级 | 优化项 | 状态 | 预期收益 |
|--------|--------|------|----------|
| P0 | WebGL Page Visibility 暂停 | ✅ 已实现 | Tab 不可见时节省 GPU |
| P0 | SplineScene 异步懒加载 | ✅ 已实现 | 首屏渲染提速 |
| P0 | 教程数据按需初始化 | ✅ 已实现 | 内存减少 60%+ |
| P0 | 路由智能预取 | ✅ 已实现 | 按需加载，避免全量预取 |
| P0 | 教程 Tab 分类命名重构 | ✅ 已实现 | Vue3=v:'vue3' React=v:'react' |
| P1 | SplashScreen 同 session 跳过 | ✅ 已实现 | 回访用户体验提升 |
| P1 | 404 Not Found 页面 | ✅ 已实现 | 用户信任度提升 |
| P1 | env.d.ts 清理 PrismJS 残留 | ✅ 已实现 | 工程整洁 |
| P1 | v-html DOMPurify 消毒 | ✅ 已实现 | XSS 防护 |
| P1 | 全局搜索 Cmd/Ctrl+K | ✅ 已实现 | 用户留存率 |
| P1 | Open Graph / Twitter Card | ✅ 已实现 | 社交分享预览 |
| P1 | sitemap.xml / robots.txt | ✅ 已实现 | SEO 可发现性 |
| P2 | SSR/SEO (vite-ssg) | 待规划 | 搜索引擎索引 |
| P2 | Monaco Editor 代码编辑器 | ✅ 已实现 | 语法高亮/智能补全/暗色主题 |
| P2 | favicon 品牌替换 | 待规划 | 品牌识别 |
| P1 | AI 请求 Node 代理 + base64 混淆 | ✅ 已实现 | API Key 安全，浏览器无暴露 |
| P1 | Source Guard 源文件保护 | ✅ 已实现 | 防止直接访问源码 |
| P1 | FloatingChatBot 代理迁移 | ✅ 已实现 | 聊天 API Key 不暴露 |
| P1 | 移动端 Safe Area + 触控目标 | ✅ 已实现 | iPhone 全屏适配 + Apple HIG |
| P1 | 移动端响应式布局 | ✅ 已实现 | 全设备布局适配 |
| P1 | Footer 死链修复 (a→router-link) | ✅ 已实现 | 导航可靠性 |
| P1 | TechStack→Tutorial 跨组件导航 (hash→query) | ✅ 已实现 | Tab 联动正确切换 |
| P1 | TutorialView 移动端课程列表 (隐藏→横滑) | ✅ 已实现 | 移动端可用性 |
| P1 | 全组件触控目标 44px 覆盖 | ✅ 已实现 | Apple HIG 合规 |
| P1 | RoadmapView 链接修复 (hash→query) + 步骤映射校正 | ✅ 已实现 | 学习路径→教学中心联动 |
| P1 | TechStackView 全技术项 goTutorial 补全 | ✅ 已实现 | 每个技术都有教程入口 |
| P1 | TutorialView 新增 5 个 tab (internet/canvas/build/project/db) | ✅ 已实现 | Tab 覆盖全技术栈 |

---

## AI 编码行为准则 (Karpathy Principles)

> 精选自 andrej-karpathy-skills，适配本项目。AI 助手在编码时须遵守以下四条。

### 一、先思考再编码
- 动手前列明假设，不确定就问，不要闷头猜
- 多种方案存在时，并列呈现并指出各自权衡
- 简单方案可行时，主动提出而非默认选复杂的
- 遇到模糊需求，先指出困惑点再寻求澄清

### 二、简单优先
- 不做超出需求的"加戏功能"、字段、参数
- 不为"只用一次"的代码做抽象/提取工具函数
- 不预留"将来可能用到"的扩展点
- 50 行能搞定就不要写 200 行——能砍就砍

### 三、精准修改
- 只改与需求直接相关的代码，不"顺手改进"相邻代码
- 尊重项目既有风格，不要按个人偏好重写
- 发现无关的死代码/坏味道——提及但不自行删除
- 每一行改动都要能回溯到具体的用户请求

### 四、目标驱动
- 把模糊任务转化为可验证目标：
  - "加校验" → 写用例覆盖异常输入，再让它们通过
  - "修 bug" → 写复现用例，再修到通过
  - "重构 X" → 确保前后行为一致
- 多步骤任务先给简要计划：`1. [步骤] → 验证：[检查]`
- 成功标准要足够强，避免反复口头确认

## 设计优化记录

### 动态 Logo（NavBar）
- 将静态文字 "LwyJr" 改为动态渐变流动效果
- 使用 `background: linear-gradient(...)` + `background-size: 300%` + `background-clip: text`
- `@keyframes logoFlow` 驱动 `background-position` 从 0% 流动到 300%，形成彩虹渐变持续流动
- **注意**：不要给每个字母单独设置渐变（会显示为彩色竖条），应保持整体文字一个渐变
- 配色：紫蓝 → 粉红 → 橙黄 → 黄绿 → 青绿 → 蓝色循环
- CSS class: `.nav-logo-animated`

### 白色主题下机器人优化（SplineScene）
- **问题**：白色主题下机器人像有蒙层覆盖，看起来模糊廉价
- **原因**：CSS 中 `opacity: 0.6` 在白色背景上显得雾蒙蒙
- **修复**：去掉 CSS 固定 opacity，改为 `:style="{ opacity: isDark ? 0.6 : 0.85 }"` 动态绑定
- **警告**：不要修改机器人的 3D 颜色（APPLE_PALETTE），用户要求白色主题 = 白色机器人
- **限制**：Spline 3D 对象不能直接修改 rotation/position，会破坏骨骼层级导致"头部掉下来"
- 所有动画必须用 CSS wrapper 级别操作（transform、filter），不能操作 3D 对象内部

### 机器人互动增强方案（待实施）
- 当前 Spline 场景 URL: `https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`
- **Spline 编辑器交互方案**（推荐）：
  - 在 Spline 编辑器中为机器人添加事件：Look At（头部跟踪鼠标）、Mouse Down（点击挥手/点头）
  - 需要为每个交互创建"状态"（State）并设置过渡动画
  - 支持事件：mouseDown、mouseHover、mouseUp、keyDown、lookAt
  - `@splinetool/runtime` 的 `SplineApp` 提供 `emitEvent(type, objName)` 可从代码端触发
- **Three.js 备选方案**：
  - 用 `Raycaster` 检测鼠标点击命中模型
  - 用 `AnimationMixer` + 预制 `AnimationClip`（wave/nod）播放动画
  - 骨骼追踪：`model.traverse` 找到头部骨骼，用 lerp 平滑跟随鼠标
  - 需要模型有骨骼结构和预设动画数据（.glb 格式）

### 机器人 AI 互动系统（已实施 — 方案 B）
- **API**：智谱 GLM-4-Flash（完全免费），Key 在 `.env.local` 的 `AI_API_KEY`（无 `VITE_` 前缀）
- **代理架构**：所有 AI 请求通过 Node 代理中间件，API Key 永远不离开服务端
  - `/api/think`：机器人心里话（请求/响应均 base64 编码）
  - `/api/chat`：FloatingChatBot 对话（请求 base64 编码，SSE 流式响应透传）
- **核心文件**：
  - `src/composables/useRobotMind.ts` — 监听路由变化 + 用户行为，调 AI API 生成心里话
  - `src/components/ThoughtBubble.vue` — 气泡 UI 组件（打字机效果、主题适配、6种动作修饰）
  - `src/components/SplineScene.vue` — 接收 `robotAction` prop，CSS wrapper 动画反应
  - `src/components/FloatingChatBot.vue` — 浮动聊天窗口，4 个 AI 助手角色，SSE 流式对话
  - `src/App.vue` — 组装层，传递 thought 和 action
  - `vite.config.ts` — Vite plugin 内联 AI 代理中间件（dev 模式）
  - `ai-proxy.mjs` — 独立 Node 代理服务器（生产模式，`npm run ai-proxy`）
- **触发时机**：页面切换（1.5s延迟）、首次访问（3s延迟）、45s无操作（idle触发）
- **冷却机制**：两次触发间隔至少 8s，气泡显示 4s 后自动消失
- **6种动作**：wave(摇摆)、nod(点头)、think(思考倾斜)、excited(弹跳)、sleepy(缩小)、idle(微缩放)
- **Fallback**：AI 不可用时使用预设心里话库（每个路由 2-3 条）
- **CSS 安全**：所有反应动画都是 CSS wrapper 级别，不触碰 3D 对象
