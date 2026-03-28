import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for a task submission
const TaskSchema = z.object({
  type: z.string(),
  payload: z.record(z.any()),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  meta: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const result = TaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid task format', details: result.error.errors }, { status: 400 });
    }

    // TODO: Implement authentication and queue logic
    // For now, just echo the validated task
    return NextResponse.json({ task: result.data, status: 'accepted', queuedAt: new Date().toISOString() }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: 'Malformed request', details: String(err) }, { status: 400 });
  }
}
