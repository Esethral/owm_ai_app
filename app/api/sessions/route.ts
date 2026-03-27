import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession, listSessions } from '@/lib/db';
import { generateCreatorMatches, generateCreatorRatings } from '@/lib/andy';
import { CREATOR_BASES, PERSON_IMAGES } from '@/lib/fakeCreators';

// Returns full list of Sessions in the database
export async function GET() {
  try {
    const sessions = listSessions();
    return Response.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    return Response.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}

// Posts current session to database, which includes the input form data and Andy's generated creator matches and ratings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startup_name, industry, target_audience, creator_requirements } = body;

    if (!startup_name || !industry || !target_audience || !creator_requirements) {
      return Response.json({ error: 'Don\'t forget to fill in all the blanks!' }, { status: 400 });
    }

    const fakeCreators = PERSON_IMAGES.map((src) => ({ imagePath: src, ...CREATOR_BASES[src] }));

    // Run both AI calls in parallel — Andy thinks about creator matches and rates the roster simultaneously - reduces latency
    const [creators, creator_ratings] = await Promise.all([
      generateCreatorMatches(startup_name, industry, target_audience, creator_requirements, request.signal),
      generateCreatorRatings(startup_name, industry, target_audience, creator_requirements, fakeCreators, request.signal),
    ]);

    const session = createSession({
      id: uuidv4(),
      startup_name,
      industry,
      target_audience,
      creator_requirements,
      creators,
      creator_ratings,
      created_at: new Date().toISOString(),
    });

    return Response.json(session, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(null, { status: 499 });
    }
    console.error('POST /api/sessions error:', err);
    return Response.json({ error: 'Failed to create a session... Let\'s try again!' }, { status: 500 });
  }
}
