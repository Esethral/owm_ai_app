import type { NextRequest } from 'next/server';
import { getSession, deleteSession } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = getSession(id);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
    return Response.json(session);
  } catch (err) {
    console.error('GET /api/sessions/[id] error:', err);
    return Response.json({ error: 'Failed to load session' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = deleteSession(id);
    if (!deleted) return Response.json({ error: 'Session not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/sessions/[id] error:', err);
    return Response.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
