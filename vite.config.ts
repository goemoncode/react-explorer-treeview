import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  root: 'demo',
  base: '/react-explorer-treeview/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
