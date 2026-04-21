import { getSupabaseAdmin } from '../supabase/admin';
import { encryptUtf8, decryptUtf8 } from '../crypto/vault';
import { generateEvmWallet } from '../conflux/wallet';
import type { Database } from '../database.types';

type UserRow = Database['public']['Tables']['users']['Row'];

export async function getUserByDiscordId(discordId: string): Promise<UserRow | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('users').select('*').eq('discord_id', discordId).maybeSingle();
  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

export async function createUserFromDiscord(input: {
  discordId: string;
  username: string;
  globalName?: string | null;
  avatarUrl?: string | null;
}): Promise<{ user: UserRow; created: boolean }> {
  const existing = await getUserByDiscordId(input.discordId);
  if (existing) return { user: existing, created: false as const };

  const { privateKeyHex, evmAddress } = generateEvmWallet();
  const enc = encryptUtf8(privateKeyHex);

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('users')
    .insert({
      discord_id: input.discordId,
      username: input.username,
      global_name: input.globalName ?? null,
      avatar_url: input.avatarUrl ?? null,
      evm_address: evmAddress,
      encrypted_private_key: enc.ciphertext,
      key_iv: enc.iv,
      key_tag: enc.tag,
    })
    .select('*')
    .single();

  if (error) throw error;
  return { user: data as UserRow, created: true as const };
}

export async function getPrivateKeyHexForUser(discordId: string): Promise<string | null> {
  const row = await getUserByDiscordId(discordId);
  if (!row) return null;
  return decryptUtf8({
    ciphertext: row.encrypted_private_key,
    iv: row.key_iv,
    tag: row.key_tag,
  });
}
