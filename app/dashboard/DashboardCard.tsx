'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { platformColor, platformUrl } from '@/lib/fakeCreators';
import DeleteButton from './DeleteButton';
import SpeechTooltip from './SpeechTooltip';

// Required props for a single sessions top creator Modal view
interface TopCreator {
  imagePath: string;
  name: string;
  age: number;
  handle: string;
  platforms: string[];
  niche: string;
  audience: string;
  matchPercent: number;
  reason?: string;
}

// All required props for a single session dashboard card
interface Props {
  id: string;
  startup_name: string;
  industry: string;
  target_audience: string;
  creator_requirements: string;
  created_at: string;
  topCreator: TopCreator | null;
}

// Have percentage wheel fill up based on percentage amount
function BigMatchRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#f43f5e';
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="relative text-xl font-black" style={{ color }}>{pct}%</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardCard({ id, startup_name, industry, target_audience, creator_requirements, created_at, topCreator }: Props) {
  // Initialize modals and states
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [creatorModal, setCreatorModal] = useState(false);
  const [creatorModalVisible, setCreatorModalVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session modal function state 
  useEffect(() => {
    if (!sessionModal) { setSessionModalVisible(false); return; }
    const raf = requestAnimationFrame(() => setSessionModalVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [sessionModal]);

  // Creator modal function state
  useEffect(() => {
    if (!creatorModal) { setCreatorModalVisible(false); return; }
    const raf = requestAnimationFrame(() => setCreatorModalVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [creatorModal]);

  // Close all modals
  const closeAll = useCallback(() => {
    setSessionModalVisible(false);
    setCreatorModalVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setSessionModal(false);
      setCreatorModal(false);
    }, 300);
  }, []);

  // Esc for modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeAll(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

  return (
    <>
      <div className="group flex items-center justify-between p-5 rounded-xl bg-[#13131f] border border-[#252540] hover:border-[#363660] transition-colors">

        {/* Left card - Session info */}
        <div
          className="w-80 shrink-0 min-w-0 cursor-pointer rounded-xl pl-2 py-2 pr-2 -ml-2 -my-2 mr-2 hover:bg-[#1a1a2e] active:bg-[#252540] transition-colors"
          onClick={() => setSessionModal(true)}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-base font-medium text-[#f0f0ff]">{startup_name}</span>
            <SpeechTooltip text={industry}>
              <span className="shrink-0 text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 px-2 py-0.5 rounded-full truncate max-w-[200px] cursor-default">
                {industry}
              </span>
            </SpeechTooltip>
          </div>
          <SpeechTooltip text={target_audience}>
            <p className="text-sm text-[#5a5a7a] truncate cursor-default max-w-[19rem]">{target_audience}</p>
          </SpeechTooltip>
          <p className="text-xs text-[#5a5a7a] mt-1">{formatDate(created_at)}</p>
        </div>

        {/* Divider */}
        {topCreator && <div className="w-px h-10 bg-[#1e1e35] shrink-0" />}

        {/* Middle - Top creator preview info */}
        {topCreator && (
          <div
            className="flex items-center gap-3 flex-1 min-w-0 mx-2 cursor-pointer rounded-xl p-2 hover:bg-[#1a1a2e] active:bg-[#252540] transition-colors"
            onClick={() => setCreatorModal(true)}
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#252540] shrink-0">
              <Image src={topCreator.imagePath} alt={`${topCreator.name} ${topCreator.handle}`} fill className="object-cover object-center" sizes="48px" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#f0f0ff] truncate">{topCreator.name}</p>
              <p className="text-xs text-[#5a5a7a] truncate">{topCreator.handle}</p>
              {topCreator.reason && (
                <SpeechTooltip text={topCreator.reason}>
                  <p className="text-xs text-[#6366f1] italic truncate max-w-[260px] cursor-default">&ldquo;{topCreator.reason}&rdquo;</p>
                </SpeechTooltip>
              )}
            </div>
          </div>
        )}

        {/* Right — Session actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/matches/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9898b8] hover:text-[#f0f0ff] border border-[#252540] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/10 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          </Link>
          <DeleteButton sessionId={id} />
        </div>
      </div>

      {/* Session Info Modal */}
      {sessionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: `rgba(0,0,0,${sessionModalVisible ? 0.75 : 0})`,
            backdropFilter: sessionModalVisible ? 'blur(6px)' : 'none',
            transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
          }}
          onClick={closeAll}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#1e1e35] bg-[#0f0f1c] shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-8"
            style={{
              opacity: sessionModalVisible ? 1 : 0,
              transform: sessionModalVisible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(16px)',
              transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeAll}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#252540] text-[#5a5a7a] hover:text-[#f0f0ff] hover:border-[#363660] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-4 mb-6">
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Startup</p>
                <p className="text-xl font-black text-[#f0f0ff]">{startup_name}</p>
              </div>
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Industry</p>
                <p className="text-sm text-[#c8c8e8]">{industry}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Target Audience</p>
                <p className="text-sm text-[#c8c8e8] leading-relaxed">{target_audience}</p>
              </div>
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Creator Requirements</p>
                <p className="text-sm text-[#c8c8e8] leading-relaxed">{creator_requirements}</p>
              </div>
              <p className="text-xs text-[#5a5a7a]">{formatDate(created_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Creator Profile Modal */}
      {creatorModal && topCreator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: `rgba(0,0,0,${creatorModalVisible ? 0.75 : 0})`,
            backdropFilter: creatorModalVisible ? 'blur(6px)' : 'none',
            transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
          }}
          onClick={closeAll}
        >
          <div
            className="relative flex w-full max-w-3xl rounded-3xl overflow-hidden border border-[#1e1e35] bg-[#0f0f1c] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(99,102,241,0.12)]"
            style={{
              maxHeight: '85vh',
              opacity: creatorModalVisible ? 1 : 0,
              transform: creatorModalVisible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(16px)',
              transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Profile Picture */}
            <div className="relative flex-shrink-0" style={{ width: '40%' }}>
              <Image src={topCreator.imagePath} alt={`${topCreator.name} ${topCreator.handle}`} fill className="object-cover object-center" sizes="40vw" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #0f0f1c)' }} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-5 px-8 py-8 min-w-0 overflow-y-auto">
              <button
                onClick={closeAll}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#252540] text-[#5a5a7a] hover:text-[#f0f0ff] hover:border-[#363660] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col gap-1.5">
                {topCreator.platforms.map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platformColor(p) }} />
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: platformColor(p) }}>
                      {p}
                    </span>
                    <a
                      href={platformUrl(p, topCreator.handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5a5a7a] hover:text-[#9898b8] underline underline-offset-2 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      {platformUrl(p, topCreator.handle).replace('https://www.', '').replace('https://', '')}
                    </a>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#f0f0ff] leading-tight">{topCreator.name}</h2>
                <p className="text-[#5a5a7a] text-sm mt-1">{topCreator.handle} · {topCreator.age} years old</p>
              </div>

              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Niche</p>
                <p className="text-[#c8c8e8] text-sm leading-relaxed">{topCreator.niche}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <BigMatchRing pct={topCreator.matchPercent} />
                  <p className="text-[10px] text-[#5a5a7a] uppercase tracking-widest">Match</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Audience</p>
                  <p className="text-2xl font-black text-[#f0f0ff]">{topCreator.audience}</p>
                  <p className="text-xs text-[#5a5a7a]">followers</p>
                </div>
              </div>

              {topCreator.reason && (
                <div className="rounded-xl bg-[#0e0e20] border border-[#6366f1]/20 px-4 py-3">
                  <p className="text-[10px] text-[#6366f1] font-semibold uppercase tracking-widest mb-2">Andy&apos;s take</p>
                  <p className="text-[#a5a5d0] text-sm leading-relaxed italic">&ldquo;{topCreator.reason}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
