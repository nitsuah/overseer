/**
 * Overseer MCP Server — exposes repo intelligence as MCP tools.
 *
 * Transport: HTTP JSON-RPC 2.0  (MCP spec 2024-11-05)
 * Auth:      Authorization: Bearer <MCP_API_KEY>
 * Rate limit: 60 req/min per IP (in-memory, resets on cold start)
 *
 * Tools
 *   get_repo_health  — health score, CI, vulns, activity for one repo
 *   list_tasks       — tasks for one repo, optional status filter
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNeonClient } from '@/lib/db';
import logger from '@/lib/log';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Rate limiting (in-memory; resets on cold start)
// ---------------------------------------------------------------------------

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function authenticate(req: NextRequest): boolean {
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${apiKey}`;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'get_repo_health',
    description:
      'Returns health score (0-100), CI status, vulnerability counts, and activity metrics for a tracked repository.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Repository name (e.g. "overseer") or full name (e.g. "nitsuah/overseer")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_tasks',
    description: 'Lists tasks for a tracked repository. Optionally filter by status.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Repository name or full name',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'Filter by status (optional — omit for all tasks)',
        },
      },
      required: ['name'],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function getRepoHealth(args: Record<string, unknown>): Promise<string> {
  const name = String(args.name ?? '');
  if (!name) throw new Error('"name" is required');

  const db = getNeonClient();
  const rows = await db`
    SELECT
      name, full_name, url, health_score, ci_status, language,
      open_prs, last_commit_date,
      vuln_alert_count, vuln_critical_count, vuln_high_count
    FROM repos
    WHERE name = ${name} OR full_name = ${name}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return JSON.stringify({ error: `Repository "${name}" not found in overseer` });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = rows[0] as Record<string, any>;
  return JSON.stringify({
    name:                r.name,
    full_name:           r.full_name,
    url:                 r.url,
    health_score:        r.health_score,
    ci_status:           r.ci_status,
    language:            r.language,
    open_prs:            r.open_prs ?? 0,
    last_commit_date:    r.last_commit_date,
    vuln_alert_count:    r.vuln_alert_count ?? 0,
    vuln_critical_count: r.vuln_critical_count ?? 0,
    vuln_high_count:     r.vuln_high_count ?? 0,
  });
}

async function listTasks(args: Record<string, unknown>): Promise<string> {
  const name   = String(args.name   ?? '');
  const status = typeof args.status === 'string' ? args.status : null;
  if (!name) throw new Error('"name" is required');

  const db = getNeonClient();
  const rows = status
    ? await db`
        SELECT title, status, section, subsection
        FROM tasks
        WHERE repo_id = (SELECT id FROM repos WHERE name = ${name} OR full_name = ${name})
          AND status = ${status}
        ORDER BY created_at ASC
      `
    : await db`
        SELECT title, status, section, subsection
        FROM tasks
        WHERE repo_id = (SELECT id FROM repos WHERE name = ${name} OR full_name = ${name})
        ORDER BY status, created_at ASC
      `;

   
  return JSON.stringify({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: (rows as any[]).map((t) => ({
      title:      t.title,
      status:     t.status,
      section:    t.section    ?? null,
      subsection: t.subsection ?? null,
    })),
    count: rows.length,
  });
}

// ---------------------------------------------------------------------------
// JSON-RPC dispatch
// ---------------------------------------------------------------------------

type JsonRpcRequest = {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id?: string | number | null;
};

function rpcError(id: unknown, code: number, message: string, status = 200) {
  return NextResponse.json({ jsonrpc: '2.0', error: { code, message }, id: id ?? null }, { status });
}

function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', result, id: id ?? null });
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/** GET /api/mcp — capability discovery (no auth required) */
export async function GET() {
  return NextResponse.json({
    name:            'overseer-mcp',
    version:         '0.1.0',
    protocolVersion: '2024-11-05',
    description:     'Overseer repo intelligence as MCP tools',
    tools:           TOOLS.map((t) => ({ name: t.name, description: t.description })),
    auth:            'Authorization: Bearer <MCP_API_KEY env var>',
    rateLimit:       `${RATE_LIMIT} requests / minute per IP`,
    endpoint:        'POST /api/mcp',
  });
}

/** POST /api/mcp — JSON-RPC 2.0 handler */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return rpcError(null, -32029, 'Rate limit exceeded (60 req/min)', 429);
  }

  if (!authenticate(req)) {
    return rpcError(null, -32001, 'Unauthorized — set Authorization: Bearer <MCP_API_KEY>', 401);
  }

  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, 'Parse error — body must be JSON-RPC 2.0');
  }

  const { method, params = {}, id } = body;

  try {
    switch (method) {
      case 'initialize':
        return rpcResult(id, {
          protocolVersion: '2024-11-05',
          capabilities:    { tools: {} },
          serverInfo:      { name: 'overseer-mcp', version: '0.1.0' },
        });

      case 'tools/list':
        return rpcResult(id, { tools: TOOLS });

      case 'tools/call': {
        const toolName = String(params.name ?? '');
        const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

        let text: string;
        if (toolName === 'get_repo_health') {
          text = await getRepoHealth(toolArgs);
        } else if (toolName === 'list_tasks') {
          text = await listTasks(toolArgs);
        } else {
          return rpcError(id, -32601, `Unknown tool: "${toolName}"`);
        }

        logger.info(`[MCP] tools/call ${toolName} (ip=${ip})`);
        return rpcResult(id, { content: [{ type: 'text', text }] });
      }

      default:
        return rpcError(id, -32601, `Method not found: "${method}"`);
    }
  } catch (error) {
    logger.warn('[MCP] Tool error:', error);
    return rpcError(id, -32603, error instanceof Error ? error.message : 'Internal error');
  }
}
