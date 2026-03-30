/**
 * POST   /api/subscribe — subscribe an email address
 * DELETE /api/subscribe — unsubscribe an email address
 *
 * Request body (JSON): { email: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { subscribe, unsubscribe } from '@/lib/services/subscriber.service';
import { subscribeSchema } from '@/lib/validators';
import type { ApiResponse, Subscriber } from '@/types';

// ---------------------------------------------------------------------------
// Shared helper: parse and validate the JSON body
// ---------------------------------------------------------------------------
async function parseEmail(
  req: NextRequest
): Promise<{ email: string } | NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const res: ApiResponse<null> = { data: null, error: 'Invalid JSON body', status: 400 };
    return NextResponse.json(res, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    const res: ApiResponse<null> = {
      data: null,
      error: parsed.error.errors[0]?.message ?? 'Validation error',
      status: 400,
    };
    return NextResponse.json(res, { status: 400 });
  }

  return { email: parsed.data.email };
}

// ---------------------------------------------------------------------------
// POST /api/subscribe
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  const result = await parseEmail(req);
  if (result instanceof NextResponse) return result;

  try {
    const subscriber = await subscribe(result.email);
    const body: ApiResponse<Subscriber> = { data: subscriber, error: null, status: 201 };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const body: ApiResponse<null> = { data: null, error: message, status: 500 };
    return NextResponse.json(body, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/subscribe
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const result = await parseEmail(req);
  if (result instanceof NextResponse) return result;

  try {
    const removed = await unsubscribe(result.email);

    if (!removed) {
      const body: ApiResponse<null> = { data: null, error: 'Email not found', status: 404 };
      return NextResponse.json(body, { status: 404 });
    }

    const body: ApiResponse<{ email: string }> = {
      data: { email: result.email },
      error: null,
      status: 200,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const body: ApiResponse<null> = { data: null, error: message, status: 500 };
    return NextResponse.json(body, { status: 500 });
  }
}
