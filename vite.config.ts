import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),          // Enables Vue support
    vueDevTools()   // Enables Vue DevTools integration
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // Alias '@' maps to '/src' for simpler imports
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // No additional global SCSS config needed
      },
    },
  },
});
