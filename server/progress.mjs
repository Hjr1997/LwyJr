import { Router } from 'express'
import { authMiddleware } from './auth.mjs'
import db from './db.mjs'

const router = Router()

// 获取用户学习进度
router.get('/api/progress', authMiddleware, (req, res) => {
  const steps = db.prepare('SELECT step_id FROM learning_progress WHERE user_id = ?').all(req.userId)
  const streak = db.prepare(
    "SELECT DISTINCT DATE(completed_at) as study_date FROM learning_progress WHERE user_id = ? ORDER BY study_date DESC"
  ).all(req.userId)

  // 计算连续学习天数
  let streakDays = 0
  const today = new Date().toDateString()
  const dates = streak.map(r => new Date(r.study_date).toDateString())

  if (dates.length > 0) {
    if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toDateString()) {
      streakDays = 1
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1])
        const curr = new Date(dates[i])
        if ((prev.getTime() - curr.getTime()) <= 86400000 * 2) {
          streakDays++
        } else break
      }
    }
  }

  res.json({
    completedSteps: steps.map(s => s.step_id),
    streakDays,
    totalCompleted: steps.length,
  })
})

// 标记步骤完成/取消
router.post('/api/progress/toggle', authMiddleware, (req, res) => {
  const { stepId } = req.body
  if (!stepId) return res.status(400).json({ error: '缺少 stepId' })

  const existing = db.prepare(
    'SELECT id FROM learning_progress WHERE user_id = ? AND step_id = ?'
  ).get(req.userId, stepId)

  if (existing) {
    db.prepare('DELETE FROM learning_progress WHERE id = ?').run(existing.id)
    res.json({ completed: false, stepId })
  } else {
    db.prepare(
      'INSERT OR IGNORE INTO learning_progress (user_id, step_id) VALUES (?, ?)'
    ).run(req.userId, stepId)
    res.json({ completed: true, stepId })
  }
})

// 同步全部进度（首次登录合并本地数据）
router.post('/api/progress/sync', authMiddleware, (req, res) => {
  const { stepIds } = req.body
  if (!Array.isArray(stepIds)) return res.status(400).json({ error: 'stepIds 必须是数组' })

  const insert = db.prepare(
    'INSERT OR IGNORE INTO learning_progress (user_id, step_id) VALUES (?, ?)'
  )

  const syncMany = db.transaction((ids) => {
    for (const stepId of ids) {
      insert.run(req.userId, stepId)
    }
  })

  syncMany(stepIds)

  const all = db.prepare('SELECT step_id FROM learning_progress WHERE user_id = ?').all(req.userId)
  res.json({ completedSteps: all.map(s => s.step_id) })
})

// 学习笔记 API
router.get('/api/notes/:stepId', authMiddleware, (req, res) => {
  const note = db.prepare(
    'SELECT * FROM learning_notes WHERE user_id = ? AND step_id = ?'
  ).get(req.userId, req.params.stepId)
  res.json({ note: note || null })
})

router.put('/api/notes/:stepId', authMiddleware, (req, res) => {
  const { content } = req.body
  const existing = db.prepare(
    'SELECT id FROM learning_notes WHERE user_id = ? AND step_id = ?'
  ).get(req.userId, req.params.stepId)

  if (existing) {
    db.prepare(
      'UPDATE learning_notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(content, existing.id)
  } else {
    db.prepare(
      'INSERT INTO learning_notes (user_id, step_id, content) VALUES (?, ?, ?)'
    ).run(req.userId, req.params.stepId, content)
  }
  res.json({ saved: true })
})

export default router
