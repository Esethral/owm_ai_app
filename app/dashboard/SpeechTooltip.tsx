'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  text: string;
  children: React.ReactNode;
}

export default function SpeechTooltip({ text, children }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {/* Andy speech bubble tooltip */}
      <div
        className="absolute bottom-full left-0 mb-2.5 z-50 flex items-start gap-1.5 pointer-events-none"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}
      >
        <div className="relative w-5 h-5 flex-shrink-0 mt-0.5 rounded-full ring-2 ring-[#6366f1]/60 bg-[#1a1a2e]">
          <Image src="/images/Andy.png" alt="Andy" fill className="rounded-full object-cover" />
        </div>
        <div className="relative rounded-xl rounded-tl-sm bg-[#1a1a2e] border border-[#252540] shadow-[0_8px_24px_rgba(0,0,0,0.5)] px-3 py-2 whitespace-nowrap">
          {/* left tail toward Andy */}
          <span className="absolute -left-[5px] top-[7px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#252540]" />
          <span className="absolute -left-[4px] top-[7px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#1a1a2e]" />
          {/* downward tail toward trigger */}
          <span className="absolute -bottom-[5px] left-6 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#252540]" />
          <span className="absolute -bottom-[4px] left-6 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1a1a2e]" />
          <p className="text-xs text-[#f0f0ff]">{text}</p>
        </div>
      </div>
    </div>
  );
}
