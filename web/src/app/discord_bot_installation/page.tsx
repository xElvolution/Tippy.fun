// Automatically generated
import Link from 'next/link';

export default function DiscordBotInstallation() {
  return (
    <>

{/* Top Navigation suppressed for Transactional flow per instructions */}
<main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
{/* Animated Background Orbits (Decorative) */}
<div className="fixed inset-0 overflow-hidden -z-10">
<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed opacity-20 rounded-full blur-3xl"></div>
<div className="absolute top-1/2 -right-24 w-64 h-64 bg-tertiary-fixed opacity-20 rounded-full blur-3xl"></div>
</div>
{/* Onboarding Shell */}
<div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
{/* Left Side: Editorial Context */}
<div className="lg:col-span-5 flex flex-col space-y-8 py-6">
<div>
<h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
                        Power up your <br/>
<span className="text-primary">Discord Orbit</span>
</h1>
<p className="mt-4 text-secondary leading-relaxed max-w-sm text-lg">
                        Connect Tippy.Fun to your server to start rewarding your community for their social contributions.
                    </p>
</div>
{/* Step Indicators */}
<div className="space-y-6">
<div className="flex items-start gap-4">
<div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container shrink-0">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
</div>
<div>
<p className="font-headline font-semibold text-on-surface">OAuth Flow</p>
<p className="text-sm text-secondary">Authorized with Discord</p>
</div>
</div>
<div className="flex items-start gap-4">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
<span className="font-headline font-bold">2</span>
</div>
<div>
<p className="font-headline font-semibold text-on-surface">Configuration</p>
<p className="text-sm text-secondary">Select server and channel</p>
</div>
</div>
<div className="flex items-start gap-4 opacity-40">
<div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
<span className="font-headline font-bold">3</span>
</div>
<div>
<p className="font-headline font-semibold text-on-surface">Finalize</p>
<p className="text-sm text-secondary">Ready for liftoff</p>
</div>
</div>
</div>
</div>
{/* Right Side: Interaction Canvas */}
<div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_20px_40px_rgba(17,28,45,0.06)]">
<form className="space-y-8">
{/* Server Selection */}
<div className="space-y-3">
<label className="font-headline font-bold text-on-surface block px-1">Choose Server</label>
<div className="relative group">
<select className="w-full h-14 pl-4 pr-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary appearance-none font-medium cursor-pointer transition-all">
<option>The Creative Lab DAO</option>
<option>Ether Enthusiasts</option>
<option>Tippy Community Hub</option>
<option>Project Orbit Mainnet</option>
</select>
<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
<span className="material-symbols-outlined">expand_more</span>
</div>
</div>
</div>
{/* Channel Selection */}
<div className="space-y-3">
<label className="font-headline font-bold text-on-surface block px-1">Submission Channel</label>
<div className="relative">
<select className="w-full h-14 pl-12 pr-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary appearance-none font-medium cursor-pointer transition-all">
<option>#campaign-submissions</option>
<option>#general-chat</option>
<option>#announcements</option>
<option>#rewards-log</option>
</select>
<div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
<span className="material-symbols-outlined">tag</span>
</div>
<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
<span className="material-symbols-outlined">expand_more</span>
</div>
</div>
<p className="text-xs text-secondary px-1 italic">This is where the bot will listen for campaign participation.</p>
</div>
{/* Permissions Checklist */}
<div className="bg-surface-container p-6 rounded-xl space-y-4">
<h3 className="font-headline font-bold text-sm uppercase tracking-widest text-secondary">Required Permissions</h3>
<div className="space-y-3">
<label className="flex items-center gap-4 cursor-pointer group">
<div className="relative flex items-center">
<input defaultChecked className="w-6 h-6 rounded-lg bg-tertiary text-tertiary-container border-none focus:ring-0 opacity-80" disabled type="checkbox"/>
<span className="material-symbols-outlined absolute text-white text-xs left-1 top-1" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
</div>
<div className="flex flex-col">
<span className="font-semibold text-on-surface">View Channel</span>
<span className="text-xs text-secondary">Allows Tippy to read and post in the selected channel</span>
</div>
</label>
<label className="flex items-center gap-4 cursor-pointer group">
<div className="relative flex items-center">
<input defaultChecked className="w-6 h-6 rounded-lg bg-tertiary text-tertiary-container border-none focus:ring-0 opacity-80" disabled type="checkbox"/>
<span className="material-symbols-outlined absolute text-white text-xs left-1 top-1" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
</div>
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Read Message History</span>
<span className="text-xs text-secondary">Required to verify content submitted by members</span>
</div>
</label>
<label className="flex items-center gap-4 cursor-pointer group">
<div className="relative flex items-center">
<input defaultChecked className="w-6 h-6 rounded-lg bg-tertiary text-tertiary-container border-none focus:ring-0 opacity-80" disabled type="checkbox"/>
<span className="material-symbols-outlined absolute text-white text-xs left-1 top-1" style={{ fontVariationSettings: "'FILL' 1" }}>done</span>
</div>
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Add Reactions</span>
<span className="text-xs text-secondary">Used to signal status or confirm successful tips</span>
</div>
</label>
</div>
</div>
{/* Action Buttons */}
<div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
<button className="w-full sm:flex-1 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl active:scale-95 transition-all shadow-lg" type="submit">
                            Complete Installation
                        </button>
<button className="w-full sm:w-auto px-8 h-14 text-secondary font-semibold hover:text-primary transition-colors" type="button">
                            Cancel
                        </button>
</div>
</form>
</div>
</div>
{/* Bot Identity Card (Bento Style Sub-element) */}
<div className="mt-16 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="md:col-span-2 bg-surface-container-low p-6 rounded-xl flex items-center gap-6">
<div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-4 border-surface-container-lowest">
<img alt="Tippy Bot Avatar" className="w-14 h-14" data-alt="Cyberpunk robot mascot icon in purple tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7FHJBtMQRCdMMM9jD1ObeJTd7SYZQeMlwDi3H7C0Rr35q7lA7yP8VVYGLNcLIY4WW-xNWxiKGfrJU28cc7l4UIC1QG7gavgvCUvWHYuesv65R2UFJUSBRnCfdlPre6IjrBK9yCEUdCTSmyuqyN2UeSc50XbkJl8mWHSnfG2vu3OS9fo6hbVg_zKVMhUyT-zXGTsDi9qiQtyKbDYhlAfLILnItbrHZcE_YpukLx7xvbUmnHSzpfvVbdQD5TDzOP5qJduXdUlmpyab6"/>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-headline font-bold text-xl">Tippy Bot</span>
<span className="px-2 py-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full uppercase">Verified</span>
</div>
<p className="text-sm text-secondary mt-1">The official bot for Tippy.Fun. Used by 12,000+ communities to manage treasury rewards and social engagement.</p>
</div>
</div>
<div className="bg-tertiary-container p-6 rounded-xl flex flex-col justify-center">
<span className="text-on-tertiary-container font-headline font-bold text-2xl">99.9%</span>
<span className="text-on-tertiary-container/80 text-sm">Uptime &amp; Reliability</span>
<div className="mt-4 flex -space-x-2">
<img className="w-8 h-8 rounded-full border-2 border-tertiary-container" data-alt="User avatar small circle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApM6d54I-uMsi2UYRv1v8ZLZW4RgyNMbDsfJe_ExaAAQ2stFy5ZLkY1Xl-z0RUOJ-uptjURWaLC9wS2YUYLxcfW17f1ioVBsH6Ulp4pvauOGrcTqJmAQv44yhLpsZ7_yYxAmwKtdbbKWOljN9rNqzjB9WQa0naUKxsvFMCosiN5TICycBXUj8ieflyUG-VrtvOmSkBSaaDrI2vjEXwRLqQSIxDX69VYMi8Iz0nwWg-AJ6J7vYM7DzLZR_zLpxbNhhnELQxFdTp4JIT"/>
<img className="w-8 h-8 rounded-full border-2 border-tertiary-container" data-alt="User avatar small circle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2xrsz2Zqg9LcMZLdGxcC7hlRKytkXX0UcuW2RopciO_TGemqCVJ0vQVS77smndeQEfaRWsgjWXB9JS8hs2rTfkaAjlvFAWd-OIJcrIyuabuCbS_sUdmuKQuO_XsikUlf-INrSESit2qt90fMeIP9xNqP_nTmhIJbfbpZs9rzSLPUB4yiup6_jeBoUpEt2VN_59ylji7llCazc_I1V_9hmOKWWi-q9i5KLvrMVpxw0EgFx4MxUDzgtYx9004aAqsbEvdGoa7zhE2VC"/>
<img className="w-8 h-8 rounded-full border-2 border-tertiary-container" data-alt="User avatar small circle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoZWLi3VR3IsDG1xP3MrqFOsbapceixRG72tEcTevq9drB1j2-7Iy0MDpc4l7RWkMXL3U9eBbGNTUZnkSmymQuF-Yu7XWWpVORz-WXoBL5zI0WXyYPMKA503QG_omR5vVAnGjrJ4sRKenGJySouQbFCHdw4Bbd__hwghgMji_XHa2rDhH1kJwGapgk878PdSnpYxI-dxknUfhvHiFvVjwow6v10usQacNMkWuKZiD0SwLxe-9sr9hpyieVcxv9vhrODTzRk5jqEo0J"/>
</div>
</div>
</div>
</main>
{/* Footer */}
<footer className="bg-slate-50 dark:bg-slate-950 w-full border-t-0 mt-20">
<div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-center py-12 px-8 max-w-7xl mx-auto">
<div className="flex items-center gap-2 mb-6 lg:mb-0">
<span className="material-symbols-outlined text-primary" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
<span className="text-lg font-bold text-slate-900 dark:text-white">Tippy.Fun</span>
</div>
<div className="flex flex-wrap gap-8">
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all font-['Inter'] text-sm leading-relaxed" href="/">Docs</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all font-['Inter'] text-sm leading-relaxed" href="/">Help</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all font-['Inter'] text-sm leading-relaxed" href="/">Legal</a>
<a className="text-slate-500 dark:text-slate-400 hover:text-violet-500 underline-offset-4 hover:underline transition-all font-['Inter'] text-sm leading-relaxed" href="/">Socials</a>
</div>
<div className="mt-8 lg:mt-0">
<p className="font-['Inter'] text-sm leading-relaxed text-slate-500 dark:text-slate-400">© 2024 Tippy.Fun</p>
</div>
</div>
</footer>

</>
  );
}
