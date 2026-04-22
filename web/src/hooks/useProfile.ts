'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { useAuthedFetch } from '@/lib/apiClient';

export type MyProfile = {
  id: string;
  privyId: string;
  walletAddress: string | null;
  handle: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  avatarSeed: string | null;
  twitterHandle: string | null;
  discordHandle: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = {
  handle: string | null;
  displayName: string | null;
  walletAddress: string | null;
  avatarUrl: string | null;
  avatarSeed: string | null;
  twitterHandle: string | null;
  discordHandle: string | null;
  createdAt: string;
};

type MyProfileResponse = {
  profile: MyProfile | null;
  reason?: string;
};

export function useMyProfile() {
  const { ready, authenticated } = usePrivy();
  const authedFetch = useAuthedFetch();
  return useQuery<MyProfileResponse>({
    enabled: ready && authenticated,
    queryKey: ['profile', 'me'],
    queryFn: () => authedFetch<MyProfileResponse>('/api/profile/me'),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('wallet')) return failureCount < 3;
      return failureCount < 1;
    },
  });
}

export function useUpdateMyProfile() {
  const authedFetch = useAuthedFetch();
  const client = useQueryClient();
  return useMutation<MyProfileResponse, Error, { displayName?: string }>({
    mutationFn: (body) =>
      authedFetch<MyProfileResponse>('/api/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      client.setQueryData(['profile', 'me'], data);
      if (data.profile?.handle) {
        client.invalidateQueries({ queryKey: ['profile', 'public', data.profile.handle] });
      }
    },
  });
}

export function usePublicProfile(handleOrAddress: string | null | undefined) {
  return useQuery<{ profile: PublicProfile }>({
    enabled: Boolean(handleOrAddress && handleOrAddress.length > 0),
    queryKey: ['profile', 'public', handleOrAddress?.toLowerCase() ?? ''],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${encodeURIComponent(handleOrAddress!)}`);
      if (res.status === 404) throw new Error('Not found');
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      return (await res.json()) as { profile: PublicProfile };
    },
    staleTime: 60_000,
  });
}
