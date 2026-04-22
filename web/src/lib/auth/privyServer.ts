import { PrivyClient, type AuthTokenClaims } from '@privy-io/server-auth';
import { NextRequest } from 'next/server';

let cached: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (cached) return cached;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secret = process.env.PRIVY_APP_SECRET;
  if (!appId || !secret) {
    throw new Error(
      'Privy is not configured on the server. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET.',
    );
  }
  cached = new PrivyClient(appId, secret);
  return cached;
}

export type AuthedUser = {
  privyId: string;
  claims: AuthTokenClaims;
};

/**
 * Verifies the `Authorization: Bearer <privy access token>` header on an API route and returns
 * the authenticated user. Throws if missing / invalid.
 */
export async function requireAuth(req: NextRequest): Promise<AuthedUser> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new AuthError('Missing bearer token', 401);
  try {
    const claims = await getPrivyClient().verifyAuthToken(token);
    return { privyId: claims.userId, claims };
  } catch (err) {
    throw new AuthError(
      err instanceof Error ? err.message : 'Failed to verify Privy token',
      401,
    );
  }
}

export type LinkedSocial = {
  subject: string;
  handle: string | null;
};

export type ResolvedPrivyUser = {
  privyId: string;
  walletAddress: string | null;
  twitter: LinkedSocial | null;
  discord: LinkedSocial | null;
};

type PrivyLinkedAccount = {
  type: string;
  address?: string;
  walletClientType?: string;
  username?: string;
  name?: string;
  subject?: string;
};

/**
 * Fetches the user's linked accounts from Privy and returns the first wallet
 * plus Twitter / Discord handles when present. Falls back to null fields when
 * a user hasn't linked that account yet.
 */
export async function resolvePrivyUser(privyId: string): Promise<ResolvedPrivyUser> {
  const client = getPrivyClient();
  const user = await client.getUserById(privyId);
  const accounts = (user?.linkedAccounts ?? []) as PrivyLinkedAccount[];

  const wallet = accounts.find((a) => a.type === 'wallet' && a.address);
  const twitter = accounts.find((a) => a.type === 'twitter_oauth');
  const discord = accounts.find((a) => a.type === 'discord_oauth');

  return {
    privyId,
    walletAddress: wallet?.address ?? null,
    twitter: twitter
      ? { subject: twitter.subject ?? privyId, handle: twitter.username ?? twitter.name ?? null }
      : null,
    discord: discord
      ? { subject: discord.subject ?? privyId, handle: discord.username ?? discord.name ?? null }
      : null,
  };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function authErrorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  const msg = err instanceof Error ? err.message : 'Server error';
  return Response.json({ error: msg }, { status: 500 });
}
