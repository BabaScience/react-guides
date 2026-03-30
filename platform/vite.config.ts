import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'raw-file-server',
      configureServer(server) {
        server.middlewares.use('/raw', (req, res, next) => {
          const filePath = path.resolve(__dirname, '..', req.url!.slice(1));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const ext = path.extname(filePath);
            const mimeTypes: Record<string, string> = {
              '.tsx': 'text/plain',
              '.ts': 'text/plain',
              '.jsx': 'text/plain',
              '.js': 'text/plain',
              '.md': 'text/plain',
              '.json': 'application/json',
              '.css': 'text/plain',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(content);
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: ['..'],
    },
  },
});
