import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterClient } from '@/components/RegisterClient';

export const metadata: Metadata = {
  title: 'Finish setup · TippyMaker',
  description:
    'Finish setting up your TippyMaker profile. Pick a display name and optionally link your Twitter and Discord accounts.',
};

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
