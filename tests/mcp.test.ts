import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  getNeonClient: () => {
    const tag = Object.assign(
      vi.fn().mockResolvedValue([]),
      { transaction: vi.fn().mockResolvedValue([[], [], [], []]) }
    );
    return tag;
  },
}));

vi.mock('@/lib/log', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

process.env.MCP_API_KEY = 'test-key-123';

import { GET, POST } from '@/app/api/mcp/route';

const AUTH = { Authorization: 'Bearer test-key-123' };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH, ...headers },
    body: JSON.stringify(body),
  }) as never;
}

describe('GET /api/mcp', () => {
  it('returns capability doc without auth', async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe('overseer-mcp');
    expect(body.tools.map((t: { name: string }) => t.name)).toEqual([
      'get_repo_health',
      'list_tasks',
    ]);
  });
});

describe('POST /api/mcp auth', () => {
  it('returns 401 without Authorization header', async () => {
    const req = new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
    }) as never;
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe(-32001);
  });

  it('returns 401 with wrong key', async () => {
    const req = new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
    }) as never;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/mcp methods', () => {
  it('initialize returns server info', async () => {
    const res = await POST(post({ jsonrpc: '2.0', method: 'initialize', id: 1 }));
    const body = await res.json();
    expect(body.result.serverInfo.name).toBe('overseer-mcp');
    expect(body.result.protocolVersion).toBe('2024-11-05');
  });

  it('tools/list returns both tools', async () => {
    const res = await POST(post({ jsonrpc: '2.0', method: 'tools/list', id: 2 }));
    const body = await res.json();
    const names = body.result.tools.map((t: { name: string }) => t.name);
    expect(names).toContain('get_repo_health');
    expect(names).toContain('list_tasks');
  });

  it('unknown tool returns -32601', async () => {
    const res = await POST(
      post({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'no_such_tool', arguments: {} }, id: 3 })
    );
    const body = await res.json();
    expect(body.error.code).toBe(-32601);
  });

  it('unknown method returns -32601', async () => {
    const res = await POST(post({ jsonrpc: '2.0', method: 'bogus/method', id: 4 }));
    const body = await res.json();
    expect(body.error.code).toBe(-32601);
  });

  it('invalid JSON returns -32700', async () => {
    const req = new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: 'not-json',
    }) as never;
    const res = await POST(req);
    const body = await res.json();
    expect(body.error.code).toBe(-32700);
  });
});
