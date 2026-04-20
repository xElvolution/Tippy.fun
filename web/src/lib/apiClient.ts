'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCallback } from 'react';

/**
 * Authenticated fetch that attaches the current Privy access token as a Bearer header.
 * Server routes verify the token via @privy-io/server-auth and use it to extract the user id.
 */
export function useAuthedFetch() {
  const { getAccessToken, authenticated, login } = usePrivy();
  return useCallback(
    async <T = unknown>(url: string, init: RequestInit = {}): Promise<T> => {
      if (!authenticated) {
        await login();
      }
      const token = await getAccessToken();
      const res = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const text = await res.text();
      const body = text ? (JSON.parse(text) as unknown) : ({} as unknown);
      if (!res.ok) {
        const msg =
          typeof body === 'object' && body !== null && 'error' in body
            ? String((body as { error: unknown }).error)
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      return body as T;
    },
    [getAccessToken, authenticated, login],
  );
}
