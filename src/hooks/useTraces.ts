import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TraceWithDistance, CreateTraceInput, UploadResponse } from '@/types/trace';
import type { Trace } from '@/lib/db/schema';

export function useTraces(lat: number, lng: number, enabled = true) {
  return useQuery({
    queryKey: ['traces', lat, lng],
    queryFn: async () => {
      const res = await fetch(`/api/traces?lat=${lat}&lng=${lng}`, {
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to fetch traces');
      return res.json() as Promise<TraceWithDistance[]>;
    },
    enabled,
  });
}

export function useMyTraces(includeDeleted = false) {
  return useQuery({
    queryKey: ['myTraces', includeDeleted],
    queryFn: async () => {
      const url = includeDeleted 
        ? '/api/users/me/traces?includeDeleted=true' 
        : '/api/users/me/traces';
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to fetch my traces');
      return res.json() as Promise<Trace[]>;
    },
  });
}

export function useCreateTrace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTraceInput) => {
      const res = await fetch('/api/traces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });
      
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to create trace');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
      queryClient.invalidateQueries({ queryKey: ['myTraces'] });
    },
  });
}

export function useDeleteTrace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/traces/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to delete trace');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
      queryClient.invalidateQueries({ queryKey: ['myTraces'] });
    },
  });
}

export function useRestoreTrace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/traces/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true }),
        credentials: 'include',
      });
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      if (!res.ok) throw new Error('Failed to restore trace');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
      queryClient.invalidateQueries({ queryKey: ['myTraces'] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (res.redirected || res.url.includes('/login')) {
        throw new Error('로그인이 필요합니다');
      }
      
      if (!res.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { fileUrl } = await res.json() as UploadResponse;
      return fileUrl;
    },
  });
}
