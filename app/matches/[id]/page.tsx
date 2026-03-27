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
        ? { ...base, name: rating.name, age: rating.age, handle: rating.handle, platform: rating.platform, ...(rating.secondary_platform ? { secondary_platform: rating.secondary_platform } : {}), ...(rating.tertiary_platform ? { tertiary_platform: rating.tertiary_platform } : {}), niche: rating.niche, ...(rating.secondary_niche ? { secondary_niche: rating.secondary_niche } : {}), ...(rating.tertiary_niche ? { tertiary_niche: rating.tertiary_niche } : {}), audience: rating.audience, one_liner: rating.one_liner, why_fit: rating.why_fit }
        : { ...base, name: '', age: 0, handle: '', platform: '', niche: '', audience: '' };
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
