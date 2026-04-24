'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
  sidebarCollapsed: boolean;
  soundEnabled: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSound: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      soundEnabled: true,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    {
      name: 'kitco.ui',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
