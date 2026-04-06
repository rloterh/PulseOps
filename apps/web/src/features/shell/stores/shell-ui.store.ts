'use client';

import { create } from 'zustand';

interface ShellUiState {
  isMobileNavOpen: boolean;
  isCommandPaletteOpen: boolean;
  isNotificationsOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  toggleDesktopSidebar: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  isMobileNavOpen: false,
  isCommandPaletteOpen: false,
  isNotificationsOpen: false,
  isDesktopSidebarCollapsed: false,
  openMobileNav: () => {
    set({ isMobileNavOpen: true });
  },
  closeMobileNav: () => {
    set({ isMobileNavOpen: false });
  },
  toggleMobileNav: () => {
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen }));
  },
  openCommandPalette: () => {
    set({ isCommandPaletteOpen: true });
  },
  closeCommandPalette: () => {
    set({ isCommandPaletteOpen: false });
  },
  toggleCommandPalette: () =>
    {
      set((state) => ({
        isCommandPaletteOpen: !state.isCommandPaletteOpen,
      }));
    },
  openNotifications: () => {
    set({ isNotificationsOpen: true });
  },
  closeNotifications: () => {
    set({ isNotificationsOpen: false });
  },
  toggleNotifications: () =>
    {
      set((state) => ({
        isNotificationsOpen: !state.isNotificationsOpen,
      }));
    },
  toggleDesktopSidebar: () =>
    {
      set((state) => ({
        isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed,
      }));
    },
}));
