/**
 * Tests for Agent Task Queue API endpoint.
 * Covers authentication, valid task submission, and invalid payload handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/agent/tasks/route';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';

const mockAuth = vi.mocked(auth);

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/agent/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const makeGetRequest = (query = '') =>
  new NextRequest(`http://localhost:3000/api/agent/tasks${query}`, {
    method: 'GET',
  });

const waitForTaskToSettle = async (
  taskId: string,
  timeoutMs = 5_000,
  pollIntervalMs = 50,
) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await GET(makeGetRequest(`?id=${taskId}`));
    const data = await response.json();

    if (data.task?.status === 'completed' || data.task?.status === 'failed') {
      return data.task;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Task ${taskId} did not settle within expected time`);
};

describe('POST /api/agent/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = makeRequest({ type: 'test', payload: {} });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 when session has no user', async () => {
    mockAuth.mockResolvedValue({ expires: '9999-01-01' } as never);

    const request = makeRequest({ type: 'test', payload: {} });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should accept a valid task with required fields and default priority', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({ type: 'build', payload: { repo: 'owner/repo' } });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(202);
    expect(data.status).toBe('accepted');
    expect(data.task.type).toBe('build');
    expect(data.task.priority).toBe('normal');
    expect(data.task.id).toBeDefined();
    expect(['queued', 'in_progress', 'completed']).toContain(data.task.status);
    expect(data.queuedAt).toBeDefined();
  });

  it('should accept a valid task with explicit priority and meta', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({
      type: 'deploy',
      payload: { env: 'production' },
      priority: 'high',
      meta: { triggeredBy: 'ci' },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(202);
    expect(data.task.priority).toBe('high');
    expect(data.task.meta).toEqual({ triggeredBy: 'ci' });
  });

  it('should return 400 when body is not a JSON object', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = new NextRequest('http://localhost:3000/api/agent/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('not-an-object'),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid task format');
    expect(data.details).toContain('Request body must be a JSON object');
  });

  it('should return 400 when type is missing', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({ payload: {} });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid task format');
    expect(data.details).toContain('type must be a string');
  });

  it('should return 400 when payload is not an object', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({ type: 'build', payload: 'invalid' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid task format');
    expect(data.details).toContain('payload must be an object');
  });

  it('should return 400 when priority is invalid', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({ type: 'build', payload: {}, priority: 'urgent' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid task format');
    expect(data.details).toContain('priority must be one of: low, normal, high');
  });

  it('should return 400 when meta is not an object', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = makeRequest({ type: 'build', payload: {}, meta: 'invalid' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid task format');
    expect(data.details).toContain('meta must be an object when provided');
  });

  it('should return 400 for malformed JSON without leaking error details', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const request = new NextRequest('http://localhost:3000/api/agent/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Malformed request');
    expect(data.details).toBeUndefined();
  });

  it('should execute queued task and expose completed result via GET by id', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const createResponse = await POST(
      makeRequest({ type: 'build', payload: { repo: 'owner/repo' }, priority: 'high' })
    );
    const createData = await createResponse.json();
    const taskId = createData.task.id as string;

    const settledTask = await waitForTaskToSettle(taskId);
    expect(settledTask.status).toBe('completed');
    expect(settledTask.result).toBeDefined();
    expect(settledTask.result.type).toBe('build');
  });

  it('should expose queue summary and tasks list via GET', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    await POST(makeRequest({ type: 'deploy', payload: { env: 'staging' } }));

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.total).toBe('number');
    expect(data.summary.total).toBeGreaterThan(0);
  });

  it('should return 404 when querying unknown task id', async () => {
    mockAuth.mockResolvedValue({
      user: { name: 'testuser', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as never);

    const response = await GET(makeGetRequest('?id=does-not-exist'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Task not found');
  });

  it('should require authentication on GET', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET(makeGetRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

describe('Agent Task Queue Route Export', () => {
  it('should export POST and GET functions', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });
});
