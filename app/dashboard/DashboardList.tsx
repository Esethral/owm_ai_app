'use client';

import { useState } from 'react';
import DashboardCard from './DashboardCard';

// Top creator shown on dashboard card
export interface TopCreator {
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

// All data needed to render a single dashboard card
export interface SessionCardData {
  id: string;
  startup_name: string;
  industry: string;
  target_audience: string;
  creator_requirements: string;
  created_at: string;
  topCreator: TopCreator | null;
}

// Get current session List from database
export default function DashboardList({ sessions: initial }: { sessions: SessionCardData[] }) {
  const [sessions, setSessions] = useState(initial);

  // Optimistically remove the session from the list, rollback if the API call fails
  async function handleDelete(id: string) {
    const snapshot = sessions;
    setSessions(s => s.filter(x => x.id !== id));
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch {
      setSessions(snapshot);
    }
  }

  // Shown if all sessions on this page are deleted client-side
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[#5a5a7a] text-center py-8">
        All sessions on this page deleted.{' '}
        <a href="/dashboard" className="text-[#6366f1] hover:underline">Go to page 1</a>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <DashboardCard
          key={session.id}
          {...session}
          onDelete={() => handleDelete(session.id)}
        />
      ))}
    </div>
  );
}
