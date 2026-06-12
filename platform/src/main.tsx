import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './i18n';
import './styles/globals.css';

// Initialize theme from stored preference.
// "Paper & ink" (DESIGN_SYSTEM.md §9): light is the default theme.
const stored = localStorage.getItem('react-mastery-ui');
let theme = 'light'; // default — keep in sync with ui-store
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
