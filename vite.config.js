import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';

export default defineConfig({
  plugins: [react(), {
    name: 'serve-prerendered-routes',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname !== '/' && !url.pathname.endsWith('/') && existsSync(`dist${url.pathname}/index.html`)) {
          req.url = `${url.pathname}/${url.search}`;
        }
        next();
      });
    },
  }],
  server: { port: 5173 },
});
