/**
 * ai-proxy.mjs — Unified AI proxy & production server
 *
 * Two modes:
 *  1. Vite plugin (dev)  →  import { createAiProxyPlugin } from './ai-proxy.mjs'
 *  2. Standalone server   →  node ai-proxy.mjs [dist-dir] [port]
 *
 * Endpoints:
 *   POST /api/think  — robot mind  (base64 request → base64 response)
 *   POST /api/chat   — chat bot    (base64 request → SSE stream)
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, copyFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const AI_TARGET = 'https://open.bigmodel.cn/api/paas'

// ═══════════════════════════════════════════════════════════════
//  Shared: load API key from .env files (server-side only)
// ═══════════════════════════════════════════════════════════════
function loadApiKey() {
  try {
    for (const f of ['.env.local', '.env']) {
      const content = readFileSync(
        fileURLToPath(new URL(f, import.meta.url)),
        'utf-8'
      )
      const match = content.match(/AI_API_KEY=(.+)/)
      if (match) return match[1].trim()
    }
  } catch { /* file not found */ }
  return process.env.AI_KEY || ''
}

/**
 * Connect-compatible middleware that handles /api/think and /api/chat.
 * Passes to next() for all other requests.
 */
export function createProxyMiddleware() {
  const apiKey = loadApiKey()
  if (!apiKey) console.warn('[ai-proxy] AI_KEY not found')

  return function aiProxy(req, res, next) {
    const url = req.url || ''
    const method = req.method || ''

    // ── /api/think: non-streaming ──
    if (url === '/api/think' && method === 'POST') {
      const chunks = []
      req.on('data', c => chunks.push(c))
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf-8')
          const jsonStr = Buffer.from(raw, 'base64').toString('utf-8')
          const payload = JSON.parse(jsonStr)

          fetch(AI_TARGET + '/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          })
            .then(async (r) => {
              const text = await r.text()
              const encoded = Buffer.from(text).toString('base64')
              res.writeHead(r.status, { 'Content-Type': 'text/plain' })
              res.end(encoded)
            })
            .catch((err) => {
              console.error('[ai-proxy] Error:', err.message)
              const fallback = Buffer.from(JSON.stringify({ error: 'proxy error' })).toString('base64')
              res.writeHead(502, { 'Content-Type': 'text/plain' })
              res.end(fallback)
            })
        } catch (err) {
          console.error('[ai-proxy] Decode error:', err)
          const fallback = Buffer.from(JSON.stringify({ error: 'bad request' })).toString('base64')
          res.writeHead(400, { 'Content-Type': 'text/plain' })
          res.end(fallback)
        }
      })
      return
    }

    // ── /api/chat: SSE streaming ──
    if (url === '/api/chat' && method === 'POST') {
      const chunks = []
      req.on('data', c => chunks.push(c))
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf-8')
          const jsonStr = Buffer.from(raw, 'base64').toString('utf-8')
          const payload = JSON.parse(jsonStr)

          fetch(AI_TARGET + '/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          })
            .then((upstream) => {
              if (!upstream.ok) {
                upstream.text().then(t => {
                  res.writeHead(upstream.status, { 'Content-Type': 'text/plain' })
                  res.end(t)
                })
                return
              }
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              })
              const reader = upstream.body?.getReader()
              if (!reader) { res.end(); return }
              const pump = async () => {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) { res.end(); return }
                  res.write(value)
                }
              }
              pump().catch(() => res.end())
            })
            .catch((err) => {
              console.error('[ai-proxy] /api/chat error:', err.message)
              res.writeHead(502, { 'Content-Type': 'text/plain' })
              res.end(JSON.stringify({ error: 'proxy error' }))
            })
        } catch (err) {
          console.error('[ai-proxy] /api/chat decode error:', err)
          res.writeHead(400, { 'Content-Type': 'text/plain' })
          res.end(JSON.stringify({ error: 'bad request' }))
        }
      })
      return
    }

    next()
  }
}

// ═══════════════════════════════════════════════════════════════
//  Vite plugin — used in vite.config.ts for dev mode
// ═══════════════════════════════════════════════════════════════
export function createAiProxyPlugin() {
  return {
    name: 'ai-proxy',
    configureServer(server) {
      const middleware = createProxyMiddleware()
      server.middlewares.use(middleware)
      console.log('[ai-proxy] Dev plugin active ✓')
    },
  }
}

// ═══════════════════════════════════════════════════════════════
//  Static file serving + SPA fallback (for standalone mode)
// ═══════════════════════════════════════════════════════════════
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

function serveStatic(root, req, res, fallbackHtml) {
  let urlPath = req.url?.split('?')[0] || '/'
  const filePath = join(root, urlPath === '/' ? 'index.html' : urlPath)
  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = '.' + filePath.split('.').pop().toLowerCase()
      const mime = MIME[ext] || 'application/octet-stream'
      const data = readFileSync(filePath)
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
      })
      res.end(data)
      return true
    }
  } catch { /* ignore */ }
  // SPA fallback: return index.html for any unknown path
  if (fallbackHtml) {
    const indexFile = join(root, 'index.html')
    if (existsSync(indexFile)) {
      const data = readFileSync(indexFile)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(data)
      return true
    }
  }
  return false
}

// ═══════════════════════════════════════════════════════════════
//  Standalone server
//  Usage: node ai-proxy.mjs [dist-dir] [port]
//  Examples:
//    node ai-proxy.mjs                    → serves ./dist on :3001
//    node ai-proxy.mjs dist 80            → serves ./dist on :80
//    node ai-proxy.mjs C:\web-api\dist 80 → serves on :80
// ═══════════════════════════════════════════════════════════════
function startStandaloneServer(distDir, port = 3001) {
  const apiKey = loadApiKey()
  if (!apiKey) {
    console.error('[ai-proxy] AI_KEY not found in .env.local — API disabled')
  } else {
    console.log(`[ai-proxy] Key loaded: ${apiKey.slice(0, 6)}...`)
  }
  console.log(`[ai-proxy] Static files: ${distDir}`)

  const proxy = createProxyMiddleware()
  const server = createServer((req, res) => {
    proxy(req, res, () => {
      if (serveStatic(distDir, req, res, true)) return
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('not found')
    })
  })
  server.listen(port, () => {
    console.log(`\n  🚀 Server running at http://localhost:${port}`)
    console.log(`     Static files: ${distDir}`)
    console.log(`     API: /api/think, /api/chat\n`)
  })
}

// ═══════════════════════════════════════════════════════════════
//  Build hook — copies server files into dist/ after vite build
//  Usage: node ai-proxy.mjs --postbuild <dist-dir>
// ═══════════════════════════════════════════════════════════════
function postBuild(distDir) {
  const selfPath = fileURLToPath(import.meta.url)
  const target = join(distDir, 'server.mjs')
  copyFileSync(selfPath, target)
  // Copy .env.local if exists
  const envPath = join(dirname(selfPath), '.env.local')
  if (existsSync(envPath)) {
    copyFileSync(envPath, join(distDir, '.env.local'))
  } else {
    // Create placeholder
    const placeholder = '# AI_API_KEY=your_api_key_here'
    writeFileSync(join(distDir, '.env.local'), placeholder)
  }
  console.log(`[ai-proxy] Deploy files copied to ${distDir}/`)
  console.log(`  → server.mjs`)
  console.log(`  → .env.local`)
  console.log(`\n  Deploy: upload "${distDir}/" to server, then run:`)
  console.log(`    node server.mjs . ${port || 80}`)
}



// ═══════════════════════════════════════════════════════════════
//  CLI entry point
// ═══════════════════════════════════════════════════════════════
const isMain = process.argv[1]?.endsWith('ai-proxy.mjs')
if (isMain) {
  const firstArg = process.argv[2]

  if (firstArg === '--postbuild') {
    const distDir = process.argv[3] || 'dist'
    postBuild(distDir)
  } else {
    const distDir = firstArg || join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
    const port = parseInt(process.argv[3] || '3001', 10)
    startStandaloneServer(distDir, port)
  }
}
