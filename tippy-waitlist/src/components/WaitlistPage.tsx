"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  Bolt,
  BookOpen,
  Coins,
  ExternalLink,
  Loader2,
  MessageCircle,
  Twitter,
  Zap,
} from "lucide-react";
import { communityDiscordUrl, confluxXUrl, docsUrl, tippyAppUrl } from "@/lib/publicLinks";

export function WaitlistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utm_source = searchParams.get("utm_source") ?? "";
  const utm_medium = searchParams.get("utm_medium") ?? "";

  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const scrollToForm = useCallback(() => {
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const discordHref = useMemo(() => communityDiscordUrl(), []);
  const docsHref = useMemo(() => docsUrl(), []);
  const xHref = useMemo(() => confluxXUrl(), []);
  const appHref = useMemo(() => tippyAppUrl(), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          discord: discord.trim() || undefined,
          company: "",
          utm_source: utm_source || undefined,
          utm_medium: utm_medium || undefined,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(j.error || "Something went wrong.");
        return;
      }
      router.push("/thanks");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 hero-mesh" aria-hidden />

      <header className="relative z-10 border-b border-border/80 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg object-contain" priority />
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-head), var(--font-sans)" }}>
              Tippy
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
            <a href={docsHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Docs
            </a>
            <a href={discordHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Discord
            </a>
            <a href={xHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              X
            </a>
            <a href={appHref} className="text-primary hover:opacity-90">
              Open app
            </a>
          </nav>
          <button
            type="button"
            onClick={scrollToForm}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_0_24px_-6px_var(--primary-glow)] hover:opacity-95"
          >
            Join waitlist
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-14 sm:px-6 lg:gap-28 lg:py-20">
        <section className="text-center lg:pt-4">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-high/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <Zap className="size-3.5" aria-hidden />
            Early access
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tipping that lives where your community already is
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Tippy brings Conflux eSpace rewards into Discord — CFX, tokens, and project points without leaving the server. Join the
            waitlist for wider access and launch updates.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-[0_0_32px_-8px_var(--primary-glow)] hover:opacity-95"
            >
              Request access
            </button>
            <a
              href={appHref}
              className="rounded-2xl border border-border px-8 py-4 text-base font-bold text-foreground hover:bg-surface-high/50"
            >
              Try the app
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Bolt, title: "Instant tips", desc: "Reward members from chat with simple flows built for Discord." },
            { icon: Coins, title: "CFX & tokens", desc: "Native and ERC-20 rails on Conflux eSpace, same mental model." },
            { icon: MessageCircle, title: "Server-native", desc: "Built around how moderators and contributors already work." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-panel rounded-2xl p-6 text-left">
              <div className="mb-4 inline-flex rounded-xl bg-primary/15 p-2.5 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </section>

        <section id="waitlist-form" className="mx-auto w-full max-w-lg scroll-mt-24">
          <div className="glass-panel rounded-3xl p-8 sm:p-10">
            <h2 className="text-center text-2xl font-bold text-foreground">Join the waitlist</h2>
            <p className="mt-2 text-center text-sm text-muted">
              We’ll only email you about Tippy — no spam, no resale of your address.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Discord username <span className="font-normal normal-case text-muted/70">(optional)</span>
                </span>
                <input
                  type="text"
                  name="discord"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="e.g. elvolution"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />
              {status === "error" && message ? (
                <p className="text-sm text-error" role="alert">
                  {message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white shadow-[0_0_28px_-6px_var(--primary-glow)] hover:opacity-95 disabled:pointer-events-none disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  "Join waitlist"
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-10 text-center text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4">
          <a href={docsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <BookOpen className="size-3.5" /> Learn
          </a>
          <a
            href={discordHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <MessageCircle className="size-3.5" /> Discord
          </a>
          <a href={xHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Twitter className="size-3.5" /> Conflux on X
          </a>
          <a href={appHref} className="inline-flex items-center gap-1.5 hover:text-foreground">
            <ExternalLink className="size-3.5" /> Dashboard
          </a>
        </div>
        <p className="mt-6 opacity-70">© {new Date().getFullYear()} Tippy · Conflux eSpace</p>
      </footer>
    </div>
  );
}
