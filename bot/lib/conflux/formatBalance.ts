export function formatTokenHumanFromRaw(raw: bigint, decimals: number): string {
  const div = 10n ** BigInt(decimals);
  const whole = raw / div;
  const frac = raw % div;
  if (frac === 0n) return whole.toLocaleString();
  const fracTrim = frac.toString().padStart(decimals, '0').replace(/0+$/, '') || '0';
  const s = `${whole.toString()}.${fracTrim}`;
  const n = Number(s);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : s;
}
