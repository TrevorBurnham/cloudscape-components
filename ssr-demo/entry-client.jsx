import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

// Enable visual refresh theme before components load
globalThis[Symbol.for('awsui-visual-refresh-flag')] = () => true;

ReactDOM.hydrate(<App />, document.getElementById('app'));