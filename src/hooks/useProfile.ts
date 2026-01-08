import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export function useProfile() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json() as Promise<UserProfile>;
    },
    enabled: !!session?.user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; image?: string }) => {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json() as Promise<UserProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
  });
}
