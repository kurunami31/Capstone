import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
          if (id.includes('node_modules/react-joyride')) return 'ui'
          if (id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf') || id.includes('node_modules/dompurify')) return 'pdf'
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
