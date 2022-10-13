import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginChecker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginChecker({ typescript: true })],
});
