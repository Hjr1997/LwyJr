/**
 * AI proxy — ALL AI requests go through Node, API key stays server-side.
 * Endpoints:
 *   POST /api/think  — robot mind (base64 request → base64 response)
 *   POST /api/chat   — FloatingChatBot SSE (base64 request → SSE stream)
 */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const AI_TARGET = 'https://open.bigmodel.cn/api/paas'

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
 * Vite plugin middleware.
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

/**
 * Standalone server — node ai-proxy.mjs
 */
function startStandaloneServer(port = 3001) {
  const apiKey = loadApiKey()
  if (!apiKey) {
    console.error('[ai-proxy] AI_KEY not found')
    process.exit(1)
  }
  console.log(`[ai-proxy] Key loaded: ${apiKey.slice(0, 6)}...`)

  const proxy = createProxyMiddleware()
  const server = createServer((req, res) => {
    proxy(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('not found')
    })
  })
  server.listen(port, () => {
    console.log(`[ai-proxy] Running on http://localhost:${port} (/api/think + /api/chat)`)
  })
}

const isMain = process.argv[1]?.endsWith('ai-proxy.mjs')
if (isMain) startStandaloneServer()
