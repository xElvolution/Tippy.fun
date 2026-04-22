'use client';

import React from 'react';

type Props = {
  seed: string;
  label?: string;
  size?: number;
  className?: string;
  shape?: 'circle' | 'square';
};

function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function hueFromSeed(seed: string, salt = ''): number {
  return hash(`${seed}:${salt}`) % 360;
}

export function AvatarGradient({ seed, label, size = 80, className, shape = 'circle' }: Props) {
  const normalized = (seed || 'tippy').toLowerCase();
  const a = hueFromSeed(normalized, 'a');
  const b = hueFromSeed(normalized, 'b');
  const initials = (label ?? normalized).slice(0, 2).toUpperCase();

  return (
    <div
      className={`${className ?? ''} flex items-center justify-center overflow-hidden font-headline font-black text-white ring-2 ring-white/30`}
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? '9999px' : '20%',
        background: `linear-gradient(135deg, hsl(${a} 85% 55%), hsl(${b} 85% 42%))`,
        fontSize: Math.max(size * 0.35, 12),
        letterSpacing: '-0.02em',
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
