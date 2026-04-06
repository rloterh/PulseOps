import type { AppNavItem } from '@/features/shell/types/shell.types';

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    match: 'exact',
  },
  {
    label: 'Branches',
    href: '/branches',
    icon: 'branches',
    match: 'startsWith',
  },
  {
    label: 'Incidents',
    href: '/incidents',
    icon: 'incidents',
    match: 'startsWith',
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: 'jobs',
    match: 'startsWith',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: 'tasks',
    match: 'startsWith',
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: 'customers',
    match: 'startsWith',
  },
  {
    label: 'Team',
    href: '/team',
    icon: 'team',
    match: 'startsWith',
  },
  {
    label: 'Inbox',
    href: '/inbox',
    icon: 'inbox',
    match: 'startsWith',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'settings',
    match: 'startsWith',
  },
];

export function isNavItemActive(pathname: string, href: string, match = 'exact') {
  if (match === 'exact') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
