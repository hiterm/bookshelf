import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginChecker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [react(), vitePluginChecker({ typescript: true })],
});
