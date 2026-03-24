'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Variable sleep function
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Pre-generated Andy speech bubble messages for loading screen
const BUBBLE_MESSAGES = [
  'Scanning creator databases...',
  'Analyzing audience overlap...',
  'Cross-referencing niches...',
  'Running compatibility scores...',
  'Checking engagement rates...',
  'Mapping brand affinities...',
  'Crunching the numbers...',
  'Filtering by audience fit...',
  'Looking for hidden gems...',
  'Calculating reach scores...',
  'Matching your vibe...',
  'Almost there...',
];

export default function HomePage() {
  // Initialize page and variables
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Home page and pre loading states and variables
  // Drives the chevron: idle-closed → opening → idle-open → closing → idle-closed
  type ChevronStatus = 'idle-closed' | 'opening' | 'idle-open' | 'closing';
  const [chevronStatus, setChevronStatus] = useState<ChevronStatus>('idle-closed');
  const transitionMs = 300;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Loading variables and states
  const [andyVisible, setAndyVisible] = useState(false);
  const [andyAnimating, setAndyAnimating] = useState(false);
  const [showMatchButton, setShowMatchButton] = useState(false);
  const [slidingOut, setSlidingOut] = useState(false);
  const slideMs = 500;
  const sessionIdRef = useRef<string | null>(null);
  const pendingNavRef = useRef(false);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  type BubblePhase = 'hidden' | 'entering' | 'paused' | 'exiting';
  const [bubbleText, setBubbleText] = useState('');
  const [bubblePhase, setBubblePhase] = useState<BubblePhase>('hidden');
  const [bubbleTop, setBubbleTop] = useState('calc(50% - 20px)');
  const [bubbleSide, setBubbleSide] = useState<'left' | 'right'>('left');


  // Elipses animation while Andy is thinking... syncs to his animation frames
  // const [dotCount, setDotCount] = useState(1);
  // useEffect(() => {
  //   if (!andyVisible) { setDotCount(0); return; }
  //   const duration = 2800;
  //   // Each entry: [ms into cycle, dot count]
  //   // Aligned to andy-loading: pulse 0–952ms, spin 952–2352ms, pause 2352–2800ms
  //   const keyframes: [number, number][] = [
  //     [0,    0],
  //     [700,  1],
  //     [1150, 2],
  //     [1600, 3],
  //     [2050, 2],
  //     [2500, 1],
  //     [2800, 0],
  //   ];
  //   const start = performance.now();
  //   let rafId: number;
  //   let prev = -1;
  //   function tick(now: number) {
  //     const elapsed = (now - start) % duration;
  //     let dots = 0;
  //     for (const [ms, d] of keyframes) {
  //       if (elapsed >= ms) dots = d;
  //     }
  //     if (dots !== prev) { setDotCount(dots); prev = dots; }
  //     rafId = requestAnimationFrame(tick);
  //   }
  //   rafId = requestAnimationFrame(tick);
  //   return () => cancelAnimationFrame(rafId);
  // }, [andyVisible]);

  const [form, setForm] = useState({
    startup_name: '',
    industry: '',
    target_audience: '',
    creator_requirements: '',
  });

  // While loading, have randomized placement and text for speech bubbles appear near spinning Andy
  useEffect(() => {
    if (!andyAnimating) { setBubblePhase('hidden'); return; }
    let cancelled = false;
    let i = Math.floor(Math.random() * BUBBLE_MESSAGES.length);
    async function cycle() {
      while (!cancelled) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        setBubblePhase('hidden');
        setBubbleText(BUBBLE_MESSAGES[i % BUBBLE_MESSAGES.length]);
        setBubbleTop(`calc(50% + ${Math.floor(Math.random() * 161) - 80}px)`);
        setBubbleSide(side);
        i++;
        // Double rAF: flush React render + browser paint before animating
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        if (cancelled) break;
        setBubblePhase('entering');
        await sleep(650);
        if (cancelled) break;
        setBubblePhase('paused');
        await sleep(1800);
        if (cancelled) break;
        setBubblePhase('exiting');
        await sleep(650);
        if (cancelled) break;
        await sleep(400);
      }
    }
    cycle();
    return () => { cancelled = true; };
  }, [andyAnimating]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && open) {
        setOpen(false);
        setChevronStatus('closing');
        setTimeout(() => setChevronStatus('idle-closed'), transitionMs);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  // Submit button to start loading animation and sequence
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || !form.creator_requirements) {
      setError('All fields are required.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    sessionIdRef.current = null;
    pendingNavRef.current = false;
    setLoading(true);
    setShowMatchButton(false);
    setError('');
    setTimeout(() => setAndyVisible(true), slideMs);
    setTimeout(() => {
      setAndyAnimating(true);
      matchTimerRef.current = setTimeout(() => {
        setAndyAnimating(false);
        setShowMatchButton(true);
      }, 1500);
    }, slideMs + 500);
    // Post JSON
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }
      const session = await res.json();
      sessionIdRef.current = session.id;
      if (pendingNavRef.current) {
        setSlidingOut(true);
        setTimeout(() => router.push(`/matches/${session.id}`), 600);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
      setAndyAnimating(false);
      setShowMatchButton(false);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  // After loading Match button
  function handleMatchButtonClick() {
    setBubblePhase('hidden');
    setSlidingOut(true);
    setTimeout(() => router.push('/matches'), 600);
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 overflow-hidden">

      {/* Floating speech bubbles behind Andy, slide left to right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: bubbleTop,
          left: bubbleSide === 'left' ? 'calc(50% - 330px)' : 'calc(50% + 120px)',
          transform: (slidingOut && bubblePhase !== 'hidden')
            ? 'translateX(120vw)'
            : (bubblePhase === 'entering' || bubblePhase === 'paused')
              ? 'translateX(0px)'
              : bubblePhase === 'exiting'
                ? 'translateX(200vw)'
                : 'translateX(-200vw)',
          transition: (slidingOut && bubblePhase !== 'hidden')
            ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)'
            : bubblePhase === 'hidden' ? 'none' : 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="relative bg-[#1a1a2e] border border-[#252540] rounded-2xl px-4 py-2.5">
          {bubbleSide === 'left' ? (
            <>
              <span className="absolute -right-[7px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[7px] border-l-[#252540]" />
              <span className="absolute -right-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[7px] border-l-[#1a1a2e]" />
            </>
          ) : (
            <>
              <span className="absolute -left-[7px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#252540]" />
              <span className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#1a1a2e]" />
            </>
          )}
          <p className="text-sm font-medium text-[#f0f0ff] whitespace-nowrap">{bubbleText}</p>
        </div>
      </div>

      {/* Andy loading screen —> slides in from left */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: slidingOut ? 'translateX(120%)' : andyVisible ? 'translateX(0)' : 'translateX(-120%)', zIndex: 10, transitionDelay: slidingOut ? '150ms' : '0ms' }}
      >
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/images/Andy.png"
            alt="Andy"
            width={160}
            height={160}
            className="rounded-full shadow-[0_0_60px_rgba(99,102,241,0.3)]"
            style={andyAnimating ? { animation: 'andy-loading 2.8s ease-in-out infinite' } : undefined}
          />
          {/* Post loading Match button */}
          <button
            onClick={handleMatchButtonClick}
            className="relative flex items-center gap-3 bg-[#6366f1] hover:bg-[#4f46e5] rounded-2xl rounded-tl-sm px-6 py-3.5 mt-4 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.55)]"
            style={{
              opacity: showMatchButton ? 1 : 0,
              transform: showMatchButton ? 'translateX(0)' : 'translateX(-120vw)',
              pointerEvents: showMatchButton ? 'auto' : 'none',
              transition: showMatchButton
                ? 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.4,0,0.2,1), background-color 150ms ease, box-shadow 150ms ease'
                : 'none',
            }}
          >
            <span className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[7px] border-b-[#6366f1]" />
            <p className="text-white text-lg font-semibold">Let&apos;s check those matches!</p>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main page content */}
      <div className={`flex flex-col items-center gap-5${(loading && showMatchButton) ? ' pointer-events-none' : ''}`} ref={dropdownRef}>

        {/* Find Your Match button —> slides fully off screen right */}
        <div
          className="transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: loading ? 'translateX(150vw)' : 'translateX(0)' }}
        >
          <button
            onClick={() => {
              if (chevronStatus === 'opening' || chevronStatus === 'closing') return;
              if (!open) {
                setOpen(true);
                setChevronStatus('opening');
                setTimeout(() => setChevronStatus('idle-open'), transitionMs);
              } else {
                setOpen(false);
                setChevronStatus('closing');
                setTimeout(() => setChevronStatus('idle-closed'), transitionMs);
              }
            }}
            className="relative px-20 py-6 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] active:scale-[0.98] text-white text-2xl font-semibold tracking-tight transition-all shadow-[0_0_60px_rgba(99,102,241,0.3)] hover:shadow-[0_0_80px_rgba(99,102,241,0.45)]"
          >
            Find Your Match
            <svg
              className="absolute right-8 top-1/2 -translate-y-1/2 opacity-70"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={
                chevronStatus === 'idle-closed'
                  ? { animation: 'bob-down 1.8s ease-in-out infinite' }
                  : chevronStatus === 'idle-open'
                  ? { animation: 'bob-up 1.8s ease-in-out infinite' }
                  : chevronStatus === 'opening'
                  ? { transform: 'rotate(180deg)', transition: `transform ${transitionMs}ms ease` }
                  : { transform: 'rotate(0deg)', transition: `transform ${transitionMs}ms ease` }
              }
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Dropdown form —> slides right but stays on screen */}
        <div
          className="w-[480px] max-w-[calc(100vw-3rem)] grid transition-[grid-template-rows,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            gridTemplateRows: open ? '1fr' : '0fr',
            transform: slidingOut ? 'translateX(150vw)' : loading ? 'translateX(calc(50vw - 50% - 24px))' : 'translateX(0)',
          }}
        >
          <div className="overflow-hidden pt-3">
            <div className="rounded-2xl bg-[#13131f] border border-[#252540] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Card header */}
              <div className="px-4 pt-4 pb-4 border-b border-[#1e1e35] flex items-center gap-3">
                {/* Andy avatar */}
                <span className="relative flex h-10 w-10 shrink-0">
                  <Image src="/images/Andy.png" alt="Andy" width={40} height={40} className="rounded-full object-cover" />
                  <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#13131f]" />
                </span>
                {/* Speech bubble */}
                <div className="relative bg-[#1a1a2e] border border-[#252540] rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <span className="absolute -left-[7px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#252540]" />
                  <span className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#1a1a2e]" />
                  <p className="text-sm font-medium text-[#f0f0ff]">Hey, I&apos;m Andy! Give me the full story!</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="startup_name" className="block text-xs font-medium text-[#5a5a7a] uppercase tracking-wider">
                      Startup
                    </label>
                    <input
                      id="startup_name"
                      name="startup_name"
                      type="text"
                      placeholder="Forma Health"
                      value={form.startup_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="industry" className="block text-xs font-medium text-[#5a5a7a] uppercase tracking-wider">
                      Industry
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      placeholder="Women's health tech"
                      value={form.industry}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target_audience" className="block text-xs font-medium text-[#5a5a7a] uppercase tracking-wider">
                    Target audience
                  </label>
                  <input
                    id="target_audience"
                    name="target_audience"
                    type="text"
                    placeholder="e.g. Women 28–42 managing chronic stress"
                    value={form.target_audience}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="creator_requirements" className="block text-xs font-medium text-[#5a5a7a] uppercase tracking-wider">
                    Creator requirements
                  </label>
                  <textarea
                    id="creator_requirements"
                    name="creator_requirements"
                    rows={3}
                    placeholder="e.g. Someone covering mental health and productivity, ideally with a newsletter presence."
                    value={form.creator_requirements}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#f43f5e] bg-[#f43f5e]/8 border border-[#f43f5e]/20 px-3 py-2.5 rounded-lg flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </p>
                )}

                {/* Transform initial input form box when clicking submit to transition it to the loading screen */}
                <div className="pt-1">
                  <button
                    type={loading ? 'button' : 'submit'}
                    onClick={loading ? () => {
                      abortRef.current?.abort();
                      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
                      sessionIdRef.current = null;
                      pendingNavRef.current = false;
                      setAndyAnimating(false);
                      setShowMatchButton(false);
                      setError('');
                      setAndyVisible(false);
                      setTimeout(() => setLoading(false), slideMs);
                    } : undefined}
                    className="w-full h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: loading ? '#f43f5e' : '#6366f1',
                      boxShadow: loading
                        ? '0 0 24px rgba(244,63,94,0.25)'
                        : '0 0 24px rgba(99,102,241,0.25)',
                      transition: 'background-color 600ms ease, box-shadow 600ms ease',
                    }}
                  >
                    {loading ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Cancel matching
                      </>
                    ) : (
                      <>
                        Find my creator matches
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* View Previous Matches button —> slides fully off screen right */}
        <div
          className="transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: loading ? 'translateX(150vw)' : 'translateX(0)' }}
        >
          <Link
            href="/dashboard"
            className="px-10 py-3 rounded-full border border-[#252540] hover:border-[#363660] text-[#9898b8] hover:text-[#f0f0ff] text-sm font-medium transition-all"
          >
            View Previous Matches
          </Link>
        </div>

      </div>
    </div>
  );
}
