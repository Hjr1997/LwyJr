import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import authRoutes from './auth.mjs'
import progressRoutes from './progress.mjs'
import { createProxyMiddleware } from '../ai-proxy.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// CORS 预检 — 所有请求都需要
app.use(cors())

// AI 代理中间件 — 处理 /api/think 和 /api/chat（需在 express.json() 之前，因为要读原始 body）
app.use(createProxyMiddleware())

// JSON 解析 — 给 auth/progress 路由用
app.use(express.json())

// API 路由
app.use(authRoutes)
app.use(progressRoutes)

// 生产模式：托管前端构建文件
// 自动检测：从 dist/server/ 运行时静态文件在 ../，从 server/ 运行时在 ../dist/
const distPath = (() => {
  const parentPath = path.join(__dirname, '..')
  // 如果上级目录直接有 index.html（生产：server/ 在 dist/ 内），用上级目录
  if (existsSync(path.join(parentPath, 'index.html'))) return parentPath
  // 否则是开发模式（server/ 在项目根），静态文件在 ../dist/
  return path.join(parentPath, 'dist')
})()
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
  console.log(`   POST /api/think          — 机器人心里话 (AI 代理)`)
  console.log(`   POST /api/chat           — 聊天对话 (AI 代理 SSE)`)
  console.log(`   POST /api/auth/register  — 注册`)
  console.log(`   POST /api/auth/login     — 登录`)
  console.log(`   GET  /api/auth/me         — 用户信息`)
  console.log(`   GET  /api/progress         — 学习进度`)
  console.log(`   POST /api/progress/toggle  — 切换步骤完成`)
  console.log(`   POST /api/progress/sync    — 同步进度`)
  console.log(`   GET  /api/notes/:stepId    — 获取笔记`)
  console.log(`   PUT  /api/notes/:stepId    — 保存笔记`)
})
