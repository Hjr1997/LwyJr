import initSqlJs from 'sql.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'lwyjr.db')

// 确保数据目录存在
const dbDir = path.dirname(dbPath)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

// ═══════════════════════════════════════════════════════════════
//  sql.js 兼容封装 — 模拟 better-sqlite3 同步 API
// ═══════════════════════════════════════════════════════════════
class StmtCompat {
  constructor(db, sql) {
    this.db = db
    this.sql = sql
  }

  run(...params) {
    this.db.run(this.sql, params.flat())
    // 获取 lastInsertRowid（sql.js 通过 SELECT last_insert_rowid() 获取）
    const result = this.db.exec('SELECT last_insert_rowid() as id')
    const lastInsertRowid = result.length > 0 ? result[0].values[0][0] : 0
    return { changes: this.db.getRowsModified(), lastInsertRowid }
  }

  get(...params) {
    const stmt = this.db.prepare(this.sql)
    if (params.length > 0) stmt.bind(params.flat())
    if (stmt.step()) {
      const obj = stmt.getAsObject()
      stmt.free()
      return obj
    }
    stmt.free()
    return undefined
  }

  all(...params) {
    const stmt = this.db.prepare(this.sql)
    if (params.length > 0) stmt.bind(params.flat())
    const results = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  }
}

class DbCompat {
  constructor(sqlDb, filePath) {
    this.db = sqlDb
    this.filePath = filePath
  }

  prepare(sql) {
    return new StmtCompat(this.db, sql)
  }

  exec(sql) {
    this.db.run(sql)
  }

  // 保存到磁盘
  save() {
    const data = this.db.export()
    const buffer = Buffer.from(data)
    writeFileSync(this.filePath, buffer)
  }

  // 事务包装（sql.js 自动事务，这里简化处理）
  transaction(fn) {
    return (...args) => {
      try {
        this.db.run('BEGIN')
        const result = fn(...args)
        this.db.run('COMMIT')
        return result
      } catch (e) {
        this.db.run('ROLLBACK')
        throw e
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  初始化数据库
// ═══════════════════════════════════════════════════════════════
const SQL = await initSqlJs()

let sqlDb
if (existsSync(dbPath)) {
  const fileBuffer = readFileSync(dbPath)
  sqlDb = new SQL.Database(fileBuffer)
} else {
  sqlDb = new SQL.Database()
}

const db = new DbCompat(sqlDb, dbPath)

// 启用 WAL 模式 + 外键约束（sql.js 默认支持）
db.exec('PRAGMA foreign_keys = ON')

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS learning_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    step_id TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, step_id)
  );

  CREATE TABLE IF NOT EXISTS learning_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    step_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_progress_user ON learning_progress(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_user_step ON learning_notes(user_id, step_id);
`)

// 每次写入后自动保存
const origRun = sqlDb.run.bind(sqlDb)
sqlDb.run = function (sql, params) {
  const result = origRun(sql, params)
  // 只对写操作自动保存
  const upperSql = sql.trim().toUpperCase()
  if (upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') ||
      upperSql.startsWith('DELETE') || upperSql.startsWith('CREATE') ||
      upperSql.startsWith('DROP') || upperSql.startsWith('ALTER') ||
      upperSql.startsWith('BEGIN') || upperSql.startsWith('COMMIT') ||
      upperSql.startsWith('ROLLBACK')) {
    db.save()
  }
  return result
}

console.log(`[db] SQLite ready: ${dbPath}`)

export default db
