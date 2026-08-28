/**
 * Tests for lib/agent-bridge.ts — the dispatch bridge between overseer's
 * agent task queue and agent-board's local model runtime ("motor-pool").
 *
 * Focus: once a session has been created in the runtime, every failure path
 * (a non-ok response, a thrown network error, or the shared deadline firing
 * mid-delivery) must still report that session id and the runtime name in a
 * degraded record. Losing that information — which the original inline
 * implementation did for the network-error case, and which consolidating the
 * timeout into a single `finally` would have made worse — leaves a live
 * session in agent-board that the queue can neither trace nor cancel, while
 * the task is nonetheless marked "completed" via the simulated fallback: the
 * same work can end up executing both for real and as a simulation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    motorPoolBridge,
    getMotorPoolBaseUrl,
    type DispatchableTask,
} from '@/lib/agent-bridge';

vi.mock('@/lib/log', () => ({ default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }));

const task: DispatchableTask = {
    id: 'task-1',
    type: 'lint',
    payload: { repo: 'overseer' },
    priority: 'normal',
};

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(body),
    } as unknown as Response;
}

describe('motorPoolBridge.dispatch', () => {
    const originalEnv = process.env.MOTOR_POOL_URL;

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        process.env.MOTOR_POOL_URL = 'http://motor-pool.test';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        // Assigning `undefined` to process.env would coerce it to the string
        // "undefined" instead of removing the key.
        if (originalEnv === undefined) {
            delete process.env.MOTOR_POOL_URL;
        } else {
            process.env.MOTOR_POOL_URL = originalEnv;
        }
    });

    it('reads the runtime base URL from MOTOR_POOL_URL, defaulting to localhost:3000', () => {
        delete process.env.MOTOR_POOL_URL;
        expect(getMotorPoolBaseUrl()).toBe('http://localhost:3000');
        process.env.MOTOR_POOL_URL = 'http://motor-pool.test';
        expect(getMotorPoolBaseUrl()).toBe('http://motor-pool.test');
    });

    it('returns a dispatched record with the session id on the full happy path', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ session: { id: 'sess-abc' } })) // create session
            .mockResolvedValueOnce(jsonResponse({ delivered: true }));           // deliver message

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task dispatched to motor-pool');
        expect(result.runtime).toBe('motor-pool');
        expect(result.motorPoolSessionId).toBe('sess-abc');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('falls back to plain simulated execution when session creation itself fails', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task executed (simulated)');
        // No session was ever created — nothing to trace, so no degraded markers.
        expect(result.runtime).toBeUndefined();
        expect(result.motorPoolSessionId).toBeUndefined();
        expect(result.dispatchDegraded).toBeUndefined();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('rejects a non-string session id and falls back to plain simulated execution', async () => {
        const fetchMock = vi.mocked(fetch);
        // A malformed runtime response: id is an object, not a string.
        fetchMock.mockResolvedValueOnce(jsonResponse({ session: { id: { nested: true } } }));

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task executed (simulated)');
        expect(result.motorPoolSessionId).toBeUndefined();
        // Only the session-creation call should have fired — an invalid id
        // must never be interpolated into the follow-up request URL.
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('URL-encodes the session id before requesting the message endpoint', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ session: { id: 'sess/with?special#chars' } }))
            .mockResolvedValueOnce(jsonResponse({ delivered: true }));

        await motorPoolBridge.dispatch(task);

        const messageCall = fetchMock.mock.calls[1];
        expect(messageCall[0]).toBe(
            'http://motor-pool.test/api/sessions/sess%2Fwith%3Fspecial%23chars/message'
        );
    });

    it('preserves the session id and marks the record degraded when message delivery is rejected', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ session: { id: 'sess-orphan-1' } }))
            .mockResolvedValueOnce(jsonResponse({}, false, 502));

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task executed (simulated)');
        expect(result.runtime).toBe('motor-pool');
        expect(result.motorPoolSessionId).toBe('sess-orphan-1');
        expect(result.dispatchDegraded).toBe(true);
    });

    it('preserves the session id when message delivery throws (network error / abort)', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ session: { id: 'sess-orphan-2' } }))
            .mockRejectedValueOnce(new Error('socket hang up'));

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task executed (simulated)');
        expect(result.runtime).toBe('motor-pool');
        expect(result.motorPoolSessionId).toBe('sess-orphan-2');
        expect(result.dispatchDegraded).toBe(true);
    });

    it('preserves the session id when the shared deadline aborts mid-delivery', async () => {
        // Regression guard for consolidating the timer into a single `finally`:
        // the deadline now spans both requests, so an abort firing after
        // session creation succeeded must still be traceable, not silently
        // indistinguishable from "no session was ever created".
        const fetchMock = vi.mocked(fetch);
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ session: { id: 'sess-timeout' } }))
            .mockImplementationOnce((_url, init) => {
                const signal = (init as RequestInit)?.signal;
                return new Promise((_resolve, reject) => {
                    signal?.addEventListener('abort', () => reject(new Error('This operation was aborted')));
                });
            });

        const result = await motorPoolBridge.dispatch(task, 20);

        expect(result.motorPoolSessionId).toBe('sess-timeout');
        expect(result.dispatchDegraded).toBe(true);
    });

    it('does not mark the record degraded when no session was ever created (plain network failure)', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockRejectedValueOnce(new Error('DNS lookup failed'));

        const result = await motorPoolBridge.dispatch(task);

        expect(result.acknowledgement).toBe('Task executed (simulated)');
        expect(result.motorPoolSessionId).toBeUndefined();
        expect(result.dispatchDegraded).toBeUndefined();
    });

    it('still fails a simulated "fail" task type when no runtime is configured', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockRejectedValueOnce(new Error('connection refused'));

        await expect(motorPoolBridge.dispatch({ ...task, type: 'fail' })).rejects.toThrow(
            'Task execution failed by request'
        );
    });
});
