import { keccak256, stringToBytes } from 'viem';

/** Canonical JSON string (stable key order) used for hashing payloads deterministically. */
export function canonicalJSON(value: unknown): string {
  const seen = new WeakSet<object>();
  const stringify = (v: unknown): string => {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (seen.has(v as object)) throw new Error('cycle in canonical JSON');
    seen.add(v as object);
    if (Array.isArray(v)) return '[' + v.map((x) => stringify(x)).join(',') + ']';
    const keys = Object.keys(v as Record<string, unknown>).sort();
    return (
      '{' +
      keys
        .map((k) => JSON.stringify(k) + ':' + stringify((v as Record<string, unknown>)[k]))
        .join(',') +
      '}'
    );
  };
  return stringify(value);
}

export function hashCanonical(value: unknown): `0x${string}` {
  return keccak256(stringToBytes(canonicalJSON(value)));
}

export function hashString(s: string): `0x${string}` {
  return keccak256(stringToBytes(s));
}
