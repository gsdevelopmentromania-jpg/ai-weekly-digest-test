/**
 * GET /api/digests
 * Returns a paginated list of published digest issues.
 *
 * Query params:
 *   page    — page number (default: 1)
 *   perPage — items per page (default: 10, max: 100)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDigests } from '@/lib/services/digest.service';
import { paginationSchema } from '@/lib/validators';
import type { ApiResponse, PaginatedResult } from '@/types';
import type { DigestIssue } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  });

  if (!parsed.success) {
    const body: ApiResponse<null> = {
      data: null,
      error: parsed.error.errors[0]?.message ?? 'Invalid query parameters',
      status: 400,
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const result = await getDigests(parsed.data);
    const body: ApiResponse<PaginatedResult<DigestIssue>> = {
      data: result,
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
