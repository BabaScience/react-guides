import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n, { UI_STORE_KEY, type SupportedLang } from '@/i18n';
import type { Track } from '@/types/exercise';

export type Language = SupportedLang;

/** Bump when the persisted shape changes, and add a `migrate` branch for it. */
const UI_STORE_VERSION = 1;

/** "Paper & ink" (DESIGN_SYSTEM.md §9): light is the default theme. */
export const DEFAULT_THEME: 'light' | 'dark' = 'light';

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
      theme: DEFAULT_THEME,
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
    {
      name: UI_STORE_KEY,
      version: UI_STORE_VERSION,
      // Without a version, zustand merges whatever shape it finds in
      // localStorage into the current state — so any future rename silently
      // resurrects a stale field instead of migrating it.
      migrate: (persisted, version) => {
        if (version === 0) {
          // v0 had no version stamp. Nothing structural changed; the stamp is
          // what lets later migrations know where they are starting from.
          return persisted as UIState;
        }
        return persisted as UIState;
      },
    }
  )
);
