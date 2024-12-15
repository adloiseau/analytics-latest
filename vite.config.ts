import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    strictPort: true, // Force the specified port
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  // Add environment variables
  define: {
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production')
  }
});