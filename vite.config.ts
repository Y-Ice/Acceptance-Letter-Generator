import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'copy-pwa-assets-and-serve',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const isPwaImage = url === '/logo.jpg' || url === '/icon-192.jpg' || url === '/icon-512.jpg';
            if (isPwaImage) {
              const imgPath = path.resolve('src/assets/images/app_logo_1782140083666.jpg');
              if (fs.existsSync(imgPath)) {
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(fs.readFileSync(imgPath));
                return;
              }
            }
            next();
          });
        },
        closeBundle() {
          try {
            const srcPath = path.resolve('src/assets/images/app_logo_1782140083666.jpg');
            const distDir = path.resolve('dist');
            if (fs.existsSync(srcPath)) {
              if (!fs.existsSync(distDir)) {
                fs.mkdirSync(distDir, { recursive: true });
              }
              fs.copyFileSync(srcPath, path.join(distDir, 'logo.jpg'));
              fs.copyFileSync(srcPath, path.join(distDir, 'icon-192.jpg'));
              fs.copyFileSync(srcPath, path.join(distDir, 'icon-512.jpg'));
              console.log('Successfully copied PWA app logo resources to /dist!');
            }
          } catch (e) {
            console.error('Failed to copy PWA assets in closeBundle:', e);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
