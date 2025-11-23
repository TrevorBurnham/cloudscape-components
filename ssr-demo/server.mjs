import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collectStyles } from './collect-styles.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.get('/', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Invalidate module cache to ensure we get fresh modules
      const modulesToInvalidate = [
        '/ssr-demo/entry-server.jsx',
        '@cloudscape-design/components/app-layout/visual-refresh-toolbar'
      ];
      
      for (const mod of modulesToInvalidate) {
        const module = await vite.moduleGraph.getModuleByUrl(mod);
        if (module) {
          vite.moduleGraph.invalidateModule(module);
        }
      }
      
      // Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Load the server entry
      const { render } = await vite.ssrLoadModule('/ssr-demo/entry-server.jsx');

      // Render the app HTML
      const appHtml = await render(url);
      
      // Collect all CSS styles
      const styles = collectStyles();

      // Replace the placeholder with the app html and inject styles
      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace('</head>', `<style id="ssr-styles">${styles}</style></head>`);

      // Send the rendered HTML back
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(3000, () => {
    console.log('SSR server started at http://localhost:3000');
  });
}

createServer();