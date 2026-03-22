// Automatically generated
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { SiteFooter } from '@/components/SiteFooter';
import { ExploreBountyCard } from '@/components/ExploreBountyCard';
import { PUBLIC_CAMPAIGNS } from '@/lib/publicCampaigns';

export default function LandingPage() {
  return (
    <>

{/* Hero Section */}
<section className="relative pt-20 pb-32 px-8 overflow-hidden">
<FadeIn delay={0.1} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
<div className="z-10">
<span className="inline-block py-1 px-4 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-sm font-semibold mb-6">
                    Web3 Social Incentives
                </span>
<h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
                    Launch Funded Campaigns <span className="text-primary">on Socials</span>
</h1>
<p className="text-body-md text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl">
                    The ultimate platform for community growth. Create non-custodial treasuries, automate rewards, and leverage AI-judging for Discord and Telegram bounties.
                </p>
<div className="flex flex-wrap gap-4">
<Link href="/operator_dashboard" className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all active:scale-95 inline-flex items-center justify-center">
                        Create a Campaign
                    </Link>
<Link href="/public_campaign_page" className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-dim transition-all active:scale-95 inline-flex items-center justify-center">
                        View Active Bounties
                    </Link>
</div>
<div className="mt-12 flex items-center gap-6 text-sm text-on-surface-variant">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        Non-custodial
                    </div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        Audit Trail
                    </div>
</div>
</div>
<div className="relative">
<div className="bg-surface-container-lowest rounded-[2rem] p-4 shadow-[0_40px_80px_rgba(107,56,212,0.08)] relative z-10 overflow-hidden">
<img className="w-full h-auto rounded-[1.5rem]" data-alt="Abstract UI showing a crypto campaign dashboard with active participants" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuqHYSZ6X9FU7nHENtO5VvpyPL67IbApIPE_7yDBTWzboeU-csmJgYH095NjK4IcBPF9b1wMmsXrIoKFbDqK0uTsmcGZOGBAYEJNMX6aw6u130Kib7kKRXcQLK0QxC3T_is3CH-Bw-dLrnhOLx3ePXWmjfD2xqa4B_BwtH4CwZn7OQKPLMwRT1qomxnbmjMArvqZT9tK4hwLpSuIzF1AIqqcyrMU8NC1kZnHswTWzhjr0yjDJrxGMNv-EjM9EfZYSs4YKGx53HEFId"/>
<div className="absolute bottom-8 left-8 right-8 flex items-center justify-between rounded-2xl border border-outline-variant/25 bg-surface-container-highest/92 p-6 shadow-lg backdrop-blur-md dark:border-outline-variant/40 dark:bg-surface-container-highest/95">
<div>
<p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Treasury</p>
<p className="font-headline text-2xl font-extrabold text-on-surface">12.5 ETH</p>
</div>
<div className="flex -space-x-3">
<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary-fixed text-xs font-bold text-on-primary-fixed dark:border-surface-container-high">
              JD
            </div>
<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-secondary-container text-xs font-bold text-on-secondary-container dark:border-surface-container-high">
              MK
            </div>
<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed text-xs font-bold text-on-tertiary-fixed dark:border-surface-container-high">
              AL
            </div>
</div>
</div>
</div>
{/* Decorative background shapes */}
<div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
<div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl"></div>
</div>
</FadeIn>
</section>
{/* The 4 Steps Process */}
<section className="py-24 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-8">
<FadeIn>
<div className="text-center mb-20">
<h2 className="font-headline text-4xl font-extrabold mb-4">How it Works</h2>
<p className="text-on-surface-variant max-w-2xl mx-auto">From setup to distribution in four seamless steps.</p>
</div>
</FadeIn>
<StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
{/* Step 1 */}
<StaggerItem className="bg-surface-container-lowest p-8 rounded-3xl relative overflow-hidden group hover:translate-y-[-8px] transition-transform duration-300">
<div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-primary text-3xl">hub</span>
</div>
<h3 className="font-headline text-xl font-bold mb-3 text-slate-900">1. Setup</h3>
<p className="text-sm text-on-surface-variant leading-relaxed">Connect your Telegram or Discord bots to automate campaign entry and tracking.</p>
<div className="mt-6 flex gap-2">
<span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-secondary-container">TELEGRAM</span>
<span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-secondary-container">DISCORD</span>
</div>
</StaggerItem>
{/* Step 2 */}
<StaggerItem className="bg-surface-container-lowest p-8 rounded-3xl relative overflow-hidden group hover:translate-y-[-8px] transition-transform duration-300">
<div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
</div>
<h3 className="font-headline text-xl font-bold mb-3 text-slate-900">2. Fund</h3>
<p className="text-sm text-on-surface-variant leading-relaxed">Deposit prize pools into a non-custodial treasury with on-chain transparency.</p>
<div className="mt-6 text-xs font-bold text-tertiary flex items-center gap-1">
<span className="material-symbols-outlined text-sm">lock</span> SMART CONTRACT SECURED
                    </div>
</StaggerItem>
{/* Step 3 */}
<StaggerItem className="bg-surface-container-lowest p-8 rounded-3xl relative overflow-hidden group hover:translate-y-[-8px] transition-transform duration-300">
<div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-primary text-3xl">send</span>
</div>
<h3 className="font-headline text-xl font-bold mb-3 text-slate-900">3. Submit</h3>
<p className="text-sm text-on-surface-variant leading-relaxed">Participants submit proof-of-work directly through social platform commands.</p>
<div className="mt-6 flex -space-x-2">
<div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
<div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
<div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
<div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] border-2 border-white">+5k</div>
</div>
</StaggerItem>
{/* Step 4 */}
<StaggerItem className="bg-surface-container-lowest p-8 rounded-3xl relative overflow-hidden group hover:translate-y-[-8px] transition-transform duration-300">
<div className="w-14 h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
<span className="material-symbols-outlined text-3xl">psychology</span>
</div>
<h3 className="font-headline text-xl font-bold mb-3 text-slate-900">4. Judge</h3>
<p className="text-sm text-on-surface-variant leading-relaxed">AI Agents verify quality using a 3+1 judging system with an immutable audit trail.</p>
<div className="mt-6">
<div className="w-full bg-surface-container rounded-full h-1.5">
<div className="bg-tertiary h-1.5 rounded-full w-full"></div>
</div>
<p className="text-[10px] font-bold text-tertiary mt-2">AI VERIFICATION ACTIVE</p>
</div>
</StaggerItem>
</StaggerContainer>
</div>
</section>
{/* Trust & Transparency (Bento Grid) */}
<section className="py-24 px-8 max-w-7xl mx-auto">
<FadeIn className="grid lg:grid-cols-12 gap-6">
<div className="lg:col-span-7 bg-surface-container-low rounded-[2.5rem] p-12 flex flex-col justify-between overflow-hidden relative">
<div>
<h2 className="font-headline text-4xl font-extrabold mb-6 leading-tight">Total Trust &amp; <br/>Transparency</h2>
<p className="text-on-surface-variant text-lg max-w-md">Every transaction, judging decision, and reward distribution is logged on-chain for public verification.</p>
</div>
<div className="mt-12 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20">
<div className="flex items-center justify-between mb-4">
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Audit Trail Log</span>
<span className="text-xs text-tertiary font-bold px-2 py-0.5 bg-tertiary-container/10 rounded">Live</span>
</div>
<div className="space-y-3">
<div className="flex items-center gap-3 text-sm border-b border-surface pb-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="font-mono text-[10px] text-on-surface-variant">0x4a...f32</span>
<span className="text-on-surface">Reward Approved by AI-1</span>
</div>
<div className="flex items-center gap-3 text-sm border-b border-surface pb-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="font-mono text-[10px] text-on-surface-variant">0x9c...a11</span>
<span className="text-on-surface">Consensus reached by 3+1 nodes</span>
</div>
<div className="flex items-center gap-3 text-sm opacity-50">
<span className="w-2 h-2 rounded-full bg-outline"></span>
<span className="font-mono text-[10px]">0x2b...d88</span>
<span>Transaction pending distribution...</span>
</div>
</div>
</div>
</div>
<div className="lg:col-span-5 space-y-6">
<div className="bg-inverse-surface text-inverse-on-surface rounded-[2rem] p-8 h-1/2 flex flex-col justify-center">
<div className="flex items-center gap-4 mb-4">
<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
<span className="material-symbols-outlined text-white">security</span>
</div>
<h4 className="font-headline text-xl font-bold">Non-Custodial</h4>
</div>
<p className="text-sm opacity-80 leading-relaxed">Your funds never touch our wallets. Multi-sig treasuries ensure that only campaign conditions can trigger release.</p>
</div>
<div className="bg-primary-container text-on-primary-container rounded-[2rem] p-8 h-1/2 flex flex-col justify-center">
<div className="flex items-center gap-4 mb-4">
<div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
<span className="material-symbols-outlined">auto_awesome</span>
</div>
<h4 className="font-headline text-xl font-bold">3+1 Judging</h4>
</div>
<p className="text-sm opacity-90 leading-relaxed">Three independent AI agents judge every entry. A human curator acts as the final '+1' tiebreaker for absolute fairness.</p>
</div>
</div>
</FadeIn>
</section>
{/* Featured Campaigns / Social CTA */}
<section className="py-20 sm:py-24 bg-surface">
<div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12 xl:px-14">
<FadeIn>
<div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
<div>
<h2 className="font-headline text-3xl font-extrabold text-on-surface sm:text-4xl mb-2 sm:mb-4">Trending Bounties</h2>
<p className="max-w-xl text-sm text-on-surface-variant sm:text-base">Join active campaigns and start earning today.</p>
<p className="mt-2 text-sm text-on-surface-variant">
              Want to create a campaign?{' '}
              <Link href="/account_settings" className="font-semibold text-primary hover:underline">
                Create account
              </Link>
            </p>
</div>
<Link
              href="/public_campaign_page"
              className="text-primary font-bold inline-flex items-center gap-2 shrink-0 group hover:underline underline-offset-4 md:pb-0.5"
            >
              View all campaigns{' '}
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
</div>
</FadeIn>
<StaggerContainer className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-12">
          {PUBLIC_CAMPAIGNS.map((bounty) => (
            <StaggerItem key={bounty.slug}>
              <ExploreBountyCard {...bounty} />
            </StaggerItem>
          ))}
        </StaggerContainer>
</div>
</section>
<SiteFooter />

</>
  );
}
