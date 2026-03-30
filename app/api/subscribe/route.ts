/**
 * POST /api/subscribe
 * Subscribes an email address to the AI Weekly Digest newsletter.
 *
 * Request body (JSON): { email: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { subscribe } from '@/lib/services/subscriber.service';
import { subscribeSchema } from '@/lib/validators';
import type { ApiResponse, Subscriber } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  try {
    const subscriber = await subscribe(parsed.data.email);
    const res: ApiResponse<Subscriber> = { data: subscriber, error: null, status: 201 };
    return NextResponse.json(res, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const res: ApiResponse<null> = { data: null, error: message, status: 500 };
    return NextResponse.json(res, { status: 500 });
  }
}
