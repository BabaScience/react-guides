import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';
import type { Track } from '@/types/exercise';

export type Language = 'en' | 'it' | 'fr';

interface UIState {
  theme: 'light' | 'dark';
  language: Language;
  sidebarCollapsed: boolean;
  editorPanelSize: number;
  activeTrack: Track;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setEditorPanelSize: (size: number) => void;
  setActiveTrack: (track: Track) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // "Paper & ink" (DESIGN_SYSTEM.md §9): light is the default theme.
      theme: 'light',
      language: 'en',
      sidebarCollapsed: false,
      editorPanelSize: 50,
      activeTrack: 'react' as Track,
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
      setActiveTrack: (track) => set({ activeTrack: track }),
    }),
    { name: 'react-mastery-ui' }
  )
);
