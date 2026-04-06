import { beforeEach, describe, expect, it } from 'vitest';
import { useShellUiStore } from './shell-ui.store';

describe('useShellUiStore', () => {
  beforeEach(() => {
    useShellUiStore.setState({
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
      isDesktopSidebarCollapsed: false,
    });
  });

  it('toggles shell surfaces independently', () => {
    useShellUiStore.getState().openMobileNav();
    useShellUiStore.getState().toggleCommandPalette();
    useShellUiStore.getState().toggleNotifications();
    useShellUiStore.getState().toggleDesktopSidebar();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: true,
      isCommandPaletteOpen: true,
      isNotificationsOpen: true,
      isDesktopSidebarCollapsed: true,
    });
  });

  it('closes overlays explicitly', () => {
    useShellUiStore.getState().openMobileNav();
    useShellUiStore.getState().openCommandPalette();
    useShellUiStore.getState().openNotifications();

    useShellUiStore.getState().closeMobileNav();
    useShellUiStore.getState().closeCommandPalette();
    useShellUiStore.getState().closeNotifications();

    expect(useShellUiStore.getState()).toMatchObject({
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      isNotificationsOpen: false,
    });
  });
});
