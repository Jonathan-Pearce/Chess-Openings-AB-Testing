/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LICHESS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
