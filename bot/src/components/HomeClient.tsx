'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  History as HistoryIcon,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Rocket,
  Sun,
  Moon,
  ExternalLink,
  MessageCircle,
  Twitter,
  BookOpen,
} from 'lucide-react';
import {
  publicCommunityDiscordUrl,
  publicExplorerHomeUrl,
  publicConfluxXUrl,
  publicLearnUrl,
} from '@/lib/publicSiteLinks';
import { TippyLogoLink } from './TippyLogoLink';
import { NotificationsMenu } from './NotificationsMenu';
import { LandingPage } from './LandingPage';
import { Dashboard, type MeDashboardData } from './Dashboard';
import { HistoryPage } from './HistoryPage';
import { OwnerConsole } from './OwnerConsole';
import { HelpPage } from './HelpPage';
import { WithdrawModal } from './WithdrawModal';
import { DepositModal } from './DepositModal';
import { Button, Card } from './UI';

type Page = 'dashboard' | 'history' | 'console' | 'help' | 'settings';

function viewParamToPage(view: string | null): Page | null {
  if (!view) return null;
  const v = view.toLowerCase();
  if (v === 'activity' || v === 'history') return 'history';
  if (v === 'dashboard') return 'dashboard';
  if (v === 'console') return 'console';
  if (v === 'help') return 'help';
  if (v === 'settings') return 'settings';
  return null;
}

function pageToViewParam(p: Page): string | null {
  if (p === 'dashboard') return null;
  if (p === 'history') return 'activity';
  return p;
}

export function HomeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = React.useState<Page>(
    () => viewParamToPage(searchParams.get('view')) ?? 'dashboard',
  );
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [meDashboard, setMeDashboard] = React.useState<MeDashboardData | null>(null);
  const [meLoading, setMeLoading] = React.useState(true);
  const [meError, setMeError] = React.useState<string | null>(null);

  const handleDiscordLogin = () =>
    signIn('discord', { callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/' });
  const handleLogout = () => {
    const home = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
    void signOut({ callbackUrl: home });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  };

  const loadDashboard = React.useCallback(() => {
    setMeLoading(true);
    setMeError(null);
    fetch('/api/me/dashboard')
      .then(async (res) => {
        const json = (await res.json()) as MeDashboardData & { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
        return json as MeDashboardData;
      })
      .then(setMeDashboard)
      .catch((e: Error) => setMeError(e.message))
      .finally(() => setMeLoading(false));
  }, []);

  React.useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    loadDashboard();
  }, [status, session?.user?.id, loadDashboard]);

  React.useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    const p = viewParamToPage(searchParams.get('view'));
    setCurrentPage(p ?? 'dashboard');
  }, [status, session?.user, searchParams]);

  const goToPage = React.useCallback(
    (p: Page) => {
      setCurrentPage(p);
      const next = new URLSearchParams(searchParams.toString());
      const v = pageToViewParam(p);
      if (v) next.set('view', v);
      else next.delete('view');
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-on-surface">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant">Checking session…</p>
      </div>
    );
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <LandingPage
        authError={authError}
        onDiscordLogin={handleDiscordLogin}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  const user = session.user;
  const displayName = user.name ?? user.email ?? 'Discord user';
  const avatarSrc = user.image ?? 'https://cdn.discordapp.com/embed/avatars/0.png';

  const dashboardProps = {
    data: meDashboard,
    loading: meLoading,
    loadError: meError,
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as const, label: 'Activity', icon: HistoryIcon },
    { id: 'console' as const, label: 'Console', icon: Rocket },
    { id: 'help' as const, label: 'Help', icon: HelpCircle },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onWithdraw={() => setIsWithdrawOpen(true)}
            onDeposit={() => setIsDepositOpen(true)}
            onRefresh={loadDashboard}
            {...dashboardProps}
          />
        );
      case 'history':
        return <HistoryPage />;
      case 'console':
        return <OwnerConsole />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-12">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Settings</h1>
            <Card className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-headline">Appearance</h3>
                  <p className="text-xs text-on-surface-variant">Switch between light and dark themes</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 bg-surface-container-highest p-1 rounded-xl border border-outline-variant/20"
                >
                  <div
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      theme === 'light' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant'
                    }`}
                  >
                    Light
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      theme === 'dark' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant'
                    }`}
                  >
                    Dark
                  </div>
                </button>
              </div>
              <div className="h-[1px] bg-outline-variant/10" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-headline">Discord Notifications</h3>
                  <p className="text-xs text-on-surface-variant">Get notified when you receive a tip</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-on-primary rounded-full" />
                </div>
              </div>
              <div className="h-[1px] bg-outline-variant/10" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-headline">Privacy Mode</h3>
                  <p className="text-xs text-on-surface-variant">Hide your balance from public leaderboards</p>
                </div>
                <div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full" />
                </div>
              </div>
            </Card>
            <Button variant="error" className="w-full" onClick={handleLogout}>
              <LogOut size={18} />
              Log out
            </Button>
          </div>
        );
      default:
        return (
          <Dashboard
            onWithdraw={() => setIsWithdrawOpen(true)}
            onDeposit={() => setIsDepositOpen(true)}
            onRefresh={loadDashboard}
            {...dashboardProps}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-72 border-r border-outline-variant/10 bg-surface-container-lowest p-8 sticky top-0 h-screen">
        <TippyLogoLink
          markSize={40}
          wordmarkClassName="font-headline font-black text-2xl tracking-tighter text-on-surface"
          className="mb-12 rounded-xl -m-1 p-1 w-fit hover:bg-surface-container-low/60 transition-colors"
          priority
        />

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToPage(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-primary/15 text-primary shadow-[0_0_18px_-4px_rgb(132_85_239_/_0.28)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {currentPage === item.id && (
                <motion.div layoutId="activeNav" className="ml-auto">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 space-y-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 mb-2">Links</p>
          <a
            href={publicExplorerHomeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <ExternalLink size={18} />
            Conflux explorer
          </a>
          <a
            href={publicLearnUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <BookOpen size={18} />
            Learn
          </a>
          <a
            href={publicCommunityDiscordUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <MessageCircle size={18} />
            Discord
          </a>
          <a
            href={publicConfluxXUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Twitter size={18} />
            Conflux on X
          </a>
        </div>

        <div className="pt-8 border-t border-outline-variant/10 space-y-4">
          <button
            type="button"
            onClick={() => goToPage('settings')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              currentPage === 'settings' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <LayoutDashboard size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Discord</span>
                <span className="text-xs font-mono font-bold text-on-surface truncate max-w-[9rem]" title={user.id}>
                  {displayName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              CONFLUX
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-outline-variant/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:hidden">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-surface-container-high rounded-lg">
              <Menu size={24} />
            </button>
            <TippyLogoLink
              markSize={32}
              wordmarkClassName="font-headline font-black text-xl tracking-tighter text-on-surface"
              className="rounded-md hover:opacity-90"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-all active:scale-90"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <NotificationsMenu onOpenActivity={() => goToPage('history')} />
            <div className="h-8 w-[1px] bg-outline-variant/20 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end min-w-0">
                <span className="text-sm font-bold text-on-surface truncate max-w-[10rem]">{displayName}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Discord</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt="" className="w-10 h-10 rounded-xl border-2 border-primary/20 object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute inset-y-0 left-0 w-80 bg-surface-container-low p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <TippyLogoLink
                  markSize={36}
                  wordmarkClassName="font-headline font-black text-2xl tracking-tighter text-on-surface"
                  className="rounded-md hover:opacity-90"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-surface-container-high rounded-lg">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      goToPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-lg ${
                      currentPage === item.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    <item.icon size={24} />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="space-y-2 pt-4 border-t border-outline-variant/10">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4">Links</p>
                <a
                  href={publicExplorerHomeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ExternalLink size={20} />
                  <span className="font-medium">Conflux explorer</span>
                </a>
                <a
                  href={publicLearnUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen size={20} />
                  <span className="font-medium">Learn</span>
                </a>
                <a
                  href={publicCommunityDiscordUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">Discord</span>
                </a>
                <a
                  href={publicConfluxXUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Twitter size={20} />
                  <span className="font-medium">Conflux on X</span>
                </a>
              </div>
              <Button variant="error" className="mt-auto" onClick={handleLogout}>
                <LogOut size={18} />
                Log out
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableCfxHuman={meDashboard?.cfxBalance ?? '0'}
        onSuccess={() => loadDashboard()}
      />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        address={meDashboard?.evmAddress ?? '-'}
      />
    </div>
  );
}
