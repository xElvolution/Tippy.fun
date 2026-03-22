'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: 'person' },
  { href: '/settings/socials', label: 'Socials', icon: 'group' },
  { href: '/settings/wallets', label: 'Wallets', icon: 'account_balance_wallet' },
  { href: '/settings/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/settings/appearance', label: 'Appearance', icon: 'palette' },
] as const;

export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1" aria-label="Settings sections">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              active
                ? 'bg-surface-container-low text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low group'
            }`}
          >
            <span
              className={`material-symbols-outlined ${active ? '' : 'text-slate-400 group-hover:text-primary transition-colors'}`}
              aria-hidden
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
