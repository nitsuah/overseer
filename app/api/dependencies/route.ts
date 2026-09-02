import { NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';
import { auth } from '@/auth';
import { DEFAULT_REPOS } from '@/lib/default-repos';

export const runtime = 'nodejs';

interface RepoRow {
  id: string;
  name: string;
  full_name: string;
  language: string | null;
  topics: string[];
  description: string | null;
  url: string;
}

interface Connection {
  source: string;
  target: string;
  strength: number;
  reasons: string[];
}

/**
 * GET /api/dependencies
 * Infers cross-repo connections from shared topics and primary language.
 * Returns a graph of { nodes, edges } for the dashboard.
 */
export async function GET() {
  try {
    const session = await auth();
    const db = getNeonClient();

    const rows = await db`
      SELECT id, name, full_name, language, topics, description, url
      FROM repos
      WHERE (is_hidden = FALSE OR is_hidden IS NULL)
      ORDER BY name ASC
    ` as RepoRow[];

    if (rows.length === 0) {
      return NextResponse.json({ success: true, nodes: [], edges: [] });
    }

    // Unauthenticated: only default repos
    const visible = session
      ? rows
      : rows.filter((r) => DEFAULT_REPOS.some((d) => d.fullName === r.full_name));

    const nodes = visible.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      language: r.language,
      topics: r.topics ?? [],
      description: r.description,
      url: r.url,
    }));

    const edges: Connection[] = [];
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i];
        const b = visible[j];
        const aTopics = new Set((a.topics ?? []).map((t) => t.toLowerCase()));
        const bTopics = new Set((b.topics ?? []).map((t) => t.toLowerCase()));
        const sharedTopics = [...aTopics].filter((t) => bTopics.has(t));

        const reasons: string[] = [];
        let strength = 0;

        if (sharedTopics.length > 0) {
          strength += sharedTopics.length * 2;
          reasons.push(`shared topics: ${sharedTopics.join(', ')}`);
        }
        if (a.language && b.language && a.language.toLowerCase() === b.language.toLowerCase()) {
          strength += 1;
          reasons.push(`same language: ${a.language}`);
        }

        if (strength > 0) {
          edges.push({
            source: a.id,
            target: b.id,
            strength,
            reasons,
          });
        }
      }
    }

    return NextResponse.json({ success: true, nodes, edges });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}