import type { Metadata } from 'next';

export function buildMarketingMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | PulseOps`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PulseOps`,
      description,
    },
  };
}
