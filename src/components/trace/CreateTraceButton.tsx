'use client';

import { useState } from 'react';
import CreateTraceDrawer from './CreateTraceDrawer';

export default function CreateTraceButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 z-10 flex h-16 -translate-x-1/2 items-center gap-3 rounded-2xl bg-black px-8 shadow-2xl hover:bg-black/90 active:scale-[0.97] transition-all group"
        aria-label="메시지 남기기"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-6 w-6 text-white transition-transform group-hover:rotate-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white animate-ping opacity-75" />
        </div>
        <span className="text-lg font-black tracking-tight text-white">메시지 남기기</span>
      </button>

      <CreateTraceDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
