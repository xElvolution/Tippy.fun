import type { Metadata } from 'next';
import { SignupClient } from '@/components/SignupClient';

export const metadata: Metadata = {
  title: 'Sign up · TippyMaker',
  description:
    'Sign up to TippyMaker to launch on-chain Discord and Telegram tipping campaigns on Conflux eSpace.',
};

export default function SignupPage() {
  return <SignupClient />;
}
