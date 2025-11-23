import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { App } from './App';

// Enable visual refresh theme before components load
globalThis[Symbol.for('awsui-visual-refresh-flag')] = () => true;

export function render(url) {
  const html = ReactDOMServer.renderToString(<App />);
  return html;
}