import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createAiProxyPlugin } from './ai-proxy.mjs'

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
        if (url.includes('?')) return next()
        if (url.startsWith('/@') || url.startsWith('/node_modules')) return next()

        const pathname = url.split('?')[0]
        const ext = pathname.substring(pathname.lastIndexOf('.'))
        if (ext && BLOCKED_EXT.has(ext)) {
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
  base: './',
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
    proxy: {
      // 认证 + 学习进度 API → 后端服务器(3001)
      '/api/auth': 'http://localhost:3001',
      '/api/progress': 'http://localhost:3001',
      '/api/notes': 'http://localhost:3001',
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
