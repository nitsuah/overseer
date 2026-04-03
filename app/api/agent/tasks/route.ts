import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type TaskPriority = 'low' | 'normal' | 'high';

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

const VALID_PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'high'];

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

    // TODO: Implement queue logic
    return NextResponse.json(
      { task: result.data, status: 'accepted', queuedAt: new Date().toISOString() },
      { status: 202 }
    );
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 });
  }
}
