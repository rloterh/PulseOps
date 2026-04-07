import type { Metadata } from 'next';
import '@/styles/globals.css';
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
      <body>{children}</body>
    </html>
  );
}
