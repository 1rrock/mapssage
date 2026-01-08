'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useComments, useCreateComment } from '@/hooks/useComments';
import type { Comment, CommentWithReplies } from '@/types/trace';

interface CommentSectionProps {
  traceId: string;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return new Date(date).toLocaleDateString('ko-KR');
}

function CommentInput({ 
  onSubmit, 
  placeholder, 
  isLoading,
  autoFocus = false,
  onCancel,
}: { 
  onSubmit: (content: string) => void;
  placeholder: string;
  isLoading: boolean;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        autoFocus={autoFocus}
        className="flex-1 rounded-xl border border-[#E5D5C5] bg-white px-4 py-2.5 text-sm text-[#264653] placeholder:text-[#264653]/40 focus:border-[#FF5A5F] focus:outline-none transition-colors"
      />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#264653]/60 hover:text-[#264653] transition-colors"
        >
          취소
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="rounded-xl bg-[#FF5A5F] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#FF454A] disabled:bg-gray-300"
      >
        {isLoading ? '...' : '등록'}
      </button>
    </form>
  );
}

function CommentItem({ 
  comment, 
  onReply,
  isReply = false,
}: { 
  comment: Comment;
  onReply?: (parentId: string) => void;
  isReply?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}>
      {comment.user.image ? (
        <img
          src={comment.user.image}
          alt={comment.user.name || 'User'}
          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">👤</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#264653]">
            {comment.user.name || '익명'}
          </span>
          <span className="text-xs text-[#264653]/40">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-[#264653]/80 mt-0.5 break-words">
          {comment.content}
        </p>
        {!isReply && onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-xs text-[#FF5A5F] font-bold mt-1 hover:underline"
          >
            답글
          </button>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ traceId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(traceId);
  const createComment = useCreateComment(traceId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const handleSubmitComment = (content: string) => {
    createComment.mutate(
      { content },
      {
        onSuccess: () => {
          toast.success('댓글이 등록되었습니다');
        },
        onError: () => {
          toast.error('댓글 등록에 실패했습니다');
        },
      }
    );
  };
  
  const handleSubmitReply = (content: string) => {
    if (!replyingTo) return;
    
    createComment.mutate(
      { content, parentId: replyingTo },
      {
        onSuccess: () => {
          toast.success('답글이 등록되었습니다');
          setReplyingTo(null);
        },
        onError: () => {
          toast.error('답글 등록에 실패했습니다');
        },
      }
    );
  };
  
  const commentCount = comments?.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0
  ) ?? 0;
  
  return (
    <div className="mt-8 border-t border-[#E5D5C5]/50 pt-6">
      <h3 className="text-lg font-black text-[#264653] mb-4">
        댓글 {commentCount > 0 && <span className="text-[#FF5A5F]">{commentCount}</span>}
      </h3>
      
      <div className="mb-6">
        <CommentInput
          onSubmit={handleSubmitComment}
          placeholder="댓글을 입력하세요..."
          isLoading={createComment.isPending}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF5A5F] border-t-transparent" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: CommentWithReplies) => (
            <div key={comment.id}>
              <CommentItem 
                comment={comment} 
                onReply={setReplyingTo}
              />
              
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      isReply 
                    />
                  ))}
                </div>
              )}
              
              {replyingTo === comment.id && (
                <div className="ml-10 mt-3">
                  <CommentInput
                    onSubmit={handleSubmitReply}
                    placeholder="답글을 입력하세요..."
                    isLoading={createComment.isPending}
                    autoFocus
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-[#264653]/40 py-8">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      )}
    </div>
  );
}
