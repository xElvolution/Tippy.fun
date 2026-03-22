// Automatically generated
import Link from 'next/link';

export default function OperatorDashboard() {
  return (
    <>

<main className="max-w-7xl mx-auto px-8 pt-12 pb-16">
{/* Header Section */}
<header className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-12">
<div className="space-y-2 max-w-2xl">
<h1 className="text-5xl font-extrabold font-headline tracking-tight text-on-surface">Campaigns</h1>
<p className="text-on-surface-variant text-lg leading-relaxed">
              Your hub for live and draft campaigns. Open <strong className="text-on-surface">Manage</strong> on a campaign for judging, treasury, and payouts — those tools are not in the sidebar on purpose.
            </p>
</div>
<div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
<Link href="/draft_campaigns" className="bg-surface-container-highest text-on-surface px-6 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-xl">folder_special</span>
              View drafts
            </Link>
<Link href="/create_campaign_wizard" className="primary-gradient px-8 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(107,56,212,0.2)] hover:scale-[1.02] active:scale-95 duration-200">
<span className="material-symbols-outlined" data-icon="add">add</span>
              New campaign
            </Link>
</div>
</header>
{/* Stats Overview (Asymmetric Layout) */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
<div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.04)] flex justify-between items-center overflow-hidden relative">
<div className="relative z-10">
<p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-1">Total Treasury Under Management</p>
<h2 className="text-4xl font-headline font-extrabold text-on-surface">$142,500.00 <span className="text-lg font-medium text-tertiary-container font-body">USDT</span></h2>
</div>
<div className="absolute -right-8 -bottom-8 opacity-10">
<span className="material-symbols-outlined text-[120px]" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
</div>
<div className="md:col-span-4 bg-primary-fixed p-8 rounded-xl flex flex-col justify-center">
<p className="text-on-primary-fixed-variant font-semibold text-sm mb-1">Active Submissions</p>
<h2 className="text-4xl font-headline font-extrabold text-on-primary-fixed">1,284</h2>
</div>
</div>
{/* Campaign Grid */}
<div className="space-y-6">
<div className="flex items-center justify-between mb-8">
<h3 className="text-2xl font-headline font-bold">Your Campaigns</h3>
<div className="flex gap-2">
<span className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-medium cursor-pointer">All</span>
<span className="hover:bg-surface-container-low px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">Live</span>
<span className="hover:bg-surface-container-low px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">Draft</span>
</div>
</div>
{/* Grid Items */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{/* Card 1: Live Campaign */}
<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:shadow-xl transition-shadow group">
<div className="p-6">
<div className="flex justify-between items-start mb-6">
<span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Live
                            </span>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-xl" data-icon="rocket_launch">rocket_launch</span>
<span className="text-xs font-medium">Telegram</span>
</div>
</div>
<h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Genesis NFT Whitelist Hunt</h4>
<div className="grid grid-cols-2 gap-4 mb-6">
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Treasury</p>
<p className="text-lg font-headline font-bold">$12,400</p>
</div>
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Submissions</p>
<p className="text-lg font-headline font-bold text-primary">842</p>
</div>
</div>
<div className="flex items-center justify-between text-sm mb-6">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-base" data-icon="schedule">schedule</span>
<span>Ends in 4d 12h</span>
</div>
</div>
<div className="flex gap-3">
<Link href="/campaign/judging" className="flex-1 text-center bg-surface-container-highest text-on-surface font-bold py-3 rounded-lg hover:bg-surface-dim transition-colors inline-flex items-center justify-center">
                Manage
              </Link>
<Link href="/campaign/funds" className="flex-1 text-center primary-gradient font-bold py-3 rounded-lg inline-flex items-center justify-center">
                Fund
              </Link>
</div>
</div>
</div>
{/* Card 2: Draft Campaign */}
<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:shadow-xl transition-shadow group">
<div className="p-6">
<div className="flex justify-between items-start mb-6">
<span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-xl" data-icon="discord">chat</span>
<span className="text-xs font-medium">Discord</span>
</div>
</div>
<h4 className="text-xl font-headline font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">Alpha Testers Reward Pool</h4>
<div className="grid grid-cols-2 gap-4 mb-6">
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Treasury</p>
<p className="text-lg font-headline font-bold">$0.00</p>
</div>
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Submissions</p>
<p className="text-lg font-headline font-bold">--</p>
</div>
</div>
<div className="flex items-center justify-between text-sm mb-6">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-base" data-icon="edit">edit</span>
<span>Created 2h ago</span>
</div>
</div>
<div className="flex gap-3">
<Link href="/create_campaign_wizard" className="flex-1 text-center primary-gradient font-bold py-3 rounded-lg inline-flex items-center justify-center">
                Continue setup
              </Link>
</div>
</div>
</div>
{/* Card 3: Ended Campaign */}
<div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:shadow-xl transition-shadow group opacity-80 hover:opacity-100">
<div className="p-6">
<div className="flex justify-between items-start mb-6">
<span className="bg-surface-dim text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Ended</span>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-xl" data-icon="rocket_launch">rocket_launch</span>
<span className="text-xs font-medium">Telegram</span>
</div>
</div>
<h4 className="text-xl font-headline font-bold text-on-surface mb-4">Beta Feedback Loop #1</h4>
<div className="grid grid-cols-2 gap-4 mb-6">
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Distributed</p>
<p className="text-lg font-headline font-bold">$5,000</p>
</div>
<div className="bg-surface-container-low p-3 rounded-lg">
<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Total Submits</p>
<p className="text-lg font-headline font-bold">1,402</p>
</div>
</div>
<div className="flex items-center justify-between text-sm mb-6">
<div className="flex items-center gap-2 text-error font-medium">
<span className="material-symbols-outlined text-base" data-icon="event_busy">event_busy</span>
<span>Ended Dec 12</span>
</div>
</div>
<div className="flex gap-3">
<Link href="/campaign/payout" className="w-full text-center bg-surface-container-highest text-on-surface font-bold py-3 rounded-lg hover:bg-surface-dim transition-colors inline-flex items-center justify-center">
                View results
              </Link>
</div>
</div>
</div>
</div>
</div>
{/* Secondary Section: Activity/Recent */}
<div className="mt-20">
<h3 className="text-2xl font-headline font-bold mb-8">Recent Activity</h3>
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<div className="p-4 bg-surface-container-high flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
<div className="flex-1">Event</div>
<div className="w-32">Status</div>
<div className="w-32">Time</div>
</div>
<div className="divide-y divide-outline-variant/10">
<div className="p-6 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
<div className="flex-1 flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-xl" data-icon="payments">payments</span>
</div>
<div>
<p className="font-bold">Treasury Funded</p>
<p className="text-sm text-on-surface-variant">5,000 USDT added to "Genesis NFT Whitelist Hunt"</p>
</div>
</div>
<div className="w-32">
<span className="text-tertiary font-medium">Success</span>
</div>
<div className="w-32 text-sm text-on-surface-variant">2m ago</div>
</div>
<div className="p-6 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
<div className="flex-1 flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-xl" data-icon="group_add">group_add</span>
</div>
<div>
<p className="font-bold">New Submission</p>
<p className="text-sm text-on-surface-variant">User @cryptoknight submitted verification</p>
</div>
</div>
<div className="w-32">
<span className="text-on-surface-variant font-medium">Pending</span>
</div>
<div className="w-32 text-sm text-on-surface-variant">15m ago</div>
</div>
</div>
</div>
</div>
</main>
{/* Footer (Shared Component: Footer) */}
<footer className="mt-20 border-t border-outline-variant/20 bg-surface-container-lowest">
<div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-center py-12 px-8 max-w-7xl mx-auto font-body text-sm leading-relaxed gap-6">
<div className="flex flex-col gap-2">
<span className="text-lg font-bold text-on-surface font-headline">Tippy.Fun</span>
<p className="text-on-surface-variant">© 2024 Tippy.Fun</p>
</div>
<div className="flex flex-wrap gap-8 lg:mt-0">
<Link className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors" href="/how_judging_works">How judging works</Link>
<Link className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors" href="/integrations_hub">Integrations</Link>
<Link className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors" href="/telegram_bot_onboarding">Telegram</Link>
<Link className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors" href="/discord_bot_installation">Discord</Link>
<Link className="text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-colors" href="/public_campaign_page">Browse campaigns</Link>
</div>
</div>
</footer>
{/* Image Data Descriptions */}
<div className="hidden">
<img data-alt="Abstract futuristic digital trophy icon with neon lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAc9oyaOQ4cr3AERrc2rmHmy_Zs-rWJPN7NxBUSVDfVrqIbOEo1gR7HoeJPrAJAKd957aT47_nh3-07h4rU6kDuykdXTqO69YFPXm543cAjVu63bdjXMpGY0pQjQTxOjRMD-LHgqy_UQ-_rWoRJvjrmC3LP46gQu5p7jvfG4oJGqEQLBAmA5gjFQ7OWFLCzFbGYxfl3cmyeKVy2L0M9MZONBEa6TMvSoCEDJ6uycAEQ0G0WCYy5JgnZH4KZRo3QKxs0eTvhdydZU46"/>
<img data-alt="Cyberpunk laboratory equipment abstract purple pattern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlyWmCsBwxjaXFRLGBRIi0ye90898qG7lhMJbeofVCkj2CEqPHn379czo7znhVdb3K6rKHCG82fYhTfxPYVhWvUIZaJCDvuL6B2gWuFU3fLeULQ5JxMWtj8rx99JHu8YLYQYKYcst2Pb8P1c2E4OUSW2mcsKOSxq-eS8E1EXqRihn99GdspEGURM6pNx95FzYvMQXNu6lHXnhZt8m_f5sFPcpPYSCIj4HRhm22kw3KwOK6sSLpP6hvoFzDQ6AgJxwHQeQMjCWZYuNC"/>
<img data-alt="Minimalist chat bubbles floating in a grey space" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARsVT6Jd0q5lKi_YJnvczGWgfPuJfE0ruFuU2YC-zw6ENNYptA39zd9MdmUpdiAN8ljZX38dJgb30M5GBvJJue4D3vxOOzaNVRRLGlPVWLDwaE1zeRpas17SeB47EImxoX6UbMSu630x02aNF32QokQo-VHB_Imw2HaOVt29y7g7UsbL7CAxgemD2rwB-D4-_1ljhhPtBD_NouHpC4tFK9rUZtkx2EIH9RoRxVY8T13vfDMApzqQbWl8UFvp35gBKTtFLYqkvbklKR"/>
</div>

</>
  );
}
