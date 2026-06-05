import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// ═══════════════════════════════════════════════════════════════
//  Shared: load API key from .env.local (server-side only)
// ═══════════════════════════════════════════════════════════════
function loadApiKey() {
  const dir = fileURLToPath(new URL('.', import.meta.url))
  try {
    for (const f of ['.env.local', '.env']) {
      const content = readFileSync(dir + f, 'utf-8')
      const match = content.match(/AI_API_KEY=(.+)/)
      if (match) return match[1].trim()
    }
  } catch { /* not found */ }
  return process.env.AI_KEY || ''
}

const AI_TARGET = 'https://open.bigmodel.cn/api/paas'

// ═══════════════════════════════════════════════════════════════
//  AI Proxy Plugin — ALL AI requests go through Node
//  /api/think  — robot mind (single response, base64 encoded)
//  /api/chat   — FloatingChatBot (SSE streaming, base64 request)
//  API keys stay server-side, request bodies are obfuscated
// ═══════════════════════════════════════════════════════════════
function createAiProxyPlugin(): Plugin {
  return {
    name: 'ai-proxy',
    configureServer(server) {
      const apiKey = loadApiKey()
      if (!apiKey) {
        console.warn('[ai-proxy] AI_KEY not found in .env.local — proxy disabled')
        return
      }
      console.log('[ai-proxy] Loaded ✓ — /api/think + /api/chat endpoints active')

      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const method = req.method || ''

        // ── /api/think: robot mind (non-streaming, base64 ↔ base64) ──
        if (url === '/api/think' && method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
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
                  console.error('[ai-proxy]', err.message)
                  const fb = Buffer.from(JSON.stringify({ error: 'proxy error' })).toString('base64')
                  res.writeHead(502, { 'Content-Type': 'text/plain' })
                  res.end(fb)
                })
            } catch (err) {
              console.error('[ai-proxy] decode error:', err)
              const fb = Buffer.from(JSON.stringify({ error: 'bad request' })).toString('base64')
              res.writeHead(400, { 'Content-Type': 'text/plain' })
              res.end(fb)
            }
          })
          return
        }

        // ── /api/chat: FloatingChatBot (SSE streaming, base64 request) ──
        if (url === '/api/chat' && method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
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
                  // Stream SSE back to browser
                  res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                  })
                  const reader = upstream.body?.getReader()
                  if (!reader) {
                    res.end()
                    return
                  }
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
      })
    },
  }
}

// ═══════════════════════════════════════════════════════════════
//  Source Guard — block direct browser access to source files
//  Uses Accept header to distinguish navigation vs module loading
// ═══════════════════════════════════════════════════════════════
function createSourceGuardPlugin(): Plugin {
  return {
    name: 'source-guard',
    configureServer(server) {
      const BLOCKED_EXT = new Set(['.vue', '.ts', '.tsx', '.jsx', '.scss', '.sass', '.less', '.json'])

      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        // Allow Vite internal transforms (?import, ?raw, ?url, ?vue, ?t=...)
        if (url.includes('?')) return next()
        // Allow public assets, @vite paths, node_modules
        if (url.startsWith('/@') || url.startsWith('/node_modules')) return next()

        // Check if a blocked extension is requested
        const pathname = url.split('?')[0]
        const ext = pathname.substring(pathname.lastIndexOf('.'))
        if (ext && BLOCKED_EXT.has(ext)) {
          // Browser direct navigation sends Accept: text/html
          // Vite module serving sends Accept: */* (no text/html)
          const accept = req.headers.accept || ''
          if (accept.includes('text/html')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' })
            res.end('Access denied')
            return
          }
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    createAiProxyPlugin(),
    createSourceGuardPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) {
            return 'vendor'
          }
          if (id.includes('node_modules/three')) {
            return 'three'
          }
          if (id.includes('node_modules/monaco-editor')) {
            return 'monaco'
          }
          if (id.includes('src/data/')) {
            if (id.includes('props-reference')) return 'data-props'
            if (id.includes('animations')) return 'data-animations'
            if (id.includes('tutorials.ts')) return 'data-tutorials-index'
            return 'tutorials'
          }
          if (id.includes('src/data/animations')) {
            return 'animations'
          }
        },
      },
    },
  },
})
