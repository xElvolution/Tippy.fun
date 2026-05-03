"use client";

import { useCallback, useEffect, useState, type SVGProps } from "react";

function ordinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function soulSubline(rank: number): string {
  if (rank === 1) return "You're the first soul to arrive.";
  return `You're the ${rank}${ordinalSuffix(rank)} soul to arrive.`;
}

function formatRankCode(rank: number): string {
  const width = Math.max(3, String(rank).length);
  return `#${String(rank).padStart(width, "0")}`;
}

function GridGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ShareGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.82 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

export default function Home() {
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/arrival", { credentials: "same-origin" });
        if (!res.ok) throw new Error("arrival_failed");
        const data = (await res.json()) as { rank?: number };
        const n = typeof data.rank === "number" ? data.rank : NaN;
        if (!Number.isFinite(n) || n <= 0) throw new Error("rank_invalid");
        if (!cancelled) setRank(n);
      } catch {
        if (!cancelled) setError("Could not verify your arrival.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const shareRank = useCallback(async () => {
    if (rank === null) return;
    const line = `${formatRankCode(rank)} — PROJECT: HOMECOMING`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "PROJECT: HOMECOMING",
          text: line,
          url,
        });
        return;
      }
    } catch {
      /* user cancelled native share */
    }
    try {
      await navigator.clipboard.writeText(`${line}\n${url}`);
    } catch {
      /* ignore */
    }
  }, [rank]);

  const displayCode =
    error !== null ? "---" : rank !== null ? formatRankCode(rank) : "···";
  const subline =
    error ??
    (rank !== null ? soulSubline(rank) : "Verifying arrival sequence…");

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#0a0a0a] text-zinc-100">
      {/* grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.042) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.042) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
        aria-hidden
      />

      {/* ambient radial glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-[38%] z-0 h-[min(640px,85vw)] w-[min(920px,96vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.26),rgba(34,211,238,0.08)_45%,transparent_72%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed left-1/2 top-[42%] z-0 h-[min(420px,70vw)] w-[min(560px,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.14),transparent_68%)] blur-2xl"
        aria-hidden
      />

      {/* side rails */}
      <div
        className="pointer-events-none fixed left-5 top-1/2 z-20 hidden -translate-y-1/2 -rotate-90 text-[10px] font-medium uppercase tracking-[0.42em] text-white/[0.18] sm:block"
        aria-hidden
      >
        PROTOCOL ACTIVE
      </div>
      <div
        className="pointer-events-none fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 rotate-90 text-[10px] font-medium uppercase tracking-[0.42em] text-white/[0.18] sm:block"
        aria-hidden
      >
        PHASE_ZERO_ENTRY
      </div>

      <header className="relative z-30 flex items-center justify-between px-6 pt-8 md:px-10 md:pt-10">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white md:text-xs"
          style={{
            textShadow:
              "0 0 22px rgba(168,85,247,0.45), 0 0 48px rgba(168,85,247,0.2)",
          }}
        >
          PROJECT: HOMECOMING
        </p>
        <nav className="flex items-center gap-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65 md:gap-9 md:text-[11px]">
          <a className="transition hover:text-white" href="#mission">
            Mission
          </a>
          <a className="transition hover:text-white" href="#protocol">
            Protocol
          </a>
          <GridGlyph className="h-5 w-5 text-[#c084fc]" />
        </nav>
      </header>

      <main className="relative z-30 flex flex-1 flex-col items-center justify-center px-5 pb-28 pt-10 text-center md:pb-36">
        <h1 className="text-[clamp(1.55rem,4.2vw,2.65rem)] font-semibold uppercase tracking-[0.14em] text-white md:tracking-[0.18em]">
          Congratulations
        </h1>
        <p className="mt-4 max-w-md text-[15px] font-normal leading-relaxed text-[#7dd3fc] md:text-base">
          {subline}
        </p>

        <div className="relative mt-12 w-full max-w-[min(520px,92vw)]">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-10 py-14 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute left-5 top-5 h-9 w-9 border-l border-t border-white/25"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-5 right-5 h-9 w-9 border-b border-r border-white/25"
              aria-hidden
            />

            <p
              className="font-semibold leading-none tracking-tight"
              style={{
                fontSize: "clamp(4.5rem,16vw,8.75rem)",
                background:
                  "linear-gradient(135deg, #f5e8ff 0%, #c084fc 38%, #a855f7 52%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter:
                  "drop-shadow(0 0 28px rgba(168,85,247,0.75)) drop-shadow(0 0 72px rgba(168,85,247,0.35)) drop-shadow(0 0 36px rgba(34,211,238,0.22))",
              }}
            >
              {displayCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void shareRank()}
          disabled={rank === null}
          className="group relative mt-10 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/[0.12] px-11 py-[0.92rem] text-[11px] font-semibold uppercase tracking-[0.32em] text-white transition enabled:hover:brightness-105 disabled:pointer-events-none disabled:opacity-40 md:mt-11 md:text-xs"
          style={{
            background: "linear-gradient(120deg, #9333ea 0%, #7c3aed 38%, #5b21b6 100%)",
            boxShadow:
              "0 0 0 1px rgba(168,85,247,0.35), 0 20px 50px rgba(147,51,234,0.42), 0 0 40px rgba(168,85,247,0.35)",
          }}
          aria-label="Share rank"
        >
          <ShareGlyph className="h-[18px] w-[18px] stroke-[2.1] text-white" />
          Share rank
        </button>

        <p className="mt-5 max-w-sm text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-white/38 md:tracking-[0.26em]">
          Verified global arrival order, stay early.
        </p>
      </main>

      <footer className="relative z-30 mt-auto flex flex-col gap-6 px-6 pb-10 text-[10px] text-white/35 md:flex-row md:items-end md:justify-between md:px-10 md:pb-11">
        <span id="mission" className="sr-only">
          Mission — details coming soon.
        </span>
        <span id="protocol" className="sr-only">
          Protocol — details coming soon.
        </span>
        <span id="documentation" className="sr-only">
          Documentation — details coming soon.
        </span>
        <p className="max-w-xl uppercase tracking-[0.08em]">
          Order of arrival verified on-chain. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 uppercase tracking-[0.18em] md:justify-end">
          <button
            type="button"
            className="transition hover:text-white/65"
            onClick={() => void shareRank()}
          >
            Share
          </button>
          <a
            href="#documentation"
            className="transition hover:text-white/65"
          >
            Documentation
          </a>
        </div>
      </footer>
    </div>
  );
}
