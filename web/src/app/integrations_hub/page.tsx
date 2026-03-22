// Automatically generated
import Link from 'next/link';

export default function IntegrationsHub() {
  return (
    <>

<main className="max-w-7xl mx-auto px-8 py-12 pb-16">
{/* Editorial Header */}
<header className="mb-16">
<h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">Integrations Hub</h1>
<p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Seamlessly connect your digital ecosystem. Manage authorization and synchronization across your preferred platforms to automate your Web3 campaigns.
            </p>
</header>
{/* Bento Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
{/* Featured Card: Discord (Connected) */}
<div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between group">
<div className="flex justify-between items-start">
<div className="flex items-center gap-6">
<div className="w-16 h-16 rounded-xl bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="forum">forum</span>
</div>
<div>
<div className="flex items-center gap-3 mb-1">
<h3 className="font-headline text-2xl font-bold">Discord</h3>
<span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Connected</span>
</div>
<p className="text-on-surface-variant">Syncing roles and community activity for 12,402 members.</p>
</div>
</div>
<Link href="/discord_bot_installation" className="inline-flex bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-medium transition-all hover:bg-surface-container-high">Set up / manage</Link>
</div>
<div className="mt-12 grid grid-cols-3 gap-6">
<div className="bg-surface-container-low p-4 rounded-lg">
<p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Active Guilds</p>
<p className="text-xl font-headline font-bold">04</p>
</div>
<div className="bg-surface-container-low p-4 rounded-lg">
<p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Last Sync</p>
<p className="text-xl font-headline font-bold">2m ago</p>
</div>
<div className="bg-surface-container-low p-4 rounded-lg">
<p className="text-xs text-on-surface-variant font-medium uppercase mb-1">API Health</p>
<p className="text-xl font-headline font-bold text-tertiary">99.8%</p>
</div>
</div>
</div>
{/* Wallet Card (Connected) */}
<div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between">
<div>
<div className="flex justify-between items-center mb-6">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-2xl" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Connected</span>
</div>
<h3 className="font-headline text-xl font-bold mb-2">MetaMask</h3>
<p className="text-on-surface-variant text-sm mb-6">Address: 0x71C...4f92</p>
</div>
<div className="space-y-4">
<div className="flex justify-between text-sm">
<span className="text-on-surface-variant">Balance</span>
<span className="font-bold">4.28 ETH</span>
</div>
<button className="w-full bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-medium transition-all hover:bg-surface-container-high">Disconnect</button>
</div>
</div>
{/* Telegram Card (Error State) */}
<div className="md:col-span-6 bg-surface-container-lowest rounded-xl p-8 border border-error/10">
<div className="flex justify-between items-start mb-8">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center">
<span className="material-symbols-outlined text-error text-2xl" data-icon="send">send</span>
</div>
<div>
<h3 className="font-headline text-xl font-bold">Telegram</h3>
<p className="text-error text-xs font-bold uppercase tracking-tighter">Connection Error</p>
</div>
</div>
</div>
<div className="bg-error-container/30 p-4 rounded-lg mb-8">
<p className="text-sm text-on-error-container flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="warning">warning</span>
                        Bot token has expired or was revoked.
                    </p>
</div>
<Link href="/telegram_bot_onboarding" className="editorial-gradient text-on-primary w-full py-4 rounded-xl font-bold active:scale-95 transition-all inline-flex items-center justify-center text-center">Telegram bot setup</Link>
</div>
{/* Slack Card (Not Connected) */}
<div className="md:col-span-6 bg-surface-container-low rounded-xl p-8 border border-dashed border-outline-variant">
<div className="flex justify-between items-start mb-8">
<div className="flex items-center gap-4 opacity-60">
<div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-2xl" data-icon="hub">hub</span>
</div>
<div>
<h3 className="font-headline text-xl font-bold">Slack</h3>
<p className="text-on-surface-variant text-xs font-bold uppercase">Not Connected</p>
</div>
</div>
</div>
<p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                    Automate notifications and reward distribution directly within your Slack workspace. Reach your team where they work.
                </p>
<button className="w-full bg-white text-on-surface px-6 py-4 rounded-xl font-bold shadow-sm transition-all hover:shadow-md border border-outline-variant/20">Connect Slack</button>
</div>
</div>
{/* Secondary Integrations Table */}
<section className="mt-20">
<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline text-3xl font-extrabold mb-2">Web3 Protocols</h2>
<p className="text-on-surface-variant">Manage technical protocol permissions and data feeds.</p>
</div>
</div>
<div className="overflow-hidden rounded-xl bg-surface-container-lowest">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high">
<th className="px-8 py-5 font-headline font-bold text-on-surface">Service</th>
<th className="px-8 py-5 font-headline font-bold text-on-surface">Category</th>
<th className="px-8 py-5 font-headline font-bold text-on-surface">Status</th>
<th className="px-8 py-5 font-headline font-bold text-on-surface text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-8 py-6">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-xl" data-icon="api">api</span>
</div>
<span className="font-semibold">Snapshot.org</span>
</div>
</td>
<td className="px-8 py-6 text-on-surface-variant text-sm">Governance</td>
<td className="px-8 py-6">
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                    Active
                                </span>
</td>
<td className="px-8 py-6 text-right">
<button className="text-primary font-bold text-sm hover:underline">Config</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-8 py-6">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-xl" data-icon="monitoring">monitoring</span>
</div>
<span className="font-semibold">The Graph</span>
</div>
</td>
<td className="px-8 py-6 text-on-surface-variant text-sm">Indexing</td>
<td className="px-8 py-6">
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dim/40 text-on-surface-variant text-xs font-bold uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                                    Disabled
                                </span>
</td>
<td className="px-8 py-6 text-right">
<button className="text-primary font-bold text-sm hover:underline">Enable</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-8 py-6">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-xl" data-icon="cloud_sync">cloud_sync</span>
</div>
<span className="font-semibold">IPFS Storage</span>
</div>
</td>
<td className="px-8 py-6 text-on-surface-variant text-sm">Storage</td>
<td className="px-8 py-6">
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                    Active
                                </span>
</td>
<td className="px-8 py-6 text-right">
<button className="text-primary font-bold text-sm hover:underline">Config</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-slate-50 dark:bg-slate-950 w-full border-t-0 mt-20">
<div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-center py-12 px-8 max-w-7xl mx-auto font-['Inter'] text-sm leading-relaxed">
<div>
<span className="text-lg font-bold text-slate-900 dark:text-white">Tippy.Fun</span>
<p className="text-slate-500 dark:text-slate-400 mt-2">© 2024 Tippy.Fun</p>
</div>
<div className="flex gap-8 mt-8 lg:mt-0">
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all opacity-100 hover:opacity-80 transition-opacity" href="/">Docs</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all opacity-100 hover:opacity-80 transition-opacity" href="/">Help</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all opacity-100 hover:opacity-80 transition-opacity" href="/">Legal</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all opacity-100 hover:opacity-80 transition-opacity" href="/">Socials</a>
</div>
</div>
</footer>

</>
  );
}
