'use client';

import { Drawer } from 'vaul';
import type { TraceWithDistance } from '@/types/trace';
import CommentSection from '@/components/comment/CommentSection';

interface TraceDetailDrawerProps {
  trace: TraceWithDistance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TraceDetailDrawer({
  trace,
  open,
  onOpenChange,
}: TraceDetailDrawerProps) {
  if (!trace) return null;

  const formattedDate = new Date(trace.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const distanceText =
    trace.distance < 0.1
      ? `${Math.round(trace.distance * 1000)}m`
      : `${trace.distance.toFixed(1)}km`;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.4, 1]} activeSnapPoint={1}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex h-[96%] flex-col rounded-t-[32px] bg-white shadow-2xl outline-none transition-transform">
          <div className="flex-1 overflow-y-auto p-6 pt-12 relative">
            {/* Grab Handle */}
            <div className="mx-auto h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-200 absolute top-4 left-1/2 -translate-x-1/2" />

            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 text-[#264653]/40 hover:text-[#264653] rounded-xl hover:bg-[#264653]/5 transition-all z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="max-w-2xl mx-auto">
              {trace.imageUrl && (
                <div className="mb-8 group">
                  <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-xl shadow-black/5 transition-transform group-hover:scale-[1.01]">
                    <img
                      src={trace.imageUrl}
                      alt={trace.title}
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Drawer.Title className="text-3xl font-black leading-tight text-[#264653] tracking-tighter">
                    {trace.title}
                  </Drawer.Title>
                  <span className="flex-shrink-0 rounded-full bg-[#FF5A5F] px-4 py-1.5 text-sm font-black text-white shadow-lg shadow-[#FF5A5F]/20">
                    {distanceText}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#FF5A5F] font-bold text-sm">
                  <span>📬 {formattedDate}</span>
                </div>
              </div>

              <div className="mb-8 flex items-center gap-4 rounded-3xl bg-gray-50 p-4 shadow-sm border border-gray-100">
                <div className="relative">
                  {trace.user.image ? (
                    <img
                      src={trace.user.image}
                      alt={trace.user.name || 'User'}
                      className="h-12 w-12 rounded-2xl border-2 border-black/5 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center text-black">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black border-2 border-white flex items-center justify-center text-[10px] text-white">
                    ✓
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-black/40 uppercase tracking-widest leading-none mb-1">Sender</span>
                  <span className="text-lg font-black text-black leading-none">
                    {trace.user.name || '알 수 없는 사용자'}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-black/10 rounded-full" />
                <Drawer.Description className="whitespace-pre-wrap text-lg leading-relaxed text-black/80 font-medium pl-6">
                  {trace.content}
                </Drawer.Description>
              </div>

              <CommentSection traceId={trace.id} />

              <div className="h-12" />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
