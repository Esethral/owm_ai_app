'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface Props {
  text: string;
  children: React.ReactNode;
}

export default function SpeechTooltip({ text, children }: Props) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Only render portal after mount to avoid SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  function handleMouseEnter() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.left });
    }
    setShow(true);
  }

  // Andy speech bubble tooltip
  const tooltip = (
    <div
      className="fixed flex items-start gap-2 pointer-events-none"
      style={{
        top: pos.top,
        left: pos.left,
        // Anchor tooltip above the trigger and draw it on top layer: shift up by full height and gap
        transform: show ? 'translateY(calc(-100% - 10px))' : 'translateY(calc(-100% - 6px))',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        zIndex: 9999,
      }}
    >
      <div className="relative w-8 h-8 flex-shrink-0 mt-0.5 rounded-full ring-2 ring-[#6366f1]/60 bg-[#1a1a2e]">
        <Image src="/images/Andy.png" alt="Andy" fill className="rounded-full object-cover" />
      </div>
      <div className="relative rounded-xl rounded-tl-sm bg-[#1a1a2e] border border-[#252540] shadow-[0_8px_24px_rgba(0,0,0,0.5)] px-4 py-2.5 whitespace-nowrap">
        {/* left tail toward Andy */}
        <span className="absolute -left-[5px] top-[9px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#252540]" />
        <span className="absolute -left-[4px] top-[9px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#1a1a2e]" />
        {/* downward tail toward trigger */}
        <span className="absolute -bottom-[5px] left-7 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#252540]" />
        <span className="absolute -bottom-[4px] left-7 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1a1a2e]" />
        <p className="text-sm text-[#f0f0ff]">{text}</p>
      </div>
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {mounted && createPortal(tooltip, document.body)}
    </div>
  );
}
