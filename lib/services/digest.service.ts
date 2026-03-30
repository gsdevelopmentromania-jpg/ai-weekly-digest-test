/**
 * Digest service — all business logic for fetching digest issues.
 * Used by API route handlers; never imported directly in Client Components.
 */
import { supabase } from '@/lib/supabase';
import type { DigestIssue, DigestItem, PaginatedResult, PaginationParams } from '@/types';

/**
 * Fetch a paginated list of published digest issues, ordered by publishedAt desc.
 */
export async function getDigests(
  params: PaginationParams
): Promise<PaginatedResult<DigestIssue>> {
  const { page, perPage } = params;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('digest_issues')
    .select('*, items:digest_items(*)', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const issues = (data ?? []).map(mapRowToDigestIssue);
  const total = count ?? 0;

  return {
    items: issues,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Fetch a single digest issue by its URL slug.
 * Returns null if no matching issue is found.
 */
export async function getDigestBySlug(slug: string): Promise<DigestIssue | null> {
  const { data, error } = await supabase
    .from('digest_issues')
    .select('*, items:digest_items(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // row not found
    throw new Error(error.message);
  }

  return mapRowToDigestIssue(data);
}

// ---------------------------------------------------------------------------
// Mapping helpers (DB snake_case → TS camelCase)
// ---------------------------------------------------------------------------

function mapRowToDigestIssue(row: Record<string, unknown>): DigestIssue {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    weekLabel: row.week_label as string,
    publishedAt: row.published_at as string,
    summary: row.summary as string,
    tags: (row.tags as string[]) ?? [],
    items: ((row.items as Record<string, unknown>[]) ?? []).map((item) =>
      mapRowToDigestItem(item, row.id as string)
    ),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapRowToDigestItem(row: Record<string, unknown>, issueId: string): DigestItem {
  return {
    id: row.id as string,
    issueId,
    title: row.title as string,
    url: row.url as string,
    source: row.source as string,
    summary: row.summary as string,
    category: row.category as DigestItem['category'],
    publishedAt: row.published_at as string,
    position: (row.position as number) ?? 0,
    createdAt: row.created_at as string,
  };
}
