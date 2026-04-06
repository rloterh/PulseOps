'use client';

import { create } from 'zustand';

interface ShellUiState {
  activeBranchId: string | null;
  isMobileNavOpen: boolean;
  isCommandPaletteOpen: boolean;
  isNotificationsOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  setActiveBranchId: (branchId: string | null) => void;
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
  closeAllOverlays: () => void;
}

export const useShellUiStore = create<ShellUiState>((set) => ({
  activeBranchId: null,
  isMobileNavOpen: false,
  isCommandPaletteOpen: false,
  isNotificationsOpen: false,
  isDesktopSidebarCollapsed: false,
  setActiveBranchId: (branchId) => {
    set({ activeBranchId: branchId });
  },
  openMobileNav: () => {
    set({
      isMobileNavOpen: true,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
    });
  },
  closeMobileNav: () => {
    set({ isMobileNavOpen: false });
  },
  toggleMobileNav: () => {
    set((state) => ({
      isMobileNavOpen: !state.isMobileNavOpen,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
    }));
  },
  openCommandPalette: () => {
    set({
      isCommandPaletteOpen: true,
      isMobileNavOpen: false,
      isNotificationsOpen: false,
    });
  },
  closeCommandPalette: () => {
    set({ isCommandPaletteOpen: false });
  },
  toggleCommandPalette: () => {
    set((state) => ({
      isCommandPaletteOpen: !state.isCommandPaletteOpen,
      isMobileNavOpen: false,
      isNotificationsOpen: false,
    }));
  },
  openNotifications: () => {
    set({
      isNotificationsOpen: true,
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
    });
  },
  closeNotifications: () => {
    set({ isNotificationsOpen: false });
  },
  toggleNotifications: () => {
    set((state) => ({
      isNotificationsOpen: !state.isNotificationsOpen,
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
    }));
  },
  toggleDesktopSidebar: () => {
    set((state) => ({
      isDesktopSidebarCollapsed: !state.isDesktopSidebarCollapsed,
    }));
  },
  closeAllOverlays: () => {
    set({
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
    });
  },
}));
