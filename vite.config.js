import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Trouve tous les fichiers HTML du projet (sauf node_modules et dist)
function findHtmlFiles(dir, rootDir = dir) {
  const entries = {}
  const SKIP = new Set(['node_modules', 'dist', '.git', '.github'])
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      Object.assign(entries, findHtmlFiles(full, rootDir))
    } else if (entry.endsWith('.html')) {
      const normalRoot = rootDir.replace(/\\/g, '/').replace(/\/$/, '')
      const normalFull = full.replace(/\\/g, '/')
      const key = normalFull
        .replace(normalRoot + '/', '')
        .replace('.html', '')
      entries[key] = full
    }
  }
  return entries
}

export default defineConfig({
  base: '/',

  build: {
    outDir: 'dist',
    target: 'es2022',
    rollupOptions: {
      input: findHtmlFiles(__dirname),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:12345',
        changeOrigin: true,
      },
    },
  },
})
