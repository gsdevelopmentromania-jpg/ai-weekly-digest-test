/**
 * GET /api/digests/[slug]
 * Returns a single digest issue identified by its URL slug.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDigestBySlug } from '@/lib/services/digest.service';
import type { ApiResponse, DigestIssue } from '@/types';

interface RouteParams {
  params: { slug: string };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { slug } = params;

  if (!slug || typeof slug !== 'string') {
    const body: ApiResponse<null> = { data: null, error: 'Missing slug', status: 400 };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const issue = await getDigestBySlug(slug);

    if (!issue) {
      const body: ApiResponse<null> = {
        data: null,
        error: 'Digest not found',
        status: 404,
      };
      return NextResponse.json(body, { status: 404 });
    }

    const body: ApiResponse<DigestIssue> = { data: issue, error: null, status: 200 };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const body: ApiResponse<null> = { data: null, error: message, status: 500 };
    return NextResponse.json(body, { status: 500 });
  }
}
