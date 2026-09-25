import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  envDir: '../',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler') || id.includes('react-is')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3') || id.includes('victory') || id.includes('chart')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('rich-text-editor')) {
              return 'vendor-editor';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('zustand') || id.includes('sweetalert2')) {
              return 'vendor-utils';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
});
