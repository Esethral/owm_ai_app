'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { FakeCreator, platformColor } from '@/lib/fakeCreators';
import SpeechTooltip from '@/app/dashboard/SpeechTooltip';

// Required Creator Tile props
interface Props {
  image: string;
  creator: FakeCreator;
  matchPercent: number;
  reason?: string;
  sizes?: string;
  onClick?: () => void;
}

// Color of percentage wheel
function matchColor(pct: number): string {
  if (pct >= 75) return '#10b981';
  if (pct >= 55) return '#f59e0b';
  return '#f43f5e';
}
// Have percentage wheel fill up based on percentage amount
function MatchRing({ pct }: { pct: number }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const color = matchColor(pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90" style={{ position: 'absolute', inset: 0 }}>
        {/* Track */}
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
        {/* Progress */}
        <circle
          cx="22" cy="22" r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative text-[11px] font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

export default function CreatorTile({ image, creator, matchPercent, reason, sizes = '25vw', onClick }: Props) {
  // Variables for 3D Tile effect - tile / glare position
  const tileRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const pct = matchPercent;

  // 3D Tile hover effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const tile = tileRef.current;
    const glare = glareRef.current;
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (y - 0.5) * -6;
    const rotY = (x - 0.5) * 6;
    tile.style.transition = 'transform 0.06s ease-out, box-shadow 0.06s ease-out';
    tile.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.012)`;
    tile.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.22), 0 12px 36px rgba(0,0,0,0.6), 0 0 24px rgba(99,102,241,0.06)';
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.055) 0%, transparent 55%)`;
      glare.style.opacity = '1';
    }
  }

  // 3D Tile ending animation
  function handleMouseLeave() {
    const tile = tileRef.current;
    const glare = glareRef.current;
    if (tile) {
      tile.style.transition = 'transform 0.45s ease-out, box-shadow 0.45s ease-out';
      tile.style.transform = '';
      tile.style.boxShadow = '';
    }
    if (glare) glare.style.opacity = '0';
  }

  // Set social media platform
  const primaryPlatform = creator.platforms[0] ?? '';
  const color = platformColor(primaryPlatform);

  // Return the fully compiled creator card
  return (
    <div
      ref={tileRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative flex h-full rounded-2xl overflow-hidden border border-[#252540] bg-[#13131f] shadow-[0_0_0_1px_rgba(99,102,241,0.06),0_8px_24px_rgba(0,0,0,0.55)] cursor-pointer"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Profile Picture — left half */}
      <div className="relative w-1/2 flex-shrink-0">
        <Image
          src={image}
          alt={`${creator.name} ${creator.handle}`}
          fill
          className="object-cover object-center"
          sizes={sizes}
        />
      </div>

      {/* Content — right half */}
      <div className="flex-1 flex flex-col justify-center gap-2 px-4 py-3 min-w-0">
        {/* Platform Indicator */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {creator.platforms.map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: platformColor(p) }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: platformColor(p) }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Name */}
        <div className="min-w-0">
          <p className="text-[#f0f0ff] font-semibold text-base leading-tight truncate">
            {creator.name}
          </p>
          <p className="text-[#5a5a7a] text-sm mt-0.5 truncate">{creator.handle} · {creator.age}</p>
        </div>

        {/* Niche */}
        <SpeechTooltip text={creator.niche}>
          <p className="text-[#9898b8] text-sm leading-snug line-clamp-1 cursor-default">{creator.niche}</p>
        </SpeechTooltip>

        {/* Andy's reason —> speech bubble */}
        {reason && (
          <div className="flex items-start gap-2">
            <div className="relative w-6 h-6 flex-shrink-0 mt-0.5">
              <Image src="/images/Andy.png" alt="Andy" fill className="rounded-full object-cover" />
            </div>
            <div className="relative rounded-xl rounded-tl-sm bg-[#1a1a2e] border border-[#252540] px-3 py-2 min-w-0">
              <span className="absolute -left-[5px] top-[8px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#252540]" />
              <span className="absolute -left-[4px] top-[8px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#1a1a2e]" />
              <p className="text-xs text-[#9898b8] leading-snug line-clamp-2 italic">{reason}</p>
            </div>
          </div>
        )}

        {/* Audience / Followers */}
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-[#f0f0ff] font-bold text-base">{creator.audience}</span>
          <span className="text-[#5a5a7a] text-xs">followers</span>
        </div>
      </div>

      {/* Percentage Match Ring */}
      <div className="absolute top-3 right-3">
        <MatchRing pct={pct} />
      </div>

      {/* Tile Glare on mouse hover */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0"
        style={{ transition: 'opacity 0.15s ease', background: 'transparent' }}
      />
    </div>
  );
}
