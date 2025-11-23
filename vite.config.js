import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to handle .css.js imports when using source files
const cssJsPlugin = {
  name: 'css-js-handler',
  resolveId(source, importer) {
    if (source.endsWith('.css.js')) {
      // Try to resolve to the built CSS file
      if (importer && importer.includes('/src/')) {
        const relativePath = importer.replace(/.*\/src\//, '');
        const componentPath = path.dirname(relativePath);
        const cssFileName = path.basename(source);
        const builtCssPath = path.join(__dirname, 'lib/components', componentPath, cssFileName);
        
        if (fs.existsSync(builtCssPath)) {
          return builtCssPath;
        }
      }
      // Fallback: return empty module for missing CSS files
      return source;
    }
  },
  load(id) {
    if (id.endsWith('.css.js') && !fs.existsSync(id)) {
      // Return an empty CSS module object for missing files
      return 'export default {};';
    }
  }
};

export default defineConfig({
  plugins: [react(), cssJsPlugin],
  optimizeDeps: {
    // Force Vite to pre-bundle these dependencies
    include: [
      '@cloudscape-design/component-toolkit',
      '@cloudscape-design/collection-hooks',
      '@cloudscape-design/theming-runtime'
    ],
    esbuildOptions: {
      // This is important for handling TypeScript type imports
      tsconfig: './tsconfig.json'
    }
  },
  resolve: {
    alias: {
      '@cloudscape-design/components': path.resolve(__dirname, 'lib/components'),
      // Map environment imports (still use built version for constants)
      '../environment': path.resolve(__dirname, 'lib/components/internal/environment.js'),
      '../../environment': path.resolve(__dirname, 'lib/components/internal/environment.js'),
      '../internal/environment': path.resolve(__dirname, 'lib/components/internal/environment.js'),
      './environment': path.resolve(__dirname, 'lib/components/internal/environment.js'),
      'src/internal/environment': path.resolve(__dirname, 'lib/components/internal/environment.js'),
      // Map generated token imports
      '../internal/generated/styles/tokens': path.resolve(__dirname, 'lib/components/internal/generated/styles/tokens.js'),
    },
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: [
      '@cloudscape-design/components',
      '@cloudscape-design/component-toolkit',
      '@cloudscape-design/collection-hooks',
      '@cloudscape-design/theming-runtime',
    ],
  },
  build: {
    ssr: true,
  },
});