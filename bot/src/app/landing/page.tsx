'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { LandingPage } from '@/components/LandingPage';

function LandingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authError = searchParams.get('error');
  const { status } = useSession();
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark',
  );

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleDiscordLogin = () =>
    signIn('discord', { callbackUrl: typeof window !== 'undefined' ? `${window.location.origin}/` : '/' });

  return (
    <LandingPage
      authError={authError}
      onDiscordLogin={handleDiscordLogin}
      theme={theme}
      toggleTheme={toggleTheme}
      openAppButton={status === 'authenticated' ? { label: 'Open app', onClick: () => router.push('/') } : undefined}
    />
  );
}

export default function LandingRoute() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant text-sm">Loading…</div>}
    >
      <LandingInner />
    </Suspense>
  );
}
