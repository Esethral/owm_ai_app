import Link from 'next/link';
import { listSessions } from '@/lib/db';
import DeleteButton from './DeleteButton';

export default function DashboardPage() {
  const sessions = listSessions();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-[#f0f0ff] tracking-tight mb-1">Match sessions</h1>
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
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group flex items-center justify-between p-5 rounded-xl bg-[#13131f] border border-[#252540] hover:border-[#363660] transition-colors"
            >
              <Link href={`/sessions/${session.id}`} className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-base font-medium text-[#f0f0ff] truncate">
                    {session.startup_name}
                  </span>
                  <span className="shrink-0 text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 px-2 py-0.5 rounded-full">
                    {session.industry}
                  </span>
                </div>
                <p className="text-sm text-[#5a5a7a] truncate">{session.target_audience}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-[#5a5a7a]">
                    {session.creators.length} creator match{session.creators.length !== 1 ? 'es' : ''}
                  </span>
                  <span className="text-xs text-[#5a5a7a]">
                    {formatDate(session.created_at)}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/sessions/${session.id}`}
                  className="px-3 py-1.5 text-xs text-[#9898b8] hover:text-[#f0f0ff] border border-[#252540] hover:border-[#363660] rounded-lg transition-colors"
                >
                  View
                </Link>
                <DeleteButton sessionId={session.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
