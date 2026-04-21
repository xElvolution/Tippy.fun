/** Convert a human-readable decimal amount to integer base units (no float drift). */
export function humanAmountToBaseUnits(amountHuman: number, decimals: number): string {
  if (!(Number.isFinite(amountHuman) && amountHuman > 0)) {
    throw new Error('Amount must be a positive number.');
  }
  const d = Math.min(36, Math.max(0, Math.floor(decimals)));
  const s = amountHuman.toFixed(d);
  const [whole, frac = ''] = s.split('.');
  const fracPadded = (frac + '0'.repeat(d)).slice(0, d);
  const base = BigInt(whole) * 10n ** BigInt(d) + BigInt(fracPadded || '0');
  if (base <= 0n) throw new Error('Amount must be positive.');
  return base.toString();
}
