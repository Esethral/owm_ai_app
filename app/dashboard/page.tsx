import Link from 'next/link';
import { listSessions } from '@/lib/db';
import { CREATOR_BASES } from '@/lib/fakeCreators';
import DashboardList, { type SessionCardData } from './DashboardList';

// How many cards can be on screen before creating another page
const PAGE_SIZE = 5;

// Pull list of all sessions and build dashboard cards for each one, passing necessary data as props
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(typeof pageParam === 'string' ? pageParam : '1', 10) || 1);

  // Get list of all sessions and create as many pages as needed
  const sessions = listSessions();
  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const pageSessions = sessions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-[#f0f0ff] tracking-tight mb-1">Matches</h1>
          <p className="text-sm text-[#5a5a7a]">
            {sessions.length === 0
              ? 'No sessions yet'
              : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DashboardList key={currentPage} sessions={pageSessions.map((session): SessionCardData => {
            const ratings = session.creator_ratings ?? {};
            const topEntry = Object.entries(ratings).sort((a, b) => b[1].matchPercent - a[1].matchPercent)[0];
            const topImagePath = topEntry?.[0];
            const topRating = topEntry?.[1];
            const topBase = topImagePath ? CREATOR_BASES[topImagePath] : null;

            // If there is a top creator, build out their creator card
            const topCreator = topBase && topRating && topImagePath ? {
              imagePath: topImagePath,
              name: topRating.name,
              age: topRating.age,
              handle: topRating.handle,
              platform: topRating.platform,
              ...(topRating.secondary_platform ? { secondary_platform: topRating.secondary_platform } : {}),
              ...(topRating.tertiary_platform ? { tertiary_platform: topRating.tertiary_platform } : {}),
              niche: topRating.niche,
              ...(topRating.secondary_niche ? { secondary_niche: topRating.secondary_niche } : {}),
              ...(topRating.tertiary_niche ? { tertiary_niche: topRating.tertiary_niche } : {}),
              audience: topRating.audience,
              matchPercent: topRating.matchPercent,
              reason: topRating.reason,
              one_liner: topRating.one_liner,
              why_fit: topRating.why_fit,
            } : null;

            return {
              id: session.id,
              startup_name: session.startup_name,
              industry: session.industry,
              target_audience: session.target_audience,
              creator_requirements: session.creator_requirements,
              created_at: session.created_at,
              topCreator,
            };
          })} />

          {/* Pagination arrows */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 pb-4">
              {currentPage > 1 ? (
                <Link
                  href={`/dashboard?page=${currentPage - 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#13131f] border border-[#252540] text-[#9898b8] hover:text-[#f0f0ff] hover:border-[#363660] hover:bg-[#1a1a2e] transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  aria-label="Previous page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Link>
              ) : (
                <div className="w-10 h-10" />
              )}

              <span className="text-xs text-[#5a5a7a] tabular-nums">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/dashboard?page=${currentPage + 1}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#13131f] border border-[#252540] text-[#9898b8] hover:text-[#f0f0ff] hover:border-[#363660] hover:bg-[#1a1a2e] transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  aria-label="Next page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// State of Dashboard when there are no sessions in the database
function EmptyState() {
  return (
    <div className="text-center py-24 px-6 border border-dashed border-[#252540] rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center mx-auto mb-5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h2 className="text-base font-medium text-[#f0f0ff] mb-2">No matches yet</h2>
      <p className="text-sm text-[#5a5a7a] max-w-xs mx-auto mb-6">
        Tell Andy about your startup and he&apos;ll find the creators who can grow it.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium transition-colors"
      >
        Run your first match →
      </Link>
    </div>
  );
}
