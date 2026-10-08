import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

// `__dirname` tidak tersedia di ESM dan sudah usang untuk config loader Vite.
const rootDir = fileURLToPath(new URL('.', import.meta.url));

// Path dasar aset. Host root (dev server, Vercel, Netlify, Cloudflare Pages)
// memakai '/', sedangkan GitHub Pages menyajikan dari subfolder /<nama-repo>/.
// Diatur lewat VITE_BASE_PATH agar satu repo bisa dipakai untuk keduanya.
const basePath = process.env.VITE_BASE_PATH || '/';

export default defineConfig(() => {
  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
