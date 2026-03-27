import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

export type Creator = {
  id: string;
  name: string;
  niche: string;
  platform: string;
  follower_range: string;
  one_liner: string;
  why_fit: string;
  match_score: number;
};

export type Session = {
  id: string;
  startup_name: string;
  industry: string;
  target_audience: string;
  creator_requirements: string;
  creators: Creator[];
  created_at: string;
};

type Store = { sessions: Session[] };

function read(): Store {
  if (!fs.existsSync(DB_PATH)) return { sessions: [] };
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Store;
}

function write(store: Store) {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function listSessions(): Session[] {
  return read().sessions.slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getSession(id: string): Session | null {
  return read().sessions.find((s) => s.id === id) ?? null;
}

export function createSession(session: Session): Session {
  const store = read();
  store.sessions.push(session);
  write(store);
  return session;
}

export function deleteSession(id: string): boolean {
  const store = read();
  const before = store.sessions.length;
  store.sessions = store.sessions.filter((s) => s.id !== id);
  if (store.sessions.length === before) return false;
  write(store);
  return true;
}
