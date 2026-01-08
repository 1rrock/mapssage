'use client';

import { Drawer } from 'vaul';
import type { TraceWithDistance } from '@/types/trace';

interface TraceListDrawerProps {
    traces: TraceWithDistance[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTraceClick: (trace: TraceWithDistance) => void;
}

export default function TraceListDrawer({
    traces,
    open,
    onOpenChange,
    onTraceClick,
}: TraceListDrawerProps) {
    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[80vh] flex-col rounded-t-3xl bg-white shadow-2xl outline-none">
                    <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-200" />

                    <div className="p-6">
                        <h2 className="text-xl font-black text-black mb-4">메시지 목록 ({traces.length})</h2>

                        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                            {traces.map((trace) => (
                                <button
                                    key={trace.id}
                                    onClick={() => onTraceClick(trace)}
                                    className="flex w-full items-center gap-4 rounded-2xl bg-gray-50 p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98] border border-transparent hover:border-black/5"
                                >
                                    {trace.imageUrl ? (
                                        <img
                                            src={trace.imageUrl}
                                            alt={trace.title}
                                            className="h-16 w-16 rounded-xl object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl bg-gray-200 flex items-center justify-center text-2xl">
                                            📍
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-black truncate">{trace.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{trace.content}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xs font-bold text-black">{trace.distance < 0.1 ? `${Math.round(trace.distance * 1000)}m` : `${trace.distance.toFixed(1)}km`}</span>
                                            <span className="text-[10px] text-gray-400">·</span>
                                            <span className="text-[10px] text-gray-400">{new Date(trace.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-black/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
