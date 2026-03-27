import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession, listSessions } from '@/lib/db';
import { generateCreatorMatches } from '@/lib/andy';

export async function GET() {
  try {
    const sessions = listSessions();
    return Response.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    return Response.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startup_name, industry, target_audience, creator_requirements } = body;

    if (!startup_name || !industry || !target_audience || !creator_requirements) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const creators = await generateCreatorMatches(
      startup_name,
      industry,
      target_audience,
      creator_requirements
    );

    const session = createSession({
      id: uuidv4(),
      startup_name,
      industry,
      target_audience,
      creator_requirements,
      creators,
      created_at: new Date().toISOString(),
    });

    return Response.json(session, { status: 201 });
  } catch (err) {
    console.error('POST /api/sessions error:', err);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
