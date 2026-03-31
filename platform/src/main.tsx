import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './i18n';
import './styles/globals.css';

// Initialize theme from stored preference
const stored = localStorage.getItem('react-mastery-ui');
let theme = 'dark'; // default
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.theme) theme = state.theme;
  } catch { /* use default */ }
}
document.documentElement.classList.toggle('dark', theme === 'dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
