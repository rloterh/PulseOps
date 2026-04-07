import { LoadingState } from '@/components/system/loading-state';

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <LoadingState
        title="Loading PulseOps"
        description="The app shell is preparing the next screen and syncing the latest workspace context."
      />
    </main>
  );
}
