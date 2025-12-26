
import tailwindcss from '@tailwindcss/vite'



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'


// __dirname cho ESM
const __dirname = fileURLToPath(new URL(".",
  import.meta.url));
export default defineConfig({
  base: '/',
  plugins: [
    react(), tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'chart-vendor': ['recharts'],
          'calendar-vendor': [
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction'
          ],
          'icons': ['@chakra-ui/icons', '@heroicons/react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      'recharts'
    ],
  },
  resolve: {
    alias: {
      "~": `${__dirname}src`,
    },
  },
  server: {
    https: false
  }
})
