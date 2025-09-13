import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of CSS files needed for the components we're using
const cssFiles = [
  // Core styles
  'internal/base-component/styles.scoped.css',
  
  // App Layout and toolbar
  'app-layout/styles.scoped.css',
  'app-layout/visual-refresh/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/skeleton/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/toolbar/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/navigation/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/notifications/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/drawer/styles.scoped.css',
  'app-layout/visual-refresh-toolbar/toolbar/trigger-button/styles.scoped.css',
  'app-layout/drawer/styles.scoped.css',
  'app-layout/mobile-toolbar/styles.scoped.css',
  'app-layout/toggles/styles.scoped.css',
  'app-layout/content-wrapper/styles.scoped.css',
  
  // Breadcrumbs
  'breadcrumb-group/styles.scoped.css',
  'breadcrumb-group/item/styles.scoped.css',
  
  // Top Navigation
  'top-navigation/styles.scoped.css',
  
  // Side Navigation
  'side-navigation/styles.scoped.css',
  
  // Container
  'container/styles.scoped.css',
  
  // Header
  'header/styles.scoped.css',
  
  // Button
  'button/styles.scoped.css',
  
  // Space Between
  'space-between/styles.scoped.css',
  
  // Icon
  'icon/styles.scoped.css',
  
  // Link
  'link/styles.scoped.css',
  
  // Button Dropdown
  'button-dropdown/styles.scoped.css',
  
  // Internal components
  'internal/components/dropdown/styles.scoped.css',
  'internal/components/option/styles.scoped.css',
  'internal/components/portal/styles.scoped.css',
  
  // Expandable Section (for side nav)
  'expandable-section/styles.scoped.css',
  
  // Box (internal component)
  'box/styles.scoped.css',
];

export function collectStyles() {
  let combinedCSS = '';
  
  for (const cssFile of cssFiles) {
    const filePath = path.join(__dirname, '..', 'lib', 'components', cssFile);
    try {
      if (fs.existsSync(filePath)) {
        const css = fs.readFileSync(filePath, 'utf-8');
        combinedCSS += `/* ${cssFile} */\n${css}\n\n`;
      } else {
        console.warn(`CSS file not found: ${cssFile}`);
      }
    } catch (error) {
      console.warn(`Error reading CSS file ${cssFile}:`, error.message);
    }
  }
  
  return combinedCSS;
}