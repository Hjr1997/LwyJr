import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './auth.mjs'
import progressRoutes from './progress.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API 路由
app.use(authRoutes)
app.use(progressRoutes)

// 生产模式：托管前端构建文件
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
// SPA fallback — 非 API 请求全部返回 index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  if (req.method !== 'GET') return next()
  const filePath = path.join(distPath, req.path)
  // 如果请求的不是静态文件（如 .js/.css/.png），返回 index.html
  if (!req.path.includes('.')) {
    res.sendFile(path.join(distPath, 'index.html'))
  } else {
    next()
  }
})

app.listen(PORT, () => {
  console.log(`🚀 LwyJr Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints:`)
  console.log(`   POST /api/auth/register  — 注册`)
  console.log(`   POST /api/auth/login     — 登录`)
  console.log(`   GET  /api/auth/me         — 用户信息`)
  console.log(`   GET  /api/progress         — 学习进度`)
  console.log(`   POST /api/progress/toggle  — 切换步骤完成`)
  console.log(`   POST /api/progress/sync    — 同步进度`)
  console.log(`   GET  /api/notes/:stepId    — 获取笔记`)
  console.log(`   PUT  /api/notes/:stepId    — 保存笔记`)
})
