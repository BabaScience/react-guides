import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Initialize dark mode from stored preference
const stored = localStorage.getItem('react-mastery-ui');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    document.documentElement.classList.add('dark');
  }
} else {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
