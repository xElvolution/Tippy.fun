export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isEncryptionConfigured(): boolean {
  const hex = process.env.ENCRYPTION_KEY;
  return !!(hex && hex.length === 64);
}

export function isOnChainConfigured(): boolean {
  return isEncryptionConfigured() && isSupabaseConfigured();
}
