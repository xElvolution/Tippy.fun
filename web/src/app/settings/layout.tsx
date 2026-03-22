import { SettingsSubnav } from '@/components/SettingsSubnav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-7xl mx-auto px-8 py-12 pb-16">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Settings</h1>
        <p className="text-on-surface-variant text-lg">
          Manage your identity, crypto assets, and preferences across the Tippy ecosystem.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside className="lg:col-span-3 space-y-2">
          <SettingsSubnav />
        </aside>
        <div className="lg:col-span-9 space-y-12">{children}</div>
      </div>
    </main>
  );
}
