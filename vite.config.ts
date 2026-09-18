import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function googleSheetsProxyPlugin(): Plugin {
  return {
    name: 'google-sheets-proxy',
    configureServer(server) {
      server.middlewares.use('/api/multiyear-sheets', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
          const id = parsedUrl.searchParams.get('id');
          const sheet = parsedUrl.searchParams.get('sheet');
          const tq = parsedUrl.searchParams.get('tq') || '';

          if (!id || !sheet) {
            res.statusCode = 400;
            res.end('Missing id or sheet parameter');
            return;
          }

          const targetUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}&tq=${encodeURIComponent(tq)}`;
          const response = await fetch(targetUrl);
          const csvText = await response.text();

          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(csvText);
        } catch (error: any) {
          res.statusCode = 500;
          res.end(error?.message || 'Proxy Error');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), googleSheetsProxyPlugin()],
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
