// Dispatch bridge v0 — routes queued overseer agent tasks to agent-board's
// local model runtime ("motor-pool") and reports the outcome back to the queue.
//
// The queue in app/api/agent/tasks/route.ts owns scheduling and status; this
// module owns the transport. Keeping them separate means a second runtime can
// be added by implementing AgentRuntimeBridge without touching the queue.

import logger from './log';

export type AgentTaskRecord = Record<string, unknown>;

/** The subset of a queued task the bridge needs in order to dispatch it. */
export interface DispatchableTask {
    id: string;
    type: string;
    payload: AgentTaskRecord;
    priority: string;
    meta?: AgentTaskRecord;
}

export interface AgentRuntimeBridge {
    /** Stable identifier reported back to the queue with each result. */
    readonly name: string;
    /** Dispatch a task and return the record stored on the queue item. */
    dispatch(task: DispatchableTask, timeoutMs?: number): Promise<AgentTaskRecord>;
}

export const DEFAULT_DISPATCH_TIMEOUT_MS = 10_000;

export function getMotorPoolBaseUrl(): string {
    return process.env.MOTOR_POOL_URL || 'http://localhost:3000';
}

/**
 * Local, dependency-free execution used when the runtime is unreachable so the
 * queue always settles instead of hanging on a missing dev server.
 */
export async function executeTaskSimulated(task: DispatchableTask): Promise<AgentTaskRecord> {
    await new Promise((resolve) => setTimeout(resolve, 5));

    if (task.type === 'fail') {
        throw new Error('Task execution failed by request');
    }

    return {
        acknowledgement: 'Task executed (simulated)',
        type: task.type,
        priority: task.priority,
        payload: task.payload,
        meta: task.meta ?? null,
        executedAt: new Date().toISOString(),
    };
}

/**
 * v0 bridge to agent-board's local model runtime.
 *
 * Creates a session for the task, delivers the task body as the session's first
 * message, and returns the session id so the queue can correlate the run.
 * Any transport failure degrades to simulated execution rather than failing the
 * task, matching the queue's existing contract.
 */
export const motorPoolBridge: AgentRuntimeBridge = {
    name: 'motor-pool',

    async dispatch(task: DispatchableTask, timeoutMs = DEFAULT_DISPATCH_TIMEOUT_MS): Promise<AgentTaskRecord> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs);
        const baseUrl = getMotorPoolBaseUrl();

        try {
            const sessionRes = await fetch(`${baseUrl}/api/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `overseer-${task.id}`,
                    type: task.type,
                    payload: task.payload,
                    priority: task.priority,
                    meta: task.meta ?? {},
                }),
                signal: controller.signal,
            });

            if (!sessionRes.ok) {
                logger.warn(
                    `[Agent Bridge] session creation failed (${sessionRes.status}); falling back to simulated execution`
                );
                return executeTaskSimulated(task);
            }

            const session = await sessionRes.json();
            const sessionId = session?.session?.id || session?.id || 'unknown';

            if (sessionId === 'unknown') {
                logger.warn('[Agent Bridge] runtime returned an invalid session id; falling back to simulated execution');
                return executeTaskSimulated(task);
            }

            // Session creation alone does not deliver work — the runtime picks
            // the task up from the session's first message.
            const messageRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: JSON.stringify({ type: task.type, payload: task.payload }),
                }),
                signal: controller.signal,
            });

            if (!messageRes.ok) {
                logger.warn(
                    `[Agent Bridge] message delivery failed (${messageRes.status}); falling back to simulated execution`
                );
                return executeTaskSimulated(task);
            }

            return {
                acknowledgement: 'Task dispatched to motor-pool',
                runtime: motorPoolBridge.name,
                motorPoolSessionId: sessionId,
                type: task.type,
                priority: task.priority,
                payload: task.payload,
                meta: task.meta ?? null,
                executedAt: new Date().toISOString(),
            };
        } catch (error) {
            logger.warn('[Agent Bridge] runtime unavailable, using simulated execution:', error);
            return executeTaskSimulated(task);
        } finally {
            clearTimeout(timeoutId);
        }
    },
};
