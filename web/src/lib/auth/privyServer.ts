import { PrivyClient, type AuthTokenClaims } from '@privy-io/server-auth';
import { NextRequest } from 'next/server';

let cached: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
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
