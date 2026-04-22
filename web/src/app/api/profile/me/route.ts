import { NextRequest } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase/server';
import {
  authErrorResponse,
  requireAuth,
  resolvePrivyUser,
} from '@/lib/auth/privyServer';
import {
  avatarSeedFor,
  generatedDisplayName,
  generatedHandle,
  handleFromDisplayName,
} from '@/lib/profileName';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  privy_id: string;
  wallet_address: string | null;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_seed: string | null;
  twitter_handle: string | null;
  twitter_subject: string | null;
  discord_handle: string | null;
  discord_subject: string | null;
  created_at: string;
  updated_at: string;
};

function serialize(row: ProfileRow) {
  return {
    id: row.id,
    privyId: row.privy_id,
    walletAddress: row.wallet_address,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    avatarSeed: row.avatar_seed,
    twitterHandle: row.twitter_handle,
    discordHandle: row.discord_handle,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadOrCreateProfile(privyId: string): Promise<ProfileRow | null> {
  const db = supabaseAdmin();

  const existing = await db
    .from('profiles')
    .select('*')
    .eq('privy_id', privyId)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const resolved = await resolvePrivyUser(privyId).catch(() => null);
  const walletAddress = resolved?.walletAddress ?? existing.data?.wallet_address ?? null;

  if (existing.data) {
    const patch: Record<string, unknown> = {};
    if (walletAddress && existing.data.wallet_address !== walletAddress.toLowerCase()) {
      patch.wallet_address = walletAddress.toLowerCase();
    }
    if (!existing.data.avatar_seed && walletAddress) {
      patch.avatar_seed = avatarSeedFor(walletAddress);
    }
    if (resolved?.twitter) {
      if (existing.data.twitter_subject !== resolved.twitter.subject) {
        patch.twitter_subject = resolved.twitter.subject;
      }
      if (existing.data.twitter_handle !== resolved.twitter.handle) {
        patch.twitter_handle = resolved.twitter.handle;
      }
    }
    if (resolved?.discord) {
      if (existing.data.discord_subject !== resolved.discord.subject) {
        patch.discord_subject = resolved.discord.subject;
      }
      if (existing.data.discord_handle !== resolved.discord.handle) {
        patch.discord_handle = resolved.discord.handle;
      }
    }
    if (!existing.data.handle && walletAddress) {
      patch.handle = generatedHandle(walletAddress);
    }
    if (!existing.data.display_name && walletAddress) {
      patch.display_name = generatedDisplayName(walletAddress);
    }
    if (Object.keys(patch).length === 0) return existing.data as ProfileRow;
    patch.updated_at = new Date().toISOString();
    const updated = await db
      .from('profiles')
      .update(patch)
      .eq('privy_id', privyId)
      .select('*')
      .single();
    if (updated.error) throw updated.error;
    return updated.data as ProfileRow;
  }

  if (!walletAddress) return null;

  const insert = {
    privy_id: privyId,
    wallet_address: walletAddress.toLowerCase(),
    handle: generatedHandle(walletAddress),
    display_name: generatedDisplayName(walletAddress),
    avatar_seed: avatarSeedFor(walletAddress),
    twitter_handle: resolved?.twitter?.handle ?? null,
    twitter_subject: resolved?.twitter?.subject ?? null,
    discord_handle: resolved?.discord?.handle ?? null,
    discord_subject: resolved?.discord?.subject ?? null,
  };
  const created = await db.from('profiles').insert(insert).select('*').single();
  if (created.error) throw created.error;
  return created.data as ProfileRow;
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 501 },
    );
  }
  try {
    const user = await requireAuth(req);
    const profile = await loadOrCreateProfile(user.privyId);
    if (!profile) {
      return Response.json({
        profile: null,
        reason: 'Could not resolve a wallet for this Privy user yet. Try again after Privy finishes provisioning the embedded wallet.',
      });
    }
    return Response.json({ profile: serialize(profile) });
  } catch (err) {
    return authErrorResponse(err);
  }
}

type PatchBody = {
  displayName?: string;
};

export async function PATCH(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 501 },
    );
  }
  try {
    const user = await requireAuth(req);
    const body = (await req.json().catch(() => ({}))) as PatchBody;

    const profile = await loadOrCreateProfile(user.privyId);
    if (!profile) {
      return Response.json(
        { error: 'Profile cannot be updated before a wallet is linked.' },
        { status: 400 },
      );
    }

    const patch: Record<string, unknown> = {};

    if (typeof body.displayName === 'string') {
      const trimmed = body.displayName.trim().slice(0, 48);
      if (trimmed.length === 0) {
        return Response.json(
          { error: 'Display name cannot be empty.' },
          { status: 400 },
        );
      }
      patch.display_name = trimmed;
      if (profile.wallet_address) {
        patch.handle = handleFromDisplayName(trimmed, profile.wallet_address);
      }
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ profile: serialize(profile) });
    }

    patch.updated_at = new Date().toISOString();

    const db = supabaseAdmin();
    const updated = await db
      .from('profiles')
      .update(patch)
      .eq('privy_id', user.privyId)
      .select('*')
      .single();
    if (updated.error) {
      if (updated.error.code === '23505') {
        return Response.json(
          { error: 'That display name is already taken; pick another.' },
          { status: 409 },
        );
      }
      return Response.json({ error: updated.error.message }, { status: 500 });
    }

    return Response.json({ profile: serialize(updated.data as ProfileRow) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
