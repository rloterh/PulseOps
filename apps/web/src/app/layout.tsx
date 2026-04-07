import type { Metadata } from 'next';
import '@/styles/globals.css';
import { FocusBoundary } from '@/components/system/focus-boundary';
import { LiveAnnouncer } from '@/components/system/live-announcer';
import { SkipLink } from '@/components/system/skip-link';
import { getSiteUrl } from '@/lib/site/get-site-url';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'PulseOps',
    template: '%s | PulseOps',
  },
  description: 'AI-powered operations command center for multi-location service businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <LiveAnnouncer />
        <FocusBoundary>{children}</FocusBoundary>
      </body>
    </html>
  );
}
