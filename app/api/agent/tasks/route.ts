import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

type TaskPriority = 'low' | 'normal' | 'high';
type TaskStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

type TaskRecord = Record<string, unknown>;

interface TaskSubmission {
  type: string;
  payload: TaskRecord;
  priority: TaskPriority;
  meta?: TaskRecord;
}

interface ValidationResult {
  success: boolean;
  data?: TaskSubmission;
  errors?: string[];
}

interface TaskQueueItem {
  id: string;
  type: string;
  payload: TaskRecord;
  priority: TaskPriority;
  meta?: TaskRecord;
  status: TaskStatus;
  result?: TaskRecord;
  error?: string;
  createdAt: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  submittedBy?: {
    name?: string | null;
    email?: string | null;
  };
}

const VALID_PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'high'];
const taskStore = new Map<string, TaskQueueItem>();
const pendingQueue: string[] = [];
let runnerActive = false;

const isRecord = (value: unknown): value is TaskRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseTask = (value: unknown): ValidationResult => {
  if (!isRecord(value)) {
    return { success: false, errors: ['Request body must be a JSON object'] };
  }

  const errors: string[] = [];
  const { type, payload, priority, meta } = value;

  if (typeof type !== 'string') {
    errors.push('type must be a string');
  }

  if (!isRecord(payload)) {
    errors.push('payload must be an object');
  }

  const priorityValue = priority === undefined ? 'normal' : priority;
  if (typeof priorityValue !== 'string' || !VALID_PRIORITIES.includes(priorityValue as TaskPriority)) {
    errors.push('priority must be one of: low, normal, high');
  }
  const normalizedPriority = (
    VALID_PRIORITIES.includes(priorityValue as TaskPriority) ? priorityValue : 'normal'
  ) as TaskPriority;

  if (meta !== undefined && !isRecord(meta)) {
    errors.push('meta must be an object when provided');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      type: type as string,
      payload: payload as TaskRecord,
      priority: normalizedPriority,
      ...(meta !== undefined ? { meta: meta as TaskRecord } : {}),
    },
  };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Task execution failed';

const executeTask = async (task: TaskQueueItem): Promise<TaskRecord> => {
  // Simulated execution pipeline. Replace with real dispatch backends as they land.
  await delay(5);

  if (task.type === 'fail') {
    throw new Error('Task execution failed by request');
  }

  return {
    acknowledgement: 'Task executed',
    type: task.type,
    priority: task.priority,
    payload: task.payload,
    meta: task.meta ?? null,
    executedAt: new Date().toISOString(),
  };
};

const processQueue = async () => {
  if (runnerActive) {
    return;
  }

  runnerActive = true;

  try {
    while (pendingQueue.length > 0) {
      const taskId = pendingQueue.shift();
      if (!taskId) {
        continue;
      }

      const task = taskStore.get(taskId);
      if (!task || task.status !== 'queued') {
        continue;
      }

      const startedAt = new Date().toISOString();
      task.status = 'in_progress';
      task.startedAt = startedAt;
      task.updatedAt = startedAt;

      try {
        const result = await executeTask(task);
        const completedAt = new Date().toISOString();
        task.status = 'completed';
        task.result = result;
        task.completedAt = completedAt;
        task.updatedAt = completedAt;
      } catch (error) {
        const completedAt = new Date().toISOString();
        task.status = 'failed';
        task.error = sanitizeError(error);
        task.completedAt = completedAt;
        task.updatedAt = completedAt;
      }
    }
  } finally {
    runnerActive = false;
  }
};

const enqueueTask = (task: TaskQueueItem) => {
  taskStore.set(task.id, task);
  pendingQueue.push(task.id);
  void processQueue();
};

const toPublicTask = (task: TaskQueueItem) => ({
  id: task.id,
  type: task.type,
  payload: task.payload,
  priority: task.priority,
  meta: task.meta,
  status: task.status,
  result: task.result,
  error: task.error,
  createdAt: task.createdAt,
  queuedAt: task.queuedAt,
  startedAt: task.startedAt,
  completedAt: task.completedAt,
  updatedAt: task.updatedAt,
  submittedBy: task.submittedBy,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const result = parseTask(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid task format', details: result.errors },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const task: TaskQueueItem = {
      id: randomUUID(),
      ...result.data,
      status: 'queued',
      createdAt: now,
      queuedAt: now,
      updatedAt: now,
      submittedBy: {
        name: session.user.name,
        email: session.user.email,
      },
    };

    enqueueTask(task);

    return NextResponse.json(
      { task: toPublicTask(task), status: 'accepted', queuedAt: task.queuedAt },
      { status: 202 }
    );
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskId = req.nextUrl.searchParams.get('id');
  if (taskId) {
    const task = taskStore.get(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: toPublicTask(task) }, { status: 200 });
  }

  const tasks = Array.from(taskStore.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toPublicTask);

  const summary = tasks.reduce(
    (acc, task) => {
      acc.total += 1;
      acc.byStatus[task.status] = (acc.byStatus[task.status] || 0) + 1;
      return acc;
    },
    { total: 0, byStatus: {} as Record<string, number> }
  );

  return NextResponse.json({ success: true, tasks, summary }, { status: 200 });
}
