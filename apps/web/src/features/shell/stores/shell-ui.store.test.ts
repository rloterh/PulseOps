import { beforeEach, describe, expect, it } from 'vitest';
import { useShellUiStore } from './shell-ui.store';

describe('useShellUiStore', () => {
  beforeEach(() => {
    useShellUiStore.setState({
      activeBranchId: null,
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
      isDesktopSidebarCollapsed: false,
    });
  });

  it('keeps overlays exclusive while leaving the desktop sidebar independent', () => {
    useShellUiStore.getState().openMobileNav();
    useShellUiStore.getState().toggleCommandPalette();
    useShellUiStore.getState().toggleNotifications();
    useShellUiStore.getState().toggleDesktopSidebar();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: true,
      isDesktopSidebarCollapsed: true,
    });
  });

  it('closes competing overlays when a new shell surface opens', () => {
    useShellUiStore.getState().openMobileNav();
    useShellUiStore.getState().openNotifications();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: false,
      isNotificationsOpen: true,
      isCommandPaletteOpen: false,
    });

    useShellUiStore.getState().openCommandPalette();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: false,
      isNotificationsOpen: false,
      isCommandPaletteOpen: true,
    });
  });

  it('closes overlays explicitly', () => {
    useShellUiStore.getState().openMobileNav();
    useShellUiStore.getState().openCommandPalette();
    useShellUiStore.getState().openNotifications();

    useShellUiStore.getState().closeAllOverlays();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
    });
  });

  it('tracks the selected branch at shell level', () => {
    useShellUiStore.getState().setActiveBranchId('branch_2');

    expect(useShellUiStore.getState().activeBranchId).toBe('branch_2');
  });
});
