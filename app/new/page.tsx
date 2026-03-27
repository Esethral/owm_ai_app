'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    startup_name: '',
    industry: '',
    target_audience: '',
    creator_requirements: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || !form.creator_requirements) {
      setError('Don\'t forget to fill in all the blanks!');
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
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1] text-xs font-medium tracking-wide uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
          Andy is ready
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-[#f0f0ff] leading-[1.15] mb-4">
          Find your perfect<br />creator match.
        </h1>
        <p className="text-[#9898b8] text-lg leading-relaxed">
          Tell Andy about your startup. He&apos;ll find the creators who can actually move your audience — not just anyone with a following.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="startup_name" className="block text-sm font-medium text-[#9898b8]">
            Startup name
          </label>
          <input
            id="startup_name"
            name="startup_name"
            type="text"
            placeholder="e.g. Forma Health"
            value={form.startup_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#13131f] border border-[#252540] text-[#f0f0ff] placeholder:text-[#5a5a7a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-colors text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="industry" className="block text-sm font-medium text-[#9898b8]">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            placeholder="e.g. Women's health tech, B2B SaaS, Consumer fintech"
            value={form.industry}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#13131f] border border-[#252540] text-[#f0f0ff] placeholder:text-[#5a5a7a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-colors text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="target_audience" className="block text-sm font-medium text-[#9898b8]">
            Target audience
          </label>
          <input
            id="target_audience"
            name="target_audience"
            type="text"
            placeholder="e.g. Women 28–42 managing chronic stress while building careers"
            value={form.target_audience}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#13131f] border border-[#252540] text-[#f0f0ff] placeholder:text-[#5a5a7a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-colors text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="creator_requirements" className="block text-sm font-medium text-[#9898b8]">
            What are you looking for in a creator partner?
          </label>
          <textarea
            id="creator_requirements"
            name="creator_requirements"
            rows={4}
            placeholder="e.g. Someone who covers mental health and productivity without being preachy. Ideally with a newsletter or long-form content presence. We'd consider equity-for-content deals."
            value={form.creator_requirements}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#13131f] border border-[#252540] text-[#f0f0ff] placeholder:text-[#5a5a7a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-colors text-sm resize-none leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-sm text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/20 px-4 py-3 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Andy is thinking…
            </>
          ) : (
            'Find my creator matches →'
          )}
        </button>
      </form>

      {/* Loading overlay hint */}
      {loading && (
        <div className="mt-6 p-4 rounded-lg bg-[#6366f1]/5 border border-[#6366f1]/15">
          <p className="text-sm text-[#9898b8] leading-relaxed">
            Andy is analyzing your startup profile and identifying creators with the right audience fit, content style, and trust signals. This usually takes 10–20 seconds.
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
