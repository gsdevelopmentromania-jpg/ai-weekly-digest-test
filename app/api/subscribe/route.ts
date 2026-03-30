/**
 * DELETE /api/subscribe
 * Removes an email address from the newsletter subscriber list.
 *
 * Request body (JSON): { email: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/services/subscriber.service';
import { subscribeSchema } from '@/lib/validators';
import type { ApiResponse } from '@/types';

export async function DELETE(req: NextRequest): Promise<NextResponse> {
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
    const removed = await unsubscribe(parsed.data.email);

    if (!removed) {
      const res: ApiResponse<null> = {
        data: null,
        error: 'Email not found',
        status: 404,
      };
      return NextResponse.json(res, { status: 404 });
    }

    const res: ApiResponse<{ email: string }> = {
      data: { email: parsed.data.email },
      error: null,
      status: 200,
    };
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const res: ApiResponse<null> = { data: null, error: message, status: 500 };
    return NextResponse.json(res, { status: 500 });
  }
}
