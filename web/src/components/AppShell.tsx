'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { publicDocsUrl, publicExplorerUrl } from '@/lib/siteLinks';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Paths that use public/marketing chrome only (no workspace sidebar or slide-out dashboard nav).
 * Organizer/campaign workspace routes stay under the dashboard shell.
 */
const PUBLIC_FULL_WIDTH_PREFIXES: readonly string[] = [
  '/public_campaign_page',
  '/how_judging_works',
  '/integrations_hub',
  '/discord_bot_installation',
  '/telegram_bot_onboarding',
  '/404_not_found',
];

function isPublicFullWidthPath(pathname: string): boolean {
  return PUBLIC_FULL_WIDTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type NavItem = { href: string; label: string; icon: string };

const HOME_ITEM: NavItem = { href: '/', label: 'Home', icon: 'home' };

const CAMPAIGN_FLOW_PATHS = new Set([
  '/operator_dashboard',
  '/draft_campaigns',
  '/create_campaign_wizard',
]);

const SETTINGS_NAV: NavItem[] = [
  { href: '/integrations_hub', label: 'Integrations & bots', icon: 'hub' },
  { href: '/settings', label: 'Account settings', icon: 'settings' },
];

const CAMPAIGN_MENU_LINKS: { href: string; label: string; icon: string }[] = [
  { href: '/operator_dashboard', label: 'All campaigns', icon: 'lists' },
  { href: '/create_campaign_wizard', label: 'New campaign', icon: 'add_circle' },
  { href: '/draft_campaigns', label: 'Drafts', icon: 'folder_special' },
];

/** Demo inbox until notifications are backed by API / realtime. */
const HEADER_NOTIFICATIONS: { id: string; title: string; body: string; time: string }[] = [
  {
    id: '1',
    title: 'New submission',
    body: 'A participant submitted proof for your active bounty.',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Judging update',
    body: 'AI judges finished scoring round 3 — review results in campaign workspace.',
    time: 'Yesterday',
  },
  {
    id: '3',
    title: 'Treasury',
    body: 'Prize pool deposit confirmed on-chain.',
    time: '3d ago',
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isCampaignFlowPath(pathname: string): boolean {
  if (pathname === '/campaign' || pathname.startsWith('/campaign/')) return true;
  return CAMPAIGN_FLOW_PATHS.has(pathname);
}

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined text-[22px] shrink-0 ${className}`} aria-hidden>
      {name}
    </span>
  );
}

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 mt-5 mb-2 first:mt-0">{children}</p>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const [campaignsMenuOpen, setCampaignsMenuOpen] = React.useState(true);
  const isPublicSection = isPublicFullWidthPath(pathname);
  const showDesktopSidebar = pathname !== '/' && !isPublicSection;
  const hideSlideOutNav = pathname === '/' || isPublicSection;

  React.useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isCampaignFlowPath(pathname)) setCampaignsMenuOpen(true);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  React.useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen]);

  const renderCampaignsMenu = (onNavigate?: () => void) => {
    const flowActive = isCampaignFlowPath(pathname);
    return (
      <div
        className={`rounded-xl p-1 -mx-1 ${flowActive ? 'bg-surface-container-low/60' : ''}`}
        aria-label="Campaigns navigation"
      >
        <button
          type="button"
          onClick={() => setCampaignsMenuOpen((o) => !o)}
          className={`w-full flex items-center gap-3 min-h-[44px] px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
            flowActive
              ? 'bg-primary/10 text-primary shadow-[0_0_15px_-5px_rgba(107,56,212,0.2)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
          aria-expanded={campaignsMenuOpen}
        >
          <MaterialIcon name="campaign" />
          <span className="min-w-0 leading-snug text-left flex-1">Campaigns</span>
          <MaterialIcon
            name="expand_more"
            className={`!text-xl shrink-0 transition-transform duration-200 ${campaignsMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {campaignsMenuOpen ? (
          <div className="mt-1 ml-2 pl-3 border-l border-outline-variant/25 space-y-0.5 py-1">
            {CAMPAIGN_MENU_LINKS.map((item) => {
              const subActive = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={`flex items-center gap-2.5 min-h-[40px] px-3 rounded-lg text-sm font-medium transition-colors ${
                    subActive
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/80'
                  }`}
                >
                  <MaterialIcon name={item.icon} className="!text-[20px]" />
                  <span className="min-w-0 leading-snug">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const renderNavRow = (item: NavItem, onNavigate?: () => void, activeOverride?: boolean) => {
    const active = activeOverride !== undefined ? activeOverride : isActivePath(pathname, item.href);
    return (
      <Link
        key={item.href + item.label}
        href={item.href}
        onClick={() => onNavigate?.()}
        className={`w-full flex items-center gap-3 min-h-[44px] px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
          active
            ? 'bg-primary/10 text-primary shadow-[0_0_15px_-5px_rgba(107,56,212,0.2)]'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
        }`}
      >
        <MaterialIcon name={item.icon} />
        <span className="min-w-0 leading-snug">{item.label}</span>
        {active && <MaterialIcon name="chevron_right" className="ml-auto !text-lg shrink-0" />}
      </Link>
    );
  };

  const linksSection = (onNavigate?: () => void, includeJudging?: boolean) => (
    <div className="space-y-1 pt-4">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 mb-2">Links</p>
      {includeJudging && (
        <Link
          href="/how_judging_works"
          onClick={() => onNavigate?.()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <MaterialIcon name="gavel" />
          How judging works
        </Link>
      )}
      <a
        href={publicExplorerUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onNavigate?.()}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <MaterialIcon name="open_in_new" />
        Explorer
      </a>
      <a
        href={publicDocsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onNavigate?.()}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <MaterialIcon name="menu_book" />
        Docs / Learn
      </a>
    </div>
  );

  /** Logged-in style shell: no treasury/payout/public in sidebar — those are under Manage on a campaign. */
  const operatorNavBody = (onNavigate?: () => void) => (
    <>
      <div className="space-y-1">{renderNavRow(HOME_ITEM, onNavigate)}</div>
      <NavSectionLabel>Workspace</NavSectionLabel>
      <div className="space-y-1">{renderCampaignsMenu(onNavigate)}</div>
      <NavSectionLabel>Settings</NavSectionLabel>
      <div className="space-y-1">{SETTINGS_NAV.map((item) => renderNavRow(item, onNavigate))}</div>
      {linksSection(onNavigate, true)}
    </>
  );

  /** Landing menu: discovery + entry to operator campaigns (no duplicate Browse in sidebar when using app shell). */
  const marketingNavBody = (onNavigate?: () => void) => (
    <>
      <div className="space-y-1">{renderNavRow(HOME_ITEM, onNavigate)}</div>
      <NavSectionLabel>Discover</NavSectionLabel>
      <div className="space-y-1">
        {renderNavRow({ href: '/public_campaign_page', label: 'Browse campaigns', icon: 'travel_explore' }, onNavigate)}
      </div>
      <NavSectionLabel>For organizers</NavSectionLabel>
      <div className="space-y-1">{renderCampaignsMenu(onNavigate)}</div>
      <NavSectionLabel>Settings</NavSectionLabel>
      <div className="space-y-1">{SETTINGS_NAV.map((item) => renderNavRow(item, onNavigate))}</div>
      {linksSection(onNavigate, true)}
    </>
  );

  const navBody = (onNavigate?: () => void) => (showDesktopSidebar ? operatorNavBody(onNavigate) : marketingNavBody(onNavigate));

  return (
    <div className="min-h-screen flex bg-background text-on-surface">
      {showDesktopSidebar && (
        <aside className="hidden lg:flex flex-col w-72 min-w-72 border-r border-outline-variant/15 bg-surface-container-lowest p-6 sticky top-0 h-screen shrink-0">
          <Link
            href="/"
            className="mb-8 rounded-xl -m-1 p-1 w-fit hover:bg-surface-container-low/80 transition-colors font-headline font-black text-2xl tracking-tight text-on-surface"
          >
            Tippy.Fun
          </Link>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-0">{navBody()}</nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sm:h-20 border-b border-outline-variant/15 bg-background/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`p-2 rounded-xl hover:bg-surface-container-high text-on-surface transition-colors shrink-0 ${hideSlideOutNav ? 'hidden' : showDesktopSidebar ? 'lg:hidden' : ''}`}
              aria-label="Open menu"
            >
              <MaterialIcon name="menu" />
            </button>
            <Link
              href="/"
              className={`font-headline font-black text-lg sm:text-xl tracking-tight text-on-surface truncate hover:opacity-90 ${showDesktopSidebar ? 'lg:hidden' : ''}`}
            >
              Tippy.Fun
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {showDesktopSidebar && (
              <Link
                href="/public_campaign_page"
                className="text-sm font-semibold text-primary hover:text-primary-container transition-colors whitespace-nowrap"
              >
                Browse campaigns
              </Link>
            )}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low hover:border-outline-variant/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <MaterialIcon name="notifications" />
                {HEADER_NOTIFICATIONS.length > 0 ? (
                  <span
                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-sm ring-2 ring-surface-container-lowest"
                    aria-hidden
                  />
                ) : null}
              </button>
              {notifOpen ? (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-xl dark:border-outline-variant/40 dark:bg-surface-container-low"
                >
                  <div className="border-b border-outline-variant/20 px-4 py-3 dark:border-outline-variant/30">
                    <p className="font-headline text-sm font-bold text-on-surface">Notifications</p>
                    <p className="text-xs text-on-surface-variant">Recent activity</p>
                  </div>
                  <ul className="max-h-[min(50vh,20rem)] divide-y divide-outline-variant/15 overflow-y-auto dark:divide-outline-variant/25">
                    {HEADER_NOTIFICATIONS.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left transition-colors hover:bg-surface-container-high/60 dark:hover:bg-surface-container-high/40"
                          onClick={() => setNotifOpen(false)}
                        >
                          <p className="text-sm font-semibold text-on-surface">{n.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">{n.body}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-on-surface-variant/80">
                            {n.time}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-outline-variant/20 p-2 dark:border-outline-variant/30">
                    <Link
                      href="/settings/notifications"
                      className="flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
                      onClick={() => setNotifOpen(false)}
                    >
                      Notification settings
                      <MaterialIcon name="settings" className="!text-lg text-primary" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="hero-gradient text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Connect wallet
            </button>
          </div>
        </header>

        <div className="flex-1 w-full min-h-0 pb-24">{children}</div>
      </div>

      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-200 ease-out ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default w-full h-full"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
        <div
          className={`absolute inset-y-0 left-0 w-[min(20rem,100vw)] sm:w-72 max-w-full bg-surface-container-low shadow-xl border-r border-outline-variant/10 p-6 sm:p-8 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="font-headline font-black text-xl tracking-tight text-on-surface"
              onClick={() => setMenuOpen(false)}
            >
              Tippy.Fun
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
              aria-label="Close menu"
            >
              <MaterialIcon name="close" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-0">{navBody(() => setMenuOpen(false))}</nav>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[100] hidden lg:block transition-opacity duration-200 ease-out ${
          menuOpen && !showDesktopSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen || showDesktopSidebar}
      >
        <button
          type="button"
          className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default w-full h-full"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-full bg-surface-container-low shadow-xl border-r border-outline-variant/10 p-8 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen && !showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="font-headline font-black text-2xl tracking-tight text-on-surface" onClick={() => setMenuOpen(false)}>
              Tippy.Fun
            </Link>
            <button type="button" onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-surface-container-high transition-colors" aria-label="Close menu">
              <MaterialIcon name="close" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden">{navBody(() => setMenuOpen(false))}</nav>
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
}
