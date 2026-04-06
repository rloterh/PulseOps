'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@pulseops/utils';
import { APP_NAV_ITEMS, isNavItemActive } from '@/features/shell/constants/navigation';
import { AppIcon } from './app-icon';

export function AppSidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {APP_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.match);
        const navigationHandler = onNavigate
          ? () => {
              onNavigate();
            }
          : undefined;

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            {...(navigationHandler ? { onClick: navigationHandler } : {})}
            className={cn(
              'group flex items-center gap-3 rounded-[1.2rem] px-3 py-3 text-sm transition duration-150',
              active
                ? 'bg-white text-neutral-950 shadow-[0_20px_40px_rgba(15,23,42,0.18)]'
                : 'text-white/68 hover:bg-white/8 hover:text-white',
              collapsed && 'justify-center px-2.5',
            )}
          >
            <AppIcon
              name={item.icon}
              className={cn(active ? 'text-neutral-950' : 'text-white/62')}
            />
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.label}</p>
                {item.badgeCount ? (
                  <p className={cn('mt-0.5 text-xs', active ? 'text-neutral-500' : 'text-white/40')}>
                    {item.badgeCount} new items
                  </p>
                ) : null}
              </div>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
