import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { contentPlugin } from './build/vite-plugin-content.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  build: {
    // Büyük chunk'lar yalnızca Mermaid'in tembel yüklenen diyagram motorları; ana pakete girmezler.
    chunkSizeWarningLimit: 1600,
  },
  plugins: [
    react(),
    tailwindcss(),
    // `--mode drafts` (npm run dev:drafts) taslakları yerelde gösterir; normal build'e asla girmez.
    // CONTENT_DIR yalnızca testlerde örnek içerikle build almak için.
    contentPlugin({ contentDir: process.env.CONTENT_DIR ?? 'content', includeDrafts: mode === 'drafts' || process.env.SHOW_DRAFTS === '1' }),
  ],
}))
