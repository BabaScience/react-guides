import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

export type Language = 'en' | 'it' | 'fr';

interface UIState {
  theme: 'light' | 'dark';
  language: Language;
  sidebarCollapsed: boolean;
  editorPanelSize: number;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setEditorPanelSize: (size: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      sidebarCollapsed: false,
      editorPanelSize: 50,
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setEditorPanelSize: (size) => set({ editorPanelSize: size }),
    }),
    { name: 'react-mastery-ui' }
  )
);
