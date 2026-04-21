import { Suspense } from 'react';
import { HomeClient } from '@/components/HomeClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant text-sm">Loading…</div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
