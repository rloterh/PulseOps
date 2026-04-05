import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SettingsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Dashboard"
      title="Settings module placeholder"
      description="Settings stays separate from billing and operations domains so later permissions remain easier to reason about."
    />
  );
}
