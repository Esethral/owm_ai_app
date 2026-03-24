import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession, type Creator } from '@/lib/db';

// Platform icon colors
const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  youtube:    { bg: '#ff0000/10', text: '#ff4444' },
  tiktok:     { bg: '#69c9d0/10', text: '#69c9d0' },
  instagram:  { bg: '#e1306c/10', text: '#e1306c' },
  podcast:    { bg: '#f59e0b/10', text: '#f59e0b' },
  newsletter: { bg: '#10b981/10', text: '#10b981' },
  substack:   { bg: '#10b981/10', text: '#10b981' },
  twitter:    { bg: '#1d9bf0/10', text: '#1d9bf0' },
  linkedin:   { bg: '#0a66c2/10', text: '#5b9bd5' },
  default:    { bg: '#6366f1/10', text: '#6366f1' },
};

function getPlatformStyle(platform: string) {
  const key = platform.toLowerCase();
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return PLATFORM_COLORS.default;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Avatar accent colors cycled by index
const AVATAR_ACCENTS = ['#6366f1', '#f59e0b', '#10b981', '#e1306c', '#69c9d0'];

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back + breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#5a5a7a] hover:text-[#9898b8] transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Dashboard
      </Link>

      {/* Session header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-3xl font-semibold text-[#f0f0ff] tracking-tight">
            {session.startup_name}
          </h1>
          <span className="shrink-0 mt-1 text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 px-3 py-1 rounded-full">
            {session.industry}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-5 rounded-xl bg-[#13131f] border border-[#252540]">
          <div>
            <p className="text-xs text-[#5a5a7a] uppercase tracking-wider mb-1">Target audience</p>
            <p className="text-sm text-[#9898b8] leading-relaxed">{session.target_audience}</p>
          </div>
          <div>
            <p className="text-xs text-[#5a5a7a] uppercase tracking-wider mb-1">Creator brief</p>
            <p className="text-sm text-[#9898b8] leading-relaxed">{session.creator_requirements}</p>
          </div>
        </div>
      </div>

      {/* Creator matches */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-[#5a5a7a] uppercase tracking-wider mb-4">
          {session.creators.length} creator match{session.creators.length !== 1 ? 'es' : ''}
        </h2>
        <div className="space-y-4">
          {session.creators.map((creator, idx) => (
            <CreatorCard key={creator.id} creator={creator} accentColor={AVATAR_ACCENTS[idx % AVATAR_ACCENTS.length]} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-[#1e1e35] flex items-center justify-between">
        <p className="text-xs text-[#5a5a7a]">
          Matched {formatDate(session.created_at)}
        </p>
        <Link
          href="/"
          className="text-sm text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Run another match →
        </Link>
      </div>
    </div>
  );
}

function CreatorCard({ creator, accentColor }: { creator: Creator; accentColor: string }) {
  const platformStyle = getPlatformStyle(creator.platform);
  const scoreColor = creator.match_score >= 8 ? '#10b981' : creator.match_score >= 6 ? '#f59e0b' : '#9898b8';

  return (
    <div className="rounded-xl bg-[#13131f] border border-[#252540] overflow-hidden">
      {/* Card header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{ background: `${accentColor}20`, color: accentColor, border: `1.5px solid ${accentColor}30` }}
          >
            {getInitials(creator.name)}
          </div>

          {/* Name + niche */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h3 className="text-base font-medium text-[#f0f0ff]">{creator.name}</h3>
              {/* Match score */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: scoreColor, background: `${scoreColor}15`, border: `1px solid ${scoreColor}25` }}
              >
                {creator.match_score}/10
              </span>
            </div>
            <p className="text-sm text-[#9898b8]">{creator.niche}</p>
          </div>

          {/* Platform + followers */}
          <div className="shrink-0 text-right space-y-1">
            <span
              className="inline-block text-xs px-2.5 py-1 rounded-md"
              style={{
                color: platformStyle.text,
                background: `color-mix(in srgb, ${platformStyle.text} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${platformStyle.text} 20%, transparent)`,
              }}
            >
              {creator.platform}
            </span>
            <p className="text-xs text-[#5a5a7a]">{creator.follower_range}</p>
          </div>
        </div>

        {/* One-liner */}
        <p className="mt-4 text-sm text-[#f0f0ff] font-medium leading-relaxed border-l-2 border-[#6366f1] pl-3">
          &ldquo;{creator.one_liner}&rdquo;
        </p>
      </div>

      {/* Why fit — collapsible-looking but always open on detail page */}
      <div className="px-6 pb-6">
        <p className="text-xs text-[#5a5a7a] uppercase tracking-wider mb-2">Why this creator</p>
        <p className="text-sm text-[#9898b8] leading-relaxed">{creator.why_fit}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
