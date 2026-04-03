/**
 * Tests for Agent Task Queue API endpoint.
 * Covers authentication, valid task submission, and invalid payload handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/agent/tasks/route';
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
});

describe('Agent Task Queue Route Export', () => {
  it('should export POST function', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });
});
