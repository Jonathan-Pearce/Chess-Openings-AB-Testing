import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createReadStream, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sfBinDir = resolve(__dirname, 'node_modules/stockfish/bin')
const sfFiles: Record<string, string> = {
  'stockfish-18-lite-single.js': 'application/javascript',
  'stockfish-18-lite-single.wasm': 'application/wasm',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // Serve stockfish engine files during dev and copy them to dist on build.
      // The engine script + WASM pair must be served together from the same path
      // so Emscripten can resolve the companion .wasm automatically.
      name: 'stockfish-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const fileName = (req.url ?? '').split('/').at(-1) ?? ''
          if (fileName in sfFiles) {
            res.setHeader('Content-Type', sfFiles[fileName])
            createReadStream(resolve(sfBinDir, fileName)).pipe(res)
          } else {
            next()
          }
        })
      },
      writeBundle() {
        const distDir = resolve(__dirname, 'dist')
        for (const file of Object.keys(sfFiles)) {
          copyFileSync(resolve(sfBinDir, file), resolve(distDir, file))
        }
      },
    },
  ],
  base: '/Chess-Openings-AB-Testing/',
})
