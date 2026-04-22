import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase/server';
import {
  generatedDisplayName,
  generatedHandle,
  avatarSeedFor,
} from '@/lib/profileName';
import { UserProfileClient } from '@/components/UserProfileClient';

type ProfileRow = {
  privy_id: string;
  wallet_address: string | null;
  handle: string | null;
  display_name: string | null;
  avatar_seed: string | null;
  twitter_handle: string | null;
  discord_handle: string | null;
  created_at: string;
};

type ResolvedProfile = {
  handle: string;
  displayName: string;
  walletAddress: string;
  avatarSeed: string;
  twitterHandle: string | null;
  discordHandle: string | null;
  createdAt: string | null;
  inferred: boolean;
};

function isAddressLike(raw: string): boolean {
  return /^0x[0-9a-f]{40}$/i.test(raw);
}

async function resolveProfile(input: string): Promise<ResolvedProfile | null> {
  const raw = decodeURIComponent(input).trim();
  if (!raw) return null;
  const looksLikeAddress = isAddressLike(raw);

  if (isSupabaseConfigured()) {
    const db = supabaseAdmin();
    const query = db.from('profiles').select('*').limit(1);
    const { data } = await (looksLikeAddress
      ? query.eq('wallet_address', raw.toLowerCase())
      : query.ilike('handle', raw)
    ).maybeSingle();

    if (data) {
      const row = data as ProfileRow;
      const address = row.wallet_address ?? (looksLikeAddress ? raw : null);
      if (!address) return null;
      return {
        handle: row.handle ?? generatedHandle(address),
        displayName: row.display_name ?? generatedDisplayName(address),
        walletAddress: address,
        avatarSeed: row.avatar_seed ?? avatarSeedFor(address),
        twitterHandle: row.twitter_handle,
        discordHandle: row.discord_handle,
        createdAt: row.created_at,
        inferred: false,
      };
    }
  }

  if (!looksLikeAddress) return null;
  return {
    handle: generatedHandle(raw),
    displayName: generatedDisplayName(raw),
    walletAddress: raw.toLowerCase(),
    avatarSeed: avatarSeedFor(raw),
    twitterHandle: null,
    discordHandle: null,
    createdAt: null,
    inferred: true,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await resolveProfile(handle).catch(() => null);
  if (!profile) {
    return { title: 'Profile not found · TippyMaker' };
  }
  return {
    title: `${profile.displayName} · TippyMaker`,
    description: `On-chain campaigns and activity by ${profile.displayName} on Conflux eSpace.`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await resolveProfile(handle).catch(() => null);
  if (!profile) notFound();
  return <UserProfileClient profile={profile} />;
}
