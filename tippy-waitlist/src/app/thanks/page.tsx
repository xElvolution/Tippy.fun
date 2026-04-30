import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { communityDiscordUrl, docsUrl } from "@/lib/publicLinks";

export const metadata = {
  title: "You’re on the list — Tippy",
  description: "Thanks for joining the Tippy waitlist.",
};

export default function ThanksPage() {
  const discordHref = communityDiscordUrl();
  const docsHref = docsUrl();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 hero-mesh" aria-hidden />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="" width={56} height={56} className="rounded-xl object-contain" priority />
        </div>
        <div className="mb-6 flex justify-center text-primary">
          <CheckCircle2 className="size-14" strokeWidth={1.5} aria-hidden />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "var(--font-head)" }}>
          You&apos;re on the list
        </h1>
        <p className="mt-4 text-muted">
          Watch your inbox for Tippy updates. In the meantime, catch up on Conflux docs or hang out with the community.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-surface-high/60"
          >
            Back to waitlist
          </Link>
          <a
            href={discordHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_0_24px_-6px_var(--primary-glow)] hover:opacity-95"
          >
            Join Discord
          </a>
        </div>
        <p className="mt-8 text-xs text-muted">
          <a href={docsHref} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            Conflux docs
          </a>
        </p>
      </div>
    </div>
  );
}
