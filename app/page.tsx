'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Drives the chevron: idle-closed → opening → idle-open → closing → idle-closed
  type ChevronStatus = 'idle-closed' | 'opening' | 'idle-open' | 'closing';
  const [chevronStatus, setChevronStatus] = useState<ChevronStatus>('idle-closed');
  const transitionMs = 300;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    startup_name: '',
    industry: '',
    target_audience: '',
    creator_requirements: '',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || !form.creator_requirements) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }
      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
      <div className="flex flex-col items-center gap-5" ref={dropdownRef}>

        {/* Main button */}
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

        {/* Dropdown form — always rendered, height animated via grid trick */}
        <div
          className="w-[480px] max-w-[calc(100vw-3rem)] grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
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
                  {/* Tail pointing left toward Andy */}
                  <span className="absolute -left-[7px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#252540]" />
                  <span className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-[#1a1a2e]" />
                  <p className="text-sm font-medium text-[#f0f0ff]">Hey, I&apos;m Andy! Give me the full story!</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Two-column row for name + industry */}
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
                    placeholder="e.g. Someone covering mental health and productivity — ideally with a newsletter presence."
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

                {/* Footer: submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-[0_0_24px_rgba(99,102,241,0.25)] hover:shadow-[0_0_32px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Andy is thinking…
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

        {/* Secondary button */}
        <Link
          href="/dashboard"
          className="px-10 py-3 rounded-full border border-[#252540] hover:border-[#363660] text-[#9898b8] hover:text-[#f0f0ff] text-sm font-medium transition-all"
        >
          View Previous Matches
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
