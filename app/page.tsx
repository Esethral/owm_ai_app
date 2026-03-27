'use client';

import { useState, useRef, useEffect, useLayoutEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Variable sleep function
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Pre-generated Andy speech bubble messages for loading screen
// can eventually be updated to have Andy actually say what he is thinking about the current creators and startup while loading
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

function HomePageInner() {
  // Initialize page and variables
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (searchParams.get('open') === '1') {
      setOpen(true);
      setChevronStatus('idle-open');
    }
  }, [searchParams]);

  // Reset loading state when browser back/forward restores this page
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        setLoading(false);
        setFadingOut(false);
        setAndyVisible(false);
        setAndyAnimating(false);
        setShowMatchButton(false);
        sessionIdRef.current = null;
        cancelledRef.current = false;
        pendingNavRef.current = false;
        apiReadyRef.current = false;
      }
    }
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // Home page and pre loading states and variables
  // Chevron indicator states on main button
  type ChevronStatus = 'idle-closed' | 'opening' | 'idle-open' | 'closing';
  const [chevronStatus, setChevronStatus] = useState<ChevronStatus>('idle-closed');
  const transitionMs = 300;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Loading variables and states
  const [andyVisible, setAndyVisible] = useState(false);
  const [andyAnimating, setAndyAnimating] = useState(false);
  const [showMatchButton, setShowMatchButton] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const slideMs = 500;
  const sessionIdRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const submissionGenRef = useRef(0);
  const pendingNavRef = useRef(false);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const andyVisibleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const andyAnimatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiReadyRef = useRef(false);
  const andyIsAnimatingRef = useRef(false);
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

  // Form input fields
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
        // Total cycle = 2800ms — bubble enters during pulse, visible through spin, exits at end
        setBubblePhase('entering');
        await sleep(650);   // slide in (pulse duration)
        if (cancelled) break;
        setBubblePhase('paused');
        await sleep(1500);  // visible through spin
        if (cancelled) break;
        setBubblePhase('exiting');
        await sleep(650);   // slide out (final pause + next pulse start)
        if (cancelled) break;
      }
    }
    cycle();
    return () => { cancelled = true; };
  }, [andyAnimating]);

  // Set Andy's speech bubble state (in the input form) based on loading/error state with smooth transitions
  type SpeechBubbleState = 'idle' | 'loading' | 'match' | 'error';
  const [shownBubble, setShownBubble] = useState<SpeechBubbleState>('idle');
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const targetBubble: SpeechBubbleState = error ? 'error' : showMatchButton ? 'match' : loading ? 'loading' : 'idle';
  const bubbleFirstRun = useRef(true);
  // Update speech bubble whenever SpeechBubbleState changes
  useLayoutEffect(() => {
    if (bubbleFirstRun.current) { bubbleFirstRun.current = false; return; }
    const raf = requestAnimationFrame(() => setBubbleVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [shownBubble]);
  // If targetBubble updates, hide current bubble, then update to new bubble with delay so transition looks smooth
  useEffect(() => {
    if (shownBubble === targetBubble) return;
    setBubbleVisible(false);
    const t = setTimeout(() => setShownBubble(targetBubble), 180);
    return () => clearTimeout(t);
  }, [targetBubble]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create references to important DOM elements
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // While input form is opening, track its position and scroll to keep it centered in the viewport
  useEffect(() => {
    if (!open || !formRef.current) return;
    const startTime = performance.now();
    const duration = 520;
    let rafId: number;
    function frame() {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      const formCenterInViewport = rect.top + rect.height / 2;
      const desiredScrollY = window.scrollY + formCenterInViewport - window.innerHeight / 2;
      window.scrollTo(0, Math.max(0, desiredScrollY));
      if (performance.now() - startTime < duration) {
        rafId = requestAnimationFrame(frame);
      }
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [open]);

  // // Close dropdown when clicking outside
  // useEffect(() => {
  //   function onPointerDown(e: PointerEvent) {
  //     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && open) {
  //       setOpen(false);
  //       setChevronStatus('closing');
  //       setTimeout(() => setChevronStatus('idle-closed'), transitionMs);
  //     }
  //   }
  //   document.addEventListener('pointerdown', onPointerDown);
  //   return () => document.removeEventListener('pointerdown', onPointerDown);
  // }, []);

  // Handle error state of not filling in all form fields
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (error && updated.startup_name && updated.industry && updated.target_audience && updated.creator_requirements) {
      setError('');
    }
  }

  // Finish loading once both the API has responded AND Andy has animated for the minimum time
  function tryFinishLoading() {
    if (apiReadyRef.current && andyIsAnimatingRef.current) {
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
      setAndyAnimating(false);
      andyIsAnimatingRef.current = false;
      setShowMatchButton(true);
    }
  }

  // Submit button to start loading animation and sequence
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || !form.creator_requirements) {
      setError('Don\'t forget to fill in all the blanks!');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    submissionGenRef.current += 1;
    const myGen = submissionGenRef.current;
    sessionIdRef.current = null;
    cancelledRef.current = false;
    pendingNavRef.current = false;
    apiReadyRef.current = false;
    andyIsAnimatingRef.current = false;
    setLoading(true);
    setShowMatchButton(false);
    setError('');
    andyVisibleTimerRef.current = setTimeout(() => setAndyVisible(true), slideMs);
    andyAnimatingTimerRef.current = setTimeout(() => {
      setAndyAnimating(true);
      andyIsAnimatingRef.current = true;
      // Minimum animation time so it never feels too abrupt
      matchTimerRef.current = setTimeout(() => tryFinishLoading(), 1500);
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
      if (submissionGenRef.current !== myGen || cancelledRef.current) {
        fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
        return;
      }
      sessionIdRef.current = session.id;
      apiReadyRef.current = true;
      tryFinishLoading();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (andyVisibleTimerRef.current) clearTimeout(andyVisibleTimerRef.current);
      if (andyAnimatingTimerRef.current) clearTimeout(andyAnimatingTimerRef.current);
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
      andyIsAnimatingRef.current = false;
      setAndyAnimating(false);
      setAndyVisible(false);
      setShowMatchButton(false);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setTimeout(() => setLoading(false), slideMs);
    }
  }

  // After loading Match button
  function handleMatchButtonClick() {
    setBubblePhase('hidden');
    setFadingOut(true);
    setTimeout(() => router.push(`/matches/${sessionIdRef.current}`), 500);
  }

  return (
    <div
      className="relative min-h-[calc(100vh-56px)] overflow-x-hidden px-6"
      style={{ opacity: fadingOut ? 0 : 1, transition: fadingOut ? 'opacity 450ms ease' : undefined }}
    >

      {/* Background watermark slogan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
        <div className="absolute" style={{ inset: '-80%', transform: 'rotate(-12deg)' }}>
          {Array.from({ length: 25 }).map((_, row) => (
            <div
              key={row}
              className="flex whitespace-nowrap mb-10"
              style={{ animation: `${row % 2 === 0 ? 'marquee-left' : 'marquee-right'} 55s linear infinite` }}
            >
              {Array.from({ length: 50 }).map((_, i) => (
                <span
                  key={i}
                  className="font-black uppercase"
                  style={{ color: '#181830', fontSize: '3.75rem', letterSpacing: '0.15em', paddingRight: '4rem' }}
                >
                  INFLUENCE FOR EQUITY
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating speech bubbles behind Andy, slide left to right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: bubbleTop,
          left: bubbleSide === 'left' ? 'calc(50% - 330px)' : 'calc(50% + 120px)',
          transform: (bubblePhase === 'entering' || bubblePhase === 'paused')
            ? 'translateX(0px)'
            : bubblePhase === 'exiting'
              ? 'translateX(200vw)'
              : 'translateX(-200vw)',
          transition: bubblePhase === 'hidden' ? 'none' : 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
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
        style={{ transform: andyVisible ? 'translateX(0)' : 'translateX(-120%)', zIndex: 10 }}
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
          {/* Post loading View Matches button */}
          <button
            onClick={handleMatchButtonClick}
            className="relative flex items-center gap-3 bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#3730a3] rounded-2xl rounded-tl-sm px-6 py-3.5 mt-4 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.55)] hover:scale-[1.03] active:scale-[0.98]"
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

      {/* Main page area for buttons and form input */}
      <div
        className={`relative flex flex-col items-center${(loading && showMatchButton) ? ' pointer-events-none' : ''}`}
        ref={dropdownRef}
        style={{
          minHeight: 'calc(100vh - 56px)',
          zIndex: loading ? 20 : undefined,
        }}
      >
        {/* Main title - O W M - centered betwwen top button and header and adjusts scale automatically
          Becomes scrollable if OWM Is pushed off screen by small screen size */}
        <div style={{ flex: 3, minHeight: 'calc(clamp(3rem, min(18vw, 22vh), 20rem) + 3rem)' }} className="relative w-full">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: loading ? 'translateX(200vw)' : 'none',
              transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1)',
              transitionDelay: loading ? '250ms' : '0ms',
            }}
          >
            <h1
              className="font-black text-white leading-none select-none"
              style={{ fontFamily: 'var(--font-geist-sans)', fontSize: 'clamp(4rem, min(22vw, 26vh), 24rem)', letterSpacing: '0.35em', paddingLeft: '0.35em' }}
            >
              OWM
            </h1>
          </div>
        </div>

        {/* Find Your Match button —> slides fully off screen right */}
        <div
          className="flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
        </div>

        {/* Dropdown form —> slides right but stays on screen during loading */}
        <div
          ref={formRef}
          className="flex-shrink-0 w-[480px] max-w-[calc(100vw-3rem)] grid transition-[grid-template-rows,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            gridTemplateRows: open ? '1fr' : '0fr',
            transform: showMatchButton ? 'translateX(150vw)' : loading ? 'translateX(calc(50vw - 50% - 1.5rem))' : 'translateX(0)',
          }}
        >
          <div className="overflow-hidden pt-3">
            <div className="rounded-2xl bg-[#13131f] border border-[#252540] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Form Input Header */}
              <div className="px-4 py-2 border-b border-[#1e1e35] flex items-center gap-3">
                {/* Andy avatar */}
                <span className="relative flex h-10 w-10 shrink-0">
                  <Image src="/images/Andy.png" alt="Andy" width={40} height={40} className="rounded-full object-cover" />
                  <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-[#10b981] border-2 border-[#13131f]" />
                </span>
                {/* Andy's speech bubble */}
                <div className={`relative rounded-2xl rounded-tl-sm px-4 py-2.5 border ${shownBubble === 'error' ? 'bg-[#1a0a0e] border-[#f43f5e]/40' : 'bg-[#1a1a2e] border-[#252540]'}`}>
                  <span className={`absolute -left-[7px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] ${shownBubble === 'error' ? 'border-r-[#f43f5e]/40' : 'border-r-[#252540]'}`} />
                  <span className={`absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] ${shownBubble === 'error' ? 'border-r-[#1a0a0e]' : 'border-r-[#1a1a2e]'}`} />
                  <p
                    className={`text-sm font-medium ${shownBubble === 'error' ? 'text-[#f43f5e]' : 'text-[#f0f0ff]'}`}
                    style={{ opacity: bubbleVisible ? 1 : 0, transform: bubbleVisible ? 'translateY(0)' : 'translateY(-5px)', transition: 'opacity 0.18s ease, transform 0.18s ease' }}
                  >
                    {shownBubble === 'error' ? error : shownBubble === 'match' ? 'Sweet story! Let me see what I can find...' : shownBubble === 'loading' ? 'Sounds good! Let me think here...' : 'Hey, I\'m Andy! Give me the full story!'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-3 space-y-2">
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
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
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
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
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
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="creator_requirements" className="block text-xs font-medium text-[#5a5a7a] uppercase tracking-wider">
                    Creator requirements
                  </label>
                  <textarea
                    id="creator_requirements"
                    name="creator_requirements"
                    rows={2}
                    placeholder="e.g. Someone covering mental health and productivity, ideally with a newsletter presence."
                    value={form.creator_requirements}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0c0c14] border border-[#252540] text-[#f0f0ff] placeholder:text-[#3a3a58] focus:border-[#6366f1] focus:bg-[#0e0e1a] focus:ring-1 focus:ring-[#6366f1]/30 outline-none transition-all text-sm resize-none leading-relaxed"
                  />
                </div>

                {/* Transform initial input form box when clicking submit to transition it to the loading screen */}
                <div className="pt-1">
                  <button
                    type={loading ? 'button' : 'submit'}
                    onClick={loading ? () => {
                      cancelledRef.current = true;
                      submissionGenRef.current += 1;
                      abortRef.current?.abort();
                      if (andyVisibleTimerRef.current) clearTimeout(andyVisibleTimerRef.current);
                      if (andyAnimatingTimerRef.current) clearTimeout(andyAnimatingTimerRef.current);
                      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
                      if (sessionIdRef.current) {
                        fetch(`/api/sessions/${sessionIdRef.current}`, { method: 'DELETE' });
                      }
                      sessionIdRef.current = null;
                      pendingNavRef.current = false;
                      apiReadyRef.current = false;
                      andyIsAnimatingRef.current = false;
                      setAndyAnimating(false);
                      setShowMatchButton(false);
                      setError('');
                      setAndyVisible(false);
                      setTimeout(() => setLoading(false), slideMs);
                    } : undefined}
                    className="w-full h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:brightness-95 hover:scale-[1.01] active:scale-[0.99] transition-transform"
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

        {/* Spacer between form and View Previous Matches */}
        <div className="h-5" />

        {/* View Previous Matches */}
        <div
          className="flex justify-center pb-[5vh] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: loading ? 'translateX(150vw)' : 'translateX(0)' }}
        >
          <Link
            href="/dashboard"
            className="px-10 py-3 rounded-full border border-[#363660] hover:border-[#4a4a70] hover:bg-[#1a1a2e] text-[#b0b0cc] hover:text-[#f0f0ff] text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            View Previous Matches
          </Link>
        </div>
      </div>

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
