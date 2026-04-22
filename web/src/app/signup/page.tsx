import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupClient } from '@/components/SignupClient';

export const metadata: Metadata = {
  title: 'Sign up · TippyMaker',
  description:
    'Sign up to TippyMaker to launch on-chain Discord and Telegram tipping campaigns on Conflux eSpace.',
};

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupClient />
    </Suspense>
  );
}
