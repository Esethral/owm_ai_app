import { notFound } from 'next/navigation';
import { getSession } from '@/lib/db';
import { CREATOR_BASES, PERSON_IMAGES } from '@/lib/fakeCreators';
import MatchesReveal, { TileData } from './MatchesReveal';

// This page calls the database to populate all necessary fields and data based on a session ID
// Then passes it to the browser to immediately render the matches page
export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const ratings = session.creator_ratings ?? {};

  // Map through the PERSON_IMAGES (key) to create tiles data, updating it with Andy generated creator details and sorting by match percentage
  const tiles: TileData[] = [...PERSON_IMAGES]
    .map((src) => {
      const base = CREATOR_BASES[src];
      const rating = ratings[src];
      const creator = rating
        ? { ...base, name: rating.name, age: rating.age, handle: rating.handle, platforms: rating.platforms, niche: rating.niche, audience: rating.audience }
        : { ...base, name: '', age: 0, handle: '', platforms: [], niche: '', audience: '' };
      return {
        src,
        creator,
        matchPercent: rating?.matchPercent,
        reason: rating?.reason,
      };
    })
    .sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0));

  return (
    <MatchesReveal
      tiles={tiles}
      startupName={session.startup_name}
      industry={session.industry}
      targetAudience={session.target_audience}
      creatorRequirements={session.creator_requirements}
      createdAt={session.created_at}
    />
  );
}
