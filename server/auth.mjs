import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.mjs'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'lwyjr-secret-key-change-in-production'
const JWT_EXPIRES = '30d'

// 注册
router.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码为必填项' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少需要 6 个字符' })
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名需要 2-20 个字符' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
    if (existing) {
      return res.status(409).json({ error: '用户名或邮箱已被注册' })
    }

    const password_hash = bcrypt.hashSync(password, 10)
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username, email, password_hash)

    const token = jwt.sign({ userId: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, username, email, avatar: '' }
    })
  } catch (e) {
    console.error('Register error:', e.message)
    res.status(500).json({ error: '注册失败，请稍后重试' })
  }
})

// 登录
router.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    // 更新最后登录时间
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id)

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar || '' }
    })
  } catch (e) {
    console.error('Login error:', e.message)
    res.status(500).json({ error: '登录失败，请稍后重试' })
  }
})

// 获取当前用户信息
router.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar, created_at, last_login FROM users WHERE id = ?').get(req.userId)
  if (!user) return res.status(404).json({ error: '用户不存在' })
  res.json({ user })
})

// JWT 中间件
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    req.username = decoded.username
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

export default router
