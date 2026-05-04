"use client";

import { useCallback, useEffect, useId, useState, type SVGProps } from "react";

function ordinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function soulSubline(rank: number): string {
  if (rank === 1)
    return "You're first in line: Tipzy.fun Homecoming x BountyFi.";
  return `You're ${rank}${ordinalSuffix(rank)} in line: Tipzy.fun Homecoming x BountyFi.`;
}

function formatRankCode(rank: number): string {
  const width = Math.max(3, String(rank).length);
  return `#${String(rank).padStart(width, "0")}`;
}

const PUBLIC_HOMECOMING_ORIGIN = (
  process.env.NEXT_PUBLIC_HOMECOMING_URL ?? "https://homecoming.tipzy.fun"
).replace(/\/$/, "");

/** Public link in tweets and previews: production host + current path/query. */
function sharePageUrlForTwitter(): string {
  if (typeof window === "undefined") {
    return `${PUBLIC_HOMECOMING_ORIGIN}/`;
  }
  return `${PUBLIC_HOMECOMING_ORIGIN}${window.location.pathname}${window.location.search}`;
}

function twitterShareUrl(rank: number, pageUrl: string): string {
  const code = formatRankCode(rank);
  const text =
    `${code} On the Tipzy.fun Homecoming list ahead of BountyFi. AI-native bounty and payout rails, arrival order nailed on-chain. Early users ride first when the campaign switch flips. Jump in below. ${pageUrl}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
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
  const cornerFlowGradId = useId().replace(/:/g, "");
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

  const shareOnTwitter = useCallback(() => {
    if (rank === null) return;
    const url = sharePageUrlForTwitter();
    const tw = twitterShareUrl(rank, url);
    window.open(tw, "_blank", "noopener,noreferrer");
  }, [rank]);

  const displayCode =
    error !== null ? "---" : rank !== null ? formatRankCode(rank) : "···";
  const subline =
    error ??
    (rank !== null ? soulSubline(rank) : "Verifying arrival sequence…");

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#0a0a0a] text-zinc-100 hc-enter-soft">
      {/* lava blobs: charcoal depth + drifting violet glow (Ovle-style) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="hc-lava-blob hc-lava-a" />
        <div className="hc-lava-blob hc-lava-b" />
        <div className="hc-lava-blob hc-lava-c" />
        <div className="hc-lava-blob hc-lava-d" />
        <div className="hc-lava-blob-purple hc-lava-purple-1" />
        <div className="hc-lava-blob-purple hc-lava-purple-2" />
        <div className="hc-lava-blob-purple hc-lava-purple-3" />
      </div>

      {/* grid */}
      <div
        className="hc-grid-pulse pointer-events-none fixed inset-0 z-0 opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.042) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.042) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
        aria-hidden
      />

      <div
        className="hc-enter hc-enter-d100 pointer-events-none fixed left-5 top-1/2 z-20 hidden max-w-none -translate-y-1/2 -rotate-90 text-[10px] font-bold tracking-[0.28em] text-white/[0.22] normal-case sm:block"
        aria-hidden
      >
        BountyFi x AI
      </div>
      <div
        className="hc-enter hc-enter-d200 pointer-events-none fixed right-5 top-1/2 z-20 hidden max-w-none -translate-y-1/2 rotate-90 text-[10px] font-bold tracking-[0.28em] text-white/[0.22] normal-case sm:block"
        aria-hidden
      >
        BountyFi x AI
      </div>

      {/* top corner microcopy: stacked ribbon < md, split corners desktop */}
      <p
        className="hc-enter hc-enter-d150 pointer-events-none fixed left-1/2 top-[4.72rem] z-20 block w-[min(100vw-2rem,22rem)] -translate-x-1/2 text-pretty px-4 text-center text-[8px] font-semibold uppercase leading-snug tracking-[0.1em] text-white/26 sm:text-[9px] md:hidden"
        aria-hidden
      >
        <span>BountyFi · AI agents</span>
        <span className="mx-1 opacity-35 sm:mx-1.5" aria-hidden>
          ·
        </span>
        <span>Fair arrivals · escrow-ready</span>
      </p>

      <div
        className="hc-enter hc-enter-d150 pointer-events-none fixed left-6 top-[4.85rem] z-20 hidden max-w-[min(200px,calc(50vw-4rem))] text-pretty text-[9px] font-semibold uppercase leading-tight tracking-[0.16em] text-white/25 sm:left-8 sm:max-w-[min(260px,calc(50vw-6rem))] md:block lg:left-10 lg:tracking-[0.22em]"
        aria-hidden
      >
        BountyFi · AI agents
      </div>
      <div
        className="hc-enter hc-enter-d170 pointer-events-none fixed right-6 top-[4.85rem] z-20 hidden max-w-[min(200px,calc(50vw-4rem))] text-pretty text-right text-[9px] font-semibold uppercase leading-tight tracking-[0.16em] text-white/25 sm:right-8 sm:max-w-[min(260px,calc(50vw-6rem))] md:block lg:right-10 lg:tracking-[0.22em]"
        aria-hidden
      >
        Fair arrivals · escrow-ready
      </div>

      <header className="relative z-30 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pt-8 sm:px-6 md:px-10 md:pt-10">
        <p
          className="hc-enter hc-enter-d240 min-w-0 shrink text-base font-semibold lowercase tracking-[0.08em] text-white md:text-lg"
          style={{
            textShadow:
              "0 0 22px rgba(168,85,247,0.45), 0 0 48px rgba(168,85,247,0.2)",
          }}
        >
          Tipzy.fun
        </p>
        <div className="hc-header-zone hc-enter hc-enter-d260 flex min-w-0 shrink cursor-default flex-wrap items-center justify-end gap-2 gap-x-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:gap-x-4 sm:text-[10px] md:text-[11px] md:tracking-[0.28em]">
          <span>Homecoming</span>
          <GridGlyph className="hc-header-glyph-hover h-5 w-5 shrink-0 text-[#c084fc]" aria-hidden />
        </div>
      </header>

      <main className="relative z-30 flex flex-1 flex-col items-center justify-center px-5 pb-24 pt-6 text-center md:pb-32 md:pt-8 lg:pb-36 lg:pt-10">
        <h1 className="hc-enter hc-enter-d320 text-[clamp(1.55rem,4.2vw,2.65rem)] font-semibold uppercase tracking-[0.14em] text-white md:tracking-[0.18em]">
          Congratulations
        </h1>
        <p className="hc-enter hc-enter-d360 mt-4 max-w-md text-[15px] font-normal leading-relaxed text-[#7dd3fc] md:text-base md:mt-5">
          {subline}
        </p>

        <div className="hc-enter hc-enter-d420 relative mt-10 w-full max-w-[min(340px,86vw)] md:mt-12">
          <div
            className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] px-7 py-9 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md md:px-9 md:py-11 ${rank === null && error === null ? "hc-slot-pulse-motion" : ""}`}
          >
            <svg
              className="pointer-events-none absolute left-3.5 top-3.5 z-[1] h-7 w-7 overflow-visible"
              width={28}
              height={28}
              viewBox="0 0 28 28"
              aria-hidden
            >
              <defs>
                <linearGradient
                  id={`${cornerFlowGradId}-bracket`}
                  x1={0}
                  y1={28}
                  x2={28}
                  y2={0}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="48%" stopColor="rgba(192,132,252,0.95)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.88)" />
                </linearGradient>
              </defs>
              <path
                className="hc-corner-bracket-path"
                d="M 2 26 L 2 2 L 26 2"
                fill="none"
                stroke={`url(#${cornerFlowGradId}-bracket)`}
                strokeWidth={1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              className="pointer-events-none absolute bottom-3.5 right-3.5 z-[1] h-7 w-7 overflow-visible"
              width={28}
              height={28}
              viewBox="0 0 28 28"
              aria-hidden
            >
              <defs>
                <linearGradient
                  id={`${cornerFlowGradId}-bracket-br`}
                  x1={0}
                  y1={28}
                  x2={28}
                  y2={0}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="48%" stopColor="rgba(192,132,252,0.95)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.88)" />
                </linearGradient>
              </defs>
              <path
                className="hc-corner-bracket-path hc-corner-bracket-path--alt"
                d="M 26 2 L 26 26 L 2 26"
                fill="none"
                stroke={`url(#${cornerFlowGradId}-bracket-br)`}
                strokeWidth={1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p
              key={displayCode}
              className={`font-semibold leading-none tracking-tight ${rank !== null || error !== null ? "hc-rank-pop-motion" : ""}`}
              style={{
                fontSize: "clamp(2.65rem, 11vw, 5rem)",
                background:
                  "linear-gradient(135deg, #f5e8ff 0%, #c084fc 38%, #a855f7 52%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter:
                  "drop-shadow(0 0 20px rgba(168,85,247,0.65)) drop-shadow(0 0 48px rgba(168,85,247,0.28)) drop-shadow(0 0 24px rgba(34,211,238,0.18))",
              }}
            >
              {displayCode}
            </p>
          </div>
        </div>

        <div className="hc-enter hc-enter-d520 mt-10 flex w-full justify-center md:mt-11">
          <button
            type="button"
            onClick={shareOnTwitter}
            disabled={rank === null}
            className="hc-share-btn-motion hc-share-zone relative isolate inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-white/[0.12] px-11 py-[0.92rem] text-[11px] font-semibold uppercase tracking-[0.28em] text-white disabled:pointer-events-none disabled:opacity-40 md:text-xs md:tracking-[0.32em]"
            style={{
              background:
                "linear-gradient(120deg, #9333ea 0%, #7c3aed 38%, #5b21b6 100%)",
            }}
            aria-label="Share arrival rank on X (Twitter)"
          >
            <ShareGlyph className="hc-share-icon relative z-[1] h-[18px] w-[18px] stroke-[2.1] text-white" />
            <span className="relative z-[1]">Share on X</span>
          </button>
        </div>
      </main>

      <div className="shrink-0 pb-10 md:pb-12" aria-hidden />
    </div>
  );
}
