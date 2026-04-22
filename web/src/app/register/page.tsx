import type { Metadata } from 'next';
import { RegisterClient } from '@/components/RegisterClient';

export const metadata: Metadata = {
  title: 'Finish setup · TippyMaker',
  description:
    'Finish setting up your TippyMaker profile. Pick a display name and optionally link your Twitter and Discord accounts.',
};

export default function RegisterPage() {
  return <RegisterClient />;
}
