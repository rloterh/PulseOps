import { cn } from '@pulseops/utils';

type AppIconName =
  | 'dashboard'
  | 'branches'
  | 'incidents'
  | 'jobs'
  | 'tasks'
  | 'customers'
  | 'team'
  | 'inbox'
  | 'settings'
  | 'menu'
  | 'search'
  | 'bell'
  | 'close'
  | 'chevron-down'
  | 'chevrons-up-down'
  | 'spark'
  | 'logout';

const iconPaths: Record<AppIconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </>
  ),
  branches: (
    <>
      <path d="M12 21s-5.5-5.1-5.5-10.2A5.5 5.5 0 0 1 17.5 10.8C17.5 15.9 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.25" />
    </>
  ),
  incidents: (
    <>
      <path d="M12 4 4 19h16L12 4Z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  jobs: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  tasks: (
    <>
      <rect x="5" y="4.5" width="14" height="15" rx="3" />
      <path d="M8.5 8.5h7M8.5 12h4.5M8.5 15.5h6" />
      <path d="M15.5 4.5v-1h-7v1" />
    </>
  ),
  customers: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2.5" />
      <path d="M8 18v2M16 18v2M8 10h8M8 14h5" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16.5" cy="10.5" r="2.5" />
      <path d="M4.5 19a4.5 4.5 0 0 1 9 0M14 19a3.5 3.5 0 0 1 7 0" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 14h4l2 2h4l2-2h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3.5v2.25M12 18.25v2.25M5.98 5.98l1.6 1.6M16.42 16.42l1.6 1.6M3.5 12h2.25M18.25 12h2.25M5.98 18.02l1.6-1.6M16.42 7.58l1.6-1.6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M7.5 9.5a4.5 4.5 0 1 1 9 0c0 4 1.5 5.5 2.5 6H5c1-0.5 2.5-2 2.5-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevrons-up-down': (
    <>
      <path d="m8 9 4-4 4 4" />
      <path d="m8 15 4 4 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </>
  ),
};

export function AppIcon({
  name,
  className,
}: {
  name: AppIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}
