import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/search-flights': {
        target: 'https://znspwfhgtynucbmxtswk.supabase.co/functions/v1/search-flights',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/search-flights/, '')
      }
    }
  }
});