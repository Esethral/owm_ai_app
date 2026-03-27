'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import CreatorTile from './CreatorTile';
import { FakeCreator, platformColor, platformUrl } from '@/lib/fakeCreators';

// Individual data for each creator tile
export interface TileData {
  src: string;
  creator: FakeCreator;
  matchPercent: number;
  reason?: string;
}

// Required data for MatchesReveal screen
interface Props {
  tiles: TileData[]; // Sorted from highest percentage match -> lowest percentage match
  startupName: string;
  industry: string;
  targetAudience: string;
  creatorRequirements: string;
  createdAt: string;
}

// Set color of percentage wheel based on match percentage
function matchColor(pct: number): string {
  if (pct >= 75) return '#10b981';
  if (pct >= 55) return '#f59e0b';
  return '#f43f5e';
}

// Have percentage wheel fill up based on percentage amount
function BigMatchRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const color = matchColor(pct);
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

export default function MatchesReveal({ tiles, startupName, industry, targetAudience, creatorRequirements, createdAt }: Props) {
  // Initialize variables for text animation, tile reveals and modal states
  const [textPhase, setTextPhase] = useState<0 | 1 | 2 | 3>(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenRevealedCount, setHiddenRevealedCount] = useState(0); 
  const [selected, setSelected] = useState<TileData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const hiddenSectionRef = useRef<HTMLDivElement>(null);

  // Set high and low percent matches (High matches have 2 prioritys, those in top 4 and top 5-7 in an additional row if they meet the percentage cutoff)
  const highMatch  = tiles.filter(t => (t.matchPercent ?? 0) >= 75);
  const topFour    = highMatch.slice(0, 4);
  const bottomHigh = highMatch.slice(4, 7);
  const lowMatch   = [...highMatch.slice(7), ...tiles.filter(t => (t.matchPercent ?? 0) < 75)];

  // Start animation on load smoothly
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setTextPhase(1));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Text animation sequence. slide form bottom, pause, slide out top
  useEffect(() => {
    const t1 = setTimeout(() => setTextPhase(2), 1650);
    const t2 = setTimeout(() => setTextPhase(3), 2250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Reveal creator tiles with high percent matches in animation sequence
  useEffect(() => {
    if (textPhase < 3) return;
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      setRevealedCount(count);
      if (count >= highMatch.length) clearInterval(id);
    }, 130);
    return () => clearInterval(id);
  }, [textPhase, highMatch.length]);

  // Reveal creator tiles with low percent matches in animation sequence
  useEffect(() => {
    if (!showHidden) return;
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      setHiddenRevealedCount(count);
      if (count >= lowMatch.length) clearInterval(id);
    }, 130);
    return () => clearInterval(id);
  }, [showHidden, lowMatch.length]);

  // Button press to reveal low percent matches, then scroll to it
  function handleShowHidden() {
    setShowHidden(true);
    setTimeout(() => hiddenSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  // Animate creator modal opening and closing
  useEffect(() => {
    if (!selected) { setModalVisible(false); return; }
    const raf = requestAnimationFrame(() => setModalVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelected(null), 300);
  }, []);

  // Animate session modal opening and closing
  useEffect(() => {
    if (!sessionModal) { setSessionModalVisible(false); return; }
    const raf = requestAnimationFrame(() => setSessionModalVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [sessionModal]);

  const closeSessionModal = useCallback(() => {
    setSessionModalVisible(false);
    setTimeout(() => setSessionModal(false), 300);
  }, []);

  // Additional Modal close key -> ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { closeModal(); closeSessionModal(); } }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal, closeSessionModal]);

  // Text animation variables
  const textTransform =
    textPhase === 0 ? 'translateY(100vh)'
    : textPhase === 1 ? 'translateY(0)'
    : 'translateY(-110vh)';

  const textTransition =
    textPhase === 0 ? 'none'
    : textPhase === 1 ? 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
    : 'transform 0.55s cubic-bezier(0.7, 0, 0.84, 0)';

  return (
    <div className="bg-[#0c0c14]">

      {/* Intro overlay */}
      {textPhase < 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c14] pointer-events-none">
          <h1
            className="font-black text-white text-center leading-[0.88] select-none"
            style={{
              fontSize: 'clamp(3.5rem, 11vw, 9.5rem)',
              letterSpacing: '0.06em',
              transform: textTransform,
              transition: textTransition,
              textShadow: '0 0 80px rgba(99,102,241,0.55), 0 0 160px rgba(99,102,241,0.25)',
            }}
          >
            MEET YOUR<br />MATCHES
          </h1>
        </div>
      )}

      {/* Header for matches screen - not constant header */}
      <div
        className="relative flex items-center px-6 pt-5 pb-1"
        style={{
          opacity: revealedCount > 0 ? 1 : 0,
          transform: revealedCount > 0 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#1a1a2e] active:bg-[#252540] transition-colors"
          onClick={() => setSessionModal(true)}
        >
          <span className="text-lg font-extrabold text-[#f0f0ff] tracking-tight">{startupName}</span>
          <span className="w-px h-4 bg-[#363660]" />
          <span className="text-base font-semibold text-[#c0c0e0]">{industry}</span>
        </div>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-xl font-black text-[#f0f0ff] tracking-tight">Best Matches</h2>
      </div>

      {/* Top 4 match tiles in 2x2 grid */}
      <div
        className="relative grid grid-cols-2 gap-4 p-4"
        style={{
          height: 'calc(100vh - 56px - 162px)',
          gridTemplateRows: '1fr 1fr',
        }}
      >
        {topFour.map(({ src, creator, matchPercent, reason }, i) => (
          <div
            key={src}
            className="min-h-0"
            style={{
              opacity: revealedCount > i ? 1 : 0,
              transform: revealedCount > i ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <CreatorTile
              image={src} creator={creator} matchPercent={matchPercent}
              reason={reason} sizes="25vw"
              onClick={() => setSelected({ src, creator, matchPercent, reason })}
            />
          </div>
        ))}
      </div>

      {/* Additional high percent matches (5-7) in row 3, max of 3 tiles in the row */}
      {bottomHigh.length > 0 && (
        <div className="grid grid-cols-3 gap-3 px-3 pb-28" style={{ gridTemplateRows: `repeat(${Math.ceil(bottomHigh.length / 3)}, 30vh)` }}>
          {bottomHigh.map(({ src, creator, matchPercent, reason }, i) => (
            <div
              key={src}
              style={{
                opacity: revealedCount > i + 4 ? 1 : 0,
                transform: revealedCount > i + 4 ? 'translateY(0)' : 'translateY(22px)',
                transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <CreatorTile
                image={src} creator={creator} matchPercent={matchPercent}
                reason={reason} sizes="33vw"
                onClick={() => setSelected({ src, creator, matchPercent, reason })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom gradient overlay */}
      {!showHidden && (
        <div
          className="fixed bottom-0 inset-x-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0c0c14 40%, transparent)', height: 90 }}
        />
      )}

      {/* Arrow \v/ Additional Matches section */}
      {lowMatch.length > 0 && (
        <>

          {/* Additional matches arrow loads in after high percent matches load in */}
          {!showHidden && (
            <div
              className="fixed bottom-0 inset-x-0 flex flex-col items-center gap-2 pt-8 pb-4 pointer-events-none"
              style={{
                opacity: revealedCount >= highMatch.length ? 1 : 0,
                transition: 'opacity 0.55s ease',
              }}
            >
              <p className="text-xs text-[#9898b8] uppercase tracking-widest font-semibold rounded-full px-3 py-1" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.65)' }}>
                {lowMatch.length} more creator{lowMatch.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleShowHidden}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#252540] bg-[#13131f] text-[#5a5a7a] hover:text-[#f0f0ff] hover:border-[#363660] transition-colors pointer-events-auto"
                style={{ animation: revealedCount >= highMatch.length ? 'bob-down 1.8s ease-in-out infinite' : 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          )}

          {showHidden && (
            /* Additional Matches divider - High percent / Low percent */
            <div
              ref={hiddenSectionRef}
              className="flex items-center gap-4 px-6 py-6"
              style={{
                opacity: hiddenRevealedCount > 0 ? 1 : 0,
                transition: 'opacity 0.55s ease',
              }}
            >
              <div className="flex-1 h-px bg-[#1e1e35]" />
              <span className="text-sm font-semibold text-[#9898b8] uppercase tracking-widest">Additional Matches</span>
              <div className="flex-1 h-px bg-[#1e1e35]" />
            </div>
          )}

          {/* Low percent match tiles */}
          {showHidden && (
            <div className="grid grid-cols-3 gap-3 px-3 pb-8" style={{ gridTemplateRows: `repeat(${Math.ceil(lowMatch.length / 3)}, 28vh)` }}>
              {lowMatch.map(({ src, creator, matchPercent, reason }, i) => (
                <div
                  key={src}
                  style={{
                    opacity: hiddenRevealedCount > i ? 1 : 0,
                    transform: hiddenRevealedCount > i ? 'translateY(0)' : 'translateY(22px)',
                    transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <CreatorTile
                    image={src} creator={creator} matchPercent={matchPercent}
                    reason={reason} sizes="33vw"
                    onClick={() => setSelected({ src, creator, matchPercent, reason })}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Session info modal */}
      {sessionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: `rgba(0,0,0,${sessionModalVisible ? 0.75 : 0})`,
            backdropFilter: sessionModalVisible ? 'blur(6px)' : 'none',
            transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
          }}
          onClick={closeSessionModal}
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
              onClick={closeSessionModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#252540] text-[#5a5a7a] hover:text-[#f0f0ff] hover:border-[#363660] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-4 mb-6">
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Startup</p>
                <p className="text-xl font-black text-[#f0f0ff]">{startupName}</p>
              </div>
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Industry</p>
                <p className="text-sm text-[#c8c8e8]">{industry}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Target Audience</p>
                <p className="text-sm text-[#c8c8e8] leading-relaxed">{targetAudience}</p>
              </div>
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Creator Requirements</p>
                <p className="text-sm text-[#c8c8e8] leading-relaxed">{creatorRequirements}</p>
              </div>
              <p className="text-xs text-[#5a5a7a]">{formatDate(createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Creator Tile Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: `rgba(0,0,0,${modalVisible ? 0.75 : 0})`,
            backdropFilter: modalVisible ? 'blur(6px)' : 'none',
            transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
          }}
          onClick={closeModal}
        >
          <div
            className="relative flex w-full max-w-3xl rounded-3xl overflow-hidden border border-[#1e1e35] bg-[#0f0f1c] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(99,102,241,0.12)]"
            style={{
              maxHeight: '85vh',
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(16px)',
              transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Profile picture - left 40% */}
            <div className="relative flex-shrink-0" style={{ width: '40%' }}>
              <Image
                src={selected.src}
                alt={`${selected.creator.name} ${selected.creator.handle}`}
                fill
                className="object-cover object-center"
                sizes="40vw"
              />
              {/* Gradient from profile pic to content */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #0f0f1c)' }} />
            </div>

            {/* Content — right 60% */}
            <div className="flex-1 flex flex-col gap-5 px-8 py-8 min-w-0 overflow-y-auto">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#252540] text-[#5a5a7a] hover:text-[#f0f0ff] hover:border-[#363660] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Social Media Platforms */}
              <div className="flex flex-col gap-1.5">
                {selected.creator.platforms.map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platformColor(p) }} />
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: platformColor(p) }}>{p}</span>
                    <a
                      href={platformUrl(p, selected.creator.handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5a5a7a] hover:text-[#9898b8] underline underline-offset-2 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      {platformUrl(p, selected.creator.handle).replace('https://www.', '').replace('https://', '')}
                    </a>
                  </div>
                ))}
              </div>

              {/* Name, handle, age */}
              <div>
                <h2 className="text-3xl font-black text-[#f0f0ff] leading-tight">{selected.creator.name}</h2>
                <p className="text-[#5a5a7a] text-sm mt-1">{selected.creator.handle} · {selected.creator.age} years old</p>
              </div>

              {/* Niche */}
              <div className="rounded-xl bg-[#13131f] border border-[#1e1e35] px-4 py-3">
                <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Niche</p>
                <p className="text-[#c8c8e8] text-sm leading-relaxed">{selected.creator.niche}</p>
              </div>

              {/* Stats row - Match percentage & Audience (Follower Count) */}
              <div className="flex items-center gap-6">
                {selected.matchPercent !== undefined && (
                  <div className="flex flex-col items-center gap-1">
                    <BigMatchRing pct={selected.matchPercent} />
                    <p className="text-[10px] text-[#5a5a7a] uppercase tracking-widest">Match</p>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-[10px] text-[#5a5a7a] font-semibold uppercase tracking-widest mb-1">Audience</p>
                  <p className="text-2xl font-black text-[#f0f0ff]">{selected.creator.audience}</p>
                  <p className="text-xs text-[#5a5a7a]">followers</p>
                </div>
              </div>

              {/* Andy's reason/one-liner */}
              {selected.reason && (
                <div className="rounded-xl bg-[#0e0e20] border border-[#6366f1]/20 px-4 py-3">
                  <p className="text-[10px] text-[#6366f1] font-semibold uppercase tracking-widest mb-2">Andy&apos;s take</p>
                  <p className="text-[#a5a5d0] text-sm leading-relaxed italic">&ldquo;{selected.reason}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
