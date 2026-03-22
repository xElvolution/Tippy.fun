// Automatically generated
import Link from 'next/link';

export default function CreateCampaignWizard() {
  return (
    <>

<main className="max-w-4xl mx-auto px-6 py-12 pb-16">
<Link href="/operator_dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-8">
<span className="material-symbols-outlined text-lg" aria-hidden>
            arrow_back
          </span>
          Back to Campaigns
        </Link>
{/* Editorial Header */}
<header className="mb-12">
<h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">Launch your vision.</h1>
<p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
                Transform your community engagement with a structured on-chain campaign. Follow the steps below to fund and broadcast your next big thing.
            </p>
</header>
{/* Progressive Stepper */}
<div className="mb-12 flex items-center justify-between">
<div className="flex items-center gap-4 group">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
<span className="font-headline font-semibold text-primary">Basics</span>
</div>
<div className="flex-1 h-px bg-outline-variant/30 mx-4"></div>
<div className="flex items-center gap-4 opacity-40">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">2</div>
<span className="font-headline font-semibold">Channel</span>
</div>
<div className="flex-1 h-px bg-outline-variant/30 mx-4"></div>
<div className="flex items-center gap-4 opacity-40">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
<span className="font-headline font-semibold">Prizes</span>
</div>
<div className="flex-1 h-px bg-outline-variant/30 mx-4"></div>
<div className="flex items-center gap-4 opacity-40">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">4</div>
<span className="font-headline font-semibold">Funding</span>
</div>
</div>
{/* Wizard Canvas */}
<div className="space-y-8">
{/* Step 1: Basics Card (Expanded) */}
<section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)]">
<div className="flex items-start justify-between mb-8">
<div>
<h2 className="text-2xl font-headline font-bold mb-1">Campaign Fundamentals</h2>
<p className="text-on-surface-variant text-sm">Define the hook and story of your campaign.</p>
</div>
<span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active Step</span>
</div>
<div className="grid grid-cols-1 gap-8">
<div className="space-y-2">
<label className="block text-sm font-semibold text-on-surface ml-1">Campaign Title</label>
<input className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50" placeholder="e.g. Meme Masterclass 2024" type="text"/>
</div>
<div className="space-y-2">
<label className="block text-sm font-semibold text-on-surface ml-1">Mission Description</label>
<textarea className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50" placeholder="Describe what participants need to do to win..." rows={4}></textarea>
</div>
</div>
</section>
{/* Step 2: Channel (Progressive Disclosure) */}
<section className="bg-surface-container-low rounded-xl p-8 transition-all hover:bg-surface-container transition-all">
<div className="flex items-center gap-6">
<div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm">
<span className="material-symbols-outlined text-primary" data-icon="hub">hub</span>
</div>
<div>
<h3 className="text-xl font-headline font-bold">Submission Channel</h3>
<p className="text-on-surface-variant text-sm">Where will users submit their work?</p>
</div>
</div>
{/* Dynamic Content for Discord */}
<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="space-y-4">
<div className="grid grid-cols-2 gap-4">
<button className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-lowest border-2 border-primary ring-4 ring-primary-fixed text-primary transition-all">
<span className="material-symbols-outlined mb-2 text-3xl" data-icon="discord">chat</span>
<span className="font-bold">Discord</span>
</button>
<button className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:border-outline-variant border-2 border-transparent transition-all">
<span className="material-symbols-outlined mb-2 text-3xl" data-icon="send">send</span>
<span className="font-bold">Telegram</span>
</button>
</div>
</div>
{/* Discord Helper Panel */}
<div className="bg-white/50 rounded-xl p-6 border-l-4 border-primary">
<h4 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl" data-icon="settings_suggest">settings_suggest</span>
                            Discord Setup Guide
                        </h4>
<ul className="space-y-4">
<li className="flex items-center justify-between group cursor-pointer">
<span className="text-sm text-on-surface-variant flex items-center gap-3">
<span className="w-5 h-5 rounded-full bg-tertiary-container flex items-center justify-center text-[10px] text-on-tertiary-container">
<span className="material-symbols-outlined" data-icon="check" >check</span>
</span>
                                    Invite Tippy Bot
                                </span>
<span className="text-xs text-primary font-bold hover:underline">Invite Link</span>
</li>
<li className="flex items-center justify-between group cursor-pointer">
<span className="text-sm text-on-surface-variant flex items-center gap-3">
<span className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center text-[10px]">2</span>
                                    Select Server
                                </span>
<span className="material-symbols-outlined text-outline-variant text-sm" data-icon="expand_more">expand_more</span>
</li>
<li className="flex items-center justify-between group cursor-pointer">
<span className="text-sm text-on-surface-variant flex items-center gap-3">
<span className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center text-[10px]">3</span>
                                    Designated Channel
                                </span>
<span className="material-symbols-outlined text-outline-variant text-sm" data-icon="add">add</span>
</li>
<li className="pt-4 mt-4 border-t border-outline-variant/20">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-amber-500 text-sm" data-icon="checklist">checklist</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Permissions Checklist</span>
</div>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-medium text-on-secondary-container">View Channel</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-medium text-on-secondary-container">Read History</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-medium text-on-secondary-container">Add Reactions</span>
</div>
</li>
</ul>
</div>
</div>
</section>
{/* Step 3: Judging & Prizes */}
<section className="bg-surface-container-low rounded-xl p-8">
<div className="flex items-center gap-6">
<div className="bg-surface-container-lowest p-3 rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="workspace_premium">workspace_premium</span>
</div>
<div>
<h3 className="text-xl font-headline font-bold">Judging &amp; Prizes</h3>
<p className="text-on-surface-variant text-sm">How will winners be decided?</p>
</div>
</div>
</section>
{/* Step 4: Funding (Preview) */}
<section className="bg-surface-container-low rounded-xl p-8">
<div className="flex items-center gap-6">
<div className="bg-surface-container-lowest p-3 rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<div>
<h3 className="text-xl font-headline font-bold">Treasury &amp; Funding</h3>
<p className="text-on-surface-variant text-sm">Secure the prize pool on-chain.</p>
</div>
</div>
</section>
</div>
{/* Footer Actions */}
<footer className="mt-12 flex items-center justify-between bg-surface-container-lowest p-6 rounded-2xl shadow-lg">
<button className="text-on-surface-variant font-semibold px-6 py-3 hover:bg-surface-container-low rounded-xl transition-all">
                Save Draft
            </button>
<div className="flex items-center gap-4">
<button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold text-lg active:scale-95 duration-200 shadow-xl shadow-primary/20">
                    Next: Judging Rules
                </button>
</div>
</footer>
</main>
{/* Global Footer */}
<footer className="bg-slate-50 dark:bg-slate-950 w-full border-t-0 mt-20">
<div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-center py-12 px-8 max-w-7xl mx-auto font-['Inter'] text-sm leading-relaxed">
<div className="text-lg font-bold text-slate-900 dark:text-white mb-6 lg:mb-0">
                Tippy.Fun
            </div>
<div className="flex flex-wrap gap-8">
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all" href="/">How it Works</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all" href="/">Support</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all" href="/">Telegram Bot</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all" href="/">Discord Bot</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all" href="/">On-chain Explorer</a>
</div>
<div className="mt-8 lg:mt-0 text-slate-500">
                © 2024 Tippy.Fun
            </div>
</div>
</footer>

</>
  );
}
