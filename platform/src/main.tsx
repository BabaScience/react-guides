import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import i18n, { UI_STORE_KEY } from './i18n';
import { DEFAULT_THEME } from './store/ui-store';
import './styles/globals.css';

/**
 * Apply the stored theme before the first paint, otherwise a dark-mode reader
 * gets a flash of the light page while React boots. Reads localStorage
 * directly for the same reason — the store hasn't hydrated yet.
 *
 * The default lives in ui-store (DEFAULT_THEME) so the two can't drift.
 */
function applyStoredTheme() {
  let theme: string = DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(UI_STORE_KEY);
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.theme === 'light' || state?.theme === 'dark') theme = state.theme;
    }
  } catch {
    /* fall back to the default */
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

applyStoredTheme();
// i18n sets <html lang> on init and on every language change.
void i18n;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
