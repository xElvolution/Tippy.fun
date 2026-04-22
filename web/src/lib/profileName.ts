/**
 * Deterministic display-name + handle generator.
 *
 * Same wallet address always produces the same name, so new users land on a
 * reasonable default without any server round-trip. They can override it from
 * Settings afterwards; once they do, the stored `display_name` / `handle`
 * take precedence over whatever this module returns.
 */

const ADJECTIVES = [
  'Brave',
  'Calm',
  'Clever',
  'Cosmic',
  'Crimson',
  'Daring',
  'Electric',
  'Feisty',
  'Frosty',
  'Gentle',
  'Golden',
  'Happy',
  'Humble',
  'Jolly',
  'Kind',
  'Lucky',
  'Mellow',
  'Mighty',
  'Noble',
  'Peppy',
  'Quick',
  'Radiant',
  'Silent',
  'Smooth',
  'Sneaky',
  'Solar',
  'Stellar',
  'Sunny',
  'Swift',
  'Tidy',
  'Vivid',
  'Witty',
] as const;

const ANIMALS = [
  'Panda',
  'Otter',
  'Falcon',
  'Tiger',
  'Koala',
  'Wolf',
  'Lynx',
  'Fox',
  'Badger',
  'Dolphin',
  'Hawk',
  'Raven',
  'Heron',
  'Owl',
  'Eagle',
  'Puma',
  'Leopard',
  'Mantis',
  'Gecko',
  'Cobra',
  'Kraken',
  'Phoenix',
  'Dragon',
  'Yak',
  'Moose',
  'Bison',
  'Stag',
  'Shark',
  'Orca',
  'Swan',
  'Lemur',
  'Toucan',
] as const;

function hashToIndex(seed: string, modulo: number): number {
  // FNV-1a 32-bit; deterministic, cheap, no deps.
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash % modulo;
}

function normalizedAddress(address: string): string {
  return address.trim().toLowerCase().replace(/^0x/, '');
}

function shortAddressSuffix(address: string, chars = 6): string {
  const hex = normalizedAddress(address);
  return hex.slice(-chars);
}

/** e.g. `BravePanda-4a7bb0`. Safe to render as a display name. */
export function generatedDisplayName(address: string): string {
  const seed = normalizedAddress(address);
  const adjective = ADJECTIVES[hashToIndex(`adj:${seed}`, ADJECTIVES.length)];
  const animal = ANIMALS[hashToIndex(`noun:${seed}`, ANIMALS.length)];
  return `${adjective}${animal}-${shortAddressSuffix(address)}`;
}

/** URL-safe slug version of the generated name. e.g. `brave-panda-4a7bb0`. */
export function generatedHandle(address: string): string {
  const seed = normalizedAddress(address);
  const adjective = ADJECTIVES[hashToIndex(`adj:${seed}`, ADJECTIVES.length)].toLowerCase();
  const animal = ANIMALS[hashToIndex(`noun:${seed}`, ANIMALS.length)].toLowerCase();
  return `${adjective}-${animal}-${shortAddressSuffix(address)}`;
}

/** Stable avatar gradient seed (we just reuse the address, 6-char form). */
export function avatarSeedFor(address: string): string {
  return shortAddressSuffix(address, 8);
}

/**
 * Coerce an edited display name into a valid handle. We keep handles strictly
 * lowercase, hyphen-separated, and bounded to 32 chars. If the normalised input
 * is empty (e.g. user typed only punctuation), fall back to the generated one.
 */
export function handleFromDisplayName(displayName: string, address: string): string {
  const slug = displayName
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  if (!slug) return generatedHandle(address);
  return `${slug}-${shortAddressSuffix(address)}`;
}
