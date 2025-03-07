'use client';

import { create } from 'zustand';

type MenuState = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useMenuState = create<MenuState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
})); 