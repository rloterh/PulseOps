const fallbackSiteUrl = 'https://pulseops.app';

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) {
    return fallbackSiteUrl;
  }

  return configured.replace(/\/+$/, '');
}
