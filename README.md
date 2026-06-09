# LwyJr — 从零基础到全栈大牛

动画教学 · 实战演练 · 完整学习路线。对比 W3Schools / MDN / freeCodeCamp 打造最优教程体验。

**技术栈**：Vue 3 + Vite + Pinia + Express + SQLite（sql.js）+ WebGL

---

## 项目背景

LwyJr 是一个面向零基础用户的全栈学习平台，覆盖 17 个技术分类、300+ 教学步骤：

| 层级 | 课程 |
|------|------|
| 🟢 基础 | 互联网基础 · HTML · CSS · JavaScript |
| 🟡 核心 | TypeScript · Vue 3 · React · Node.js |
| 🟠 扩展 | Vite · Pinia · Zustand · Dva · Canvas/SVG · 构建工具 · 数据库 · 项目实战 · 全栈 |

**核心功能**：
- 交互式教程（Monaco 代码编辑器 + 实时预览 iframe）
- AI 聊天助手（GLM-4-Flash，4 个 Agent 角色）
- 用户系统（注册/登录、学习进度云端同步、成就徽章、学习笔记）
- 动画特效场（70 个 CSS/Canvas/SVG/3D 动画）
- 面试题速查表（含代码示例）
- Pixar 风格台灯主题切换
- 3D 机器人 Spline 互动
- WebGL 流动光晕背景

---

## 环境要求

- **Node.js** >= 18
- **npm** >= 9
- Windows / macOS / Linux

---

## 快速开始（开发环境）

### 1. 克隆项目

```bash
git clone <repo-url>
cd LwyJr
```

### 2. 安装依赖

```bash
npm install
```

### 3. 创建 `.env.local`

在项目根目录创建 `.env.local` 文件：

```env
AI_API_KEY=你的智谱API密钥
```

获取 API Key：注册 [智谱开放平台](https://open.bigmodel.cn/)，创建 API Key（GLM-4-Flash 免费）。

`.env.local` 已在 `.gitignore` 中排除，不会提交到 Git。

### 4. 启动开发服务器

```bash
npm run dev
```

- 前端：`http://localhost:5173`
- Vite 自动代理 `/api/auth`、`/api/progress`、`/api/notes` → `localhost:3001`
- AI 代理内置于 Vite 插件中（`/api/think`、`/api/chat`）

### 5. 启动后端服务器（另一个终端）

```bash
npm run server
```

- Express 服务：`http://localhost:3001`
- 处理认证、学习进度、笔记 API
- 数据库文件自动创建在 `data/lwyjr.db`

---

## 项目结构

```
LwyJr/
├── index.html                  # HTML 入口
├── package.json                # 依赖和脚本
├── vite.config.ts              # Vite 配置（代理 + 分包 + Source Guard）
├── ai-proxy.mjs                # AI 代理中间件（dev 插件 / 生产模块）
├── .env.local                  # API Key（不提交到 Git）
├── CLAUDE.md                   # 项目规范和踩坑记录
│
├── server/                     # Express 后端
│   ├── index.mjs               # 服务入口（统一：AI代理 + 认证 + 进度 + 静态文件）
│   ├── auth.mjs                # 认证路由（注册/登录/JWT中间件）
│   ├── progress.mjs            # 进度 + 笔记 API
│   └── db.mjs                  # SQLite 数据库（sql.js WASM）
│
├── src/
│   ├── main.ts                 # Vue 入口
│   ├── App.vue                 # 根组件
│   ├── stores/                 # Pinia 状态管理
│   │   ├── app.ts              # 应用状态（主题/进度/搜索事件）
│   │   └── auth.ts             # 认证状态
│   ├── views/                  # 页面组件
│   │   ├── HomeView.vue        # 首页
│   │   ├── TutorialView.vue    # 教程中心
│   │   ├── GalleryView.vue     # 动画特效场
│   │   ├── RoadmapView.vue     # 学习路线图
│   │   ├── PlaygroundView.vue  # 代码演练场
│   │   ├── TechStackView.vue   # 技术栈
│   │   ├── InterviewView.vue   # 面试题速查
│   │   ├── ProgressView.vue    # 学习进度
│   │   └── NotFoundView.vue    # 404
│   ├── components/             # 公共组件
│   │   ├── NavBar.vue          # 导航栏
│   │   ├── FooterSection.vue   # 页脚
│   │   ├── DeskLamp.vue        # 台灯主题切换
│   │   ├── FloatingChatBot.vue # 浮动聊天助手
│   │   ├── FloatingAuth.vue    # 悬浮登录按钮
│   │   ├── AuthModal.vue       # 登录/注册弹窗
│   │   ├── SearchModal.vue     # 全局搜索
│   │   ├── WebGLBackground.vue # WebGL 流动背景
│   │   ├── SpotlightWrapper.vue# 鼠标聚光灯
│   │   ├── SplineScene.vue     # 3D 机器人
│   │   ├── SplashScreen.vue    # 启动屏
│   │   ├── CodeEditor.vue      # Monaco 代码编辑器
│   │   ├── PropModal.vue       # 属性参考弹窗
│   │   ├── ExampleModal.vue    # 代码示例弹窗
│   │   ├── CountUp.vue         # 数字滚动动画
│   │   ├── ErrorBoundary.vue   # 错误边界
│   │   └── ThoughtBubble.vue   # 机器人气泡
│   ├── composables/            # 组合式函数
│   │   ├── useScrollReveal.ts  # 滚动揭示
│   │   ├── use3DTilt.ts        # 3D 卡片倾斜
│   │   ├── useScrollProgress.ts# 滚动进度条
│   │   ├── useReducedMotion.ts # 减弱动画检测
│   │   ├── useMagneticCursor.ts# 磁吸光标
│   │   ├── useRobotMind.ts     # 机器人心里话
│   │   ├── useBodyScrollLock.ts# 弹窗滚动锁
│   │   └── useLearningReminder.ts # 学习提醒
│   ├── data/                   # 数据文件
│   │   ├── tutorials.ts        # 教程索引
│   │   ├── animations.ts       # 动画数据
│   │   ├── roadmap.ts          # 路线图数据
│   │   ├── quiz-data.ts        # 章末测验
│   │   ├── chatbot-agents.ts   # AI Agent 配置
│   │   ├── props-reference.json# CSS/HTML/JS 属性参考
│   │   ├── interview-questions.ts # 面试题
│   │   └── *-tutorials.json    # 各分类教程数据
│   ├── utils/
│   │   └── sanitize.ts         # DOMPurify HTML 消毒
│   ├── styles/
│   │   ├── main.css            # 全局样式 + 主题变量 + 移动端
│   │   ├── animations.css      # 动画类
│   │   └── transitions.css     # 弹窗过渡
│   └── monaco-env.ts           # Monaco Editor 环境配置
│
└── public/                     # 静态资源
    ├── robots.txt
    └── sitemap.xml
```

---

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（前端） |
| `npm run server` | 启动 Express 后端 |
| `npm run build` | 构建前端 + 复制后端文件到 `dist/` |
| `npm run preview` | 预览构建结果（仅前端静态文件） |
| `npm start` | 生产模式启动统一服务（同 `npm run server`） |

---

## 生产部署

### 构建

```bash
npm run build
```

构建过程：
1. `vue-tsc` — TypeScript 类型检查
2. `vite build` — 打包 Vue 应用到 `dist/`
3. `ai-proxy.mjs --postbuild dist` — 复制后端文件到 `dist/`

构建后的 `dist/` 目录结构：
```
dist/
├── index.html              # 前端入口
├── assets/                 # JS/CSS/字体/Worker
├── ai-proxy.mjs            # AI 代理中间件
├── package.json            # 依赖清单（含 sql.js）
├── .env.local              # API Key 占位
├── data/                   # 数据库目录（自动创建）
└── server/                 # Express 后端
    ├── index.mjs           # 统一服务入口
    ├── auth.mjs            # 认证路由
    ├── db.mjs              # 数据库
    └── progress.mjs        # 进度 API
```

### 部署到服务器

#### 1. 上传 dist/ 到服务器

将整个 `dist/` 目录上传到服务器的 Web 根目录（如 `C:\inetpub\wwwroot\` 或 `/var/www/`）。

#### 2. 安装依赖

```bash
cd /path/to/dist
npm install --omit=dev
```

注意：使用 `sql.js`（WebAssembly SQLite），**不需要 Python、VS Build Tools 或任何原生编译工具**。

#### 3. 配置环境变量

创建 `ecosystem.config.cjs`（PM2 配置）：

```js
module.exports = {
  apps: [{
    name: 'lwyjr',
    script: 'server/index.mjs',
    cwd: __dirname,
    env: {
      PORT: 80,
      NODE_ENV: 'production',
      AI_API_KEY: '你的智谱API密钥',
      JWT_SECRET: '一个随机字符串（至少32字符）'
    }
  }]
}
```

> ⚠️ 文件名必须是 `.cjs`（CommonJS），因为 `package.json` 声明了 `"type": "module"`，PM2 无法用 `require()` 加载 `.js` 文件。

#### 4. 启动服务

```bash
# 如果 80 端口被 IIS 占用，先停掉
iisreset /stop   # Windows
# 或
sudo systemctl stop nginx  # Linux

# PM2 启动
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 设置开机自启
```

#### 5. 验证

```bash
# 首页
curl http://localhost/

# 登录 API（应返回 JSON）
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# AI 代理
curl -X POST http://localhost/api/think \
  -H "Content-Type: text/plain" \
  -d '<base64编码的请求>'
```

### 反向代理（可选）

如果不想让 Node 直接监听 80 端口，可以用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## API 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/think` | 机器人心里话（base64 编码） | 无 |
| POST | `/api/chat` | AI 聊天（SSE 流式） | 无 |
| POST | `/api/auth/register` | 用户注册 | 无 |
| POST | `/api/auth/login` | 用户登录 | 无 |
| GET | `/api/auth/me` | 当前用户信息 | JWT |
| GET | `/api/progress` | 获取学习进度 | JWT |
| POST | `/api/progress/toggle` | 切换步骤完成状态 | JWT |
| POST | `/api/progress/sync` | 批量同步进度 | JWT |
| GET | `/api/notes/:stepId` | 获取笔记 | JWT |
| PUT | `/api/notes/:stepId` | 保存笔记 | JWT |

---

## 技术要点

### 安全
- **API Key 隔离**：AI_API_KEY 只在服务端（`.env.local` 或环境变量），浏览器网络面板不可见
- **请求编码**：AI 请求 body 使用 base64 编码传输
- **Source Guard**：浏览器直接访问 `.vue`/`.ts`/`.json` 源码返回 403
- **JWT 认证**：30 天过期，生产环境必须覆盖 JWT_SECRET
- **XSS 防护**：所有 `v-html` 渲染内容经过 DOMPurify 消毒

### 数据库
- **sql.js**：SQLite 编译为 WebAssembly，纯 JavaScript，零原生依赖
- **兼容封装**：`server/db.mjs` 模拟了 `better-sqlite3` 的同步 API（`prepare/get/all/run/transaction`）
- **自动保存**：写操作后自动调用 `db.export()` 持久化到磁盘
- **路径**：默认 `data/lwyjr.db`，可通过 `DB_PATH` 环境变量修改

### 主题系统
- **CSS 变量**：所有颜色/光晕/阴影均使用 `--glow-*`、`--tag-bg` 等变量，亮/暗主题自适应
- **防闪烁**：`index.html` 内联脚本在 Vue 挂载前设置 `data-theme` 属性
- **系统跟随**：监听 `prefers-color-scheme` 变化，仅当用户未手动设置时

### 动画体系
- **Transition**：弹窗/入场动画必须是 **非 scoped** 样式（Vue 动态类无 `data-v-xxx`）
- **Spring 曲线**：`cubic-bezier(.34,1.56,.64,1)`（弹入）、`cubic-bezier(.16,1,.3,1)`（平滑）
- **leave 动画**：`cubic-bezier(.4,0,.2,1)`（无回弹，防黑影），`leave-to` 必须包含 `backdrop-filter:none`

### 移动端
- **Safe Area**：`env(safe-area-inset-*)` 适配 iPhone 刘海屏
- **触控目标**：≥ 44px（`@media (pointer: coarse)`）
- **iOS 输入框**：`≤768px` 强制 `font-size: 16px` 阻止自动缩放
- **性能**：移动端禁用 SplineScene、SpotlightWrapper、3D Tilt，WebGL FBM 降级到 2 层

---

## 常见问题

### Q: `npm install` 报 `node-gyp` / `find Python` 错误？
A: 项目已使用 `sql.js`（WASM）替代 `better-sqlite3`（原生 C++），不再需要 Python 或编译工具。确保 `package.json` 中依赖是 `sql.js` 而非 `better-sqlite3`。

### Q: 生产环境登录返回 HTML 而不是 JSON？
A: 确认 PM2 运行的是 `server/index.mjs`（新统一服务）而非 `server.mjs`（旧 AI 代理）。用 `pm2 describe 0` 检查。

### Q: PM2 启动报 `ERR_REQUIRE_ESM`？
A: 配置文件必须用 `.cjs` 后缀（`ecosystem.config.cjs`），因为项目 `package.json` 有 `"type": "module"`。

### Q: 部署后首页 404？
A: 确认 `server/index.mjs` 中静态文件路径正确——从 `dist/server/` 运行时，静态文件在上级目录（`..`），不在 `../dist/`。

### Q: 如何更换 AI 模型？
A: 编辑 `ai-proxy.mjs` 中的 `AI_TARGET` 变量（默认 `https://open.bigmodel.cn/api/paas`），以及 FloatingChatBot 和 useRobotMind 中的模型名 `glm-4-flash`。

---

## License

Private — 闭源项目
