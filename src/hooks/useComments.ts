import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment, CommentWithReplies } from '@/types/trace';

export function useComments(traceId: string | undefined) {
  return useQuery({
    queryKey: ['comments', traceId],
    queryFn: async () => {
      if (!traceId) return [];
      
      const res = await fetch(`/api/traces/${traceId}/comments`, {
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to fetch comments');
      
      const comments: Comment[] = await res.json();
      
      const rootComments = comments.filter((c) => !c.parentId);
      const replies = comments.filter((c) => c.parentId);
      
      const commentsWithReplies: CommentWithReplies[] = rootComments.map((comment) => ({
        ...comment,
        replies: replies.filter((r) => r.parentId === comment.id),
      }));
      
      return commentsWithReplies;
    },
    enabled: !!traceId,
  });
}

export function useCreateComment(traceId: string | undefined) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!traceId) throw new Error('Trace ID is required');
      
      const res = await fetch(`/api/traces/${traceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Failed to create comment');
      }
      
      return res.json() as Promise<Comment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', traceId] });
    },
  });
}
