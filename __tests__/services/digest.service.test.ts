import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @/lib/supabase BEFORE the service is imported so the module never
// evaluates the real Supabase client (which requires live env vars).
// ---------------------------------------------------------------------------
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { getDigests, getDigestBySlug } from '@/lib/services/digest.service';
import type { DigestIssue } from '@/types';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockItem = {
  id: 'item-id-1',
  title: 'GPT-5 Released',
  url: 'https://example.com/gpt5',
  source: 'OpenAI Blog',
  summary: 'OpenAI releases its most capable model.',
  category: 'research',
  published_at: '2026-03-30T00:00:00.000Z',
  position: 0,
  created_at: '2026-03-30T00:00:00.000Z',
};

const mockIssueRow = {
  id: 'issue-id-1',
  slug: 'week-13-2026',
  title: 'AI Weekly Digest — Week 13, 2026',
  week_label: 'Week 13, 2026',
  published_at: '2026-03-30T00:00:00.000Z',
  summary: 'The biggest AI stories this week.',
  tags: ['llm', 'research'],
  items: [mockItem],
  created_at: '2026-03-30T00:00:00.000Z',
  updated_at: '2026-03-30T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Helpers: reset and chain mocks
// ---------------------------------------------------------------------------

function setupPaginatedQuery(data: unknown[], count: number, error: unknown = null): void {
  mockRange.mockResolvedValueOnce({ data, error, count });
  mockOrder.mockReturnValueOnce({ range: mockRange });
  mockSelect.mockReturnValueOnce({ order: mockOrder });
  mockFrom.mockReturnValueOnce({ select: mockSelect });
}

function setupSlugQuery(data: unknown, error: unknown = null): void {
  mockSingle.mockResolvedValueOnce({ data, error });
  mockEq.mockReturnValueOnce({ single: mockSingle });
  mockSelect.mockReturnValueOnce({ eq: mockEq });
  mockFrom.mockReturnValueOnce({ select: mockSelect });
}

// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getDigests()
// ---------------------------------------------------------------------------

describe('getDigests()', () => {
  it('returns a paginated result with mapped issues', async () => {
    setupPaginatedQuery([mockIssueRow], 1);

    const result = await getDigests({ page: 1, perPage: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(10);
    expect(result.totalPages).toBe(1);

    const issue = result.items[0] as DigestIssue;
    expect(issue.slug).toBe('week-13-2026');
    expect(issue.weekLabel).toBe('Week 13, 2026');
    expect(issue.publishedAt).toBe('2026-03-30T00:00:00.000Z');
    expect(issue.items).toHaveLength(1);
    expect(issue.items[0]?.title).toBe('GPT-5 Released');
    expect(issue.items[0]?.issueId).toBe('issue-id-1');
  });

  it('calculates totalPages correctly across multiple pages', async () => {
    setupPaginatedQuery([mockIssueRow], 25);
    const result = await getDigests({ page: 1, perPage: 10 });
    expect(result.totalPages).toBe(3);
  });

  it('returns empty items array when no data', async () => {
    setupPaginatedQuery([], 0);
    const result = await getDigests({ page: 1, perPage: 10 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('uses correct range for page 2 with perPage 10', async () => {
    setupPaginatedQuery([], 0);
    await getDigests({ page: 2, perPage: 10 });
    expect(mockRange).toHaveBeenCalledWith(10, 19);
  });

  it('uses correct range for page 1 with perPage 5', async () => {
    setupPaginatedQuery([], 0);
    await getDigests({ page: 1, perPage: 5 });
    expect(mockRange).toHaveBeenCalledWith(0, 4);
  });

  it('throws when Supabase returns an error', async () => {
    setupPaginatedQuery([], 0, { message: 'DB connection failed' });
    await expect(getDigests({ page: 1, perPage: 10 })).rejects.toThrow('DB connection failed');
  });

  it('handles count being null (treats as 0)', async () => {
    mockRange.mockResolvedValueOnce({ data: [], error: null, count: null });
    mockOrder.mockReturnValueOnce({ range: mockRange });
    mockSelect.mockReturnValueOnce({ order: mockOrder });
    mockFrom.mockReturnValueOnce({ select: mockSelect });

    const result = await getDigests({ page: 1, perPage: 10 });
    expect(result.total).toBe(0);
  });

  it('maps items with empty tags array when tags is missing', async () => {
    const rowNoTags = { ...mockIssueRow, tags: undefined };
    setupPaginatedQuery([rowNoTags], 1);
    const result = await getDigests({ page: 1, perPage: 10 });
    expect(result.items[0]?.tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getDigestBySlug()
// ---------------------------------------------------------------------------

describe('getDigestBySlug()', () => {
  it('returns a mapped DigestIssue when found', async () => {
    setupSlugQuery(mockIssueRow);

    const issue = await getDigestBySlug('week-13-2026');

    expect(issue).not.toBeNull();
    expect(issue?.slug).toBe('week-13-2026');
    expect(issue?.title).toBe('AI Weekly Digest — Week 13, 2026');
    expect(issue?.items).toHaveLength(1);
  });

  it('returns null when row is not found (PGRST116)', async () => {
    setupSlugQuery(null, { code: 'PGRST116', message: 'Row not found' });

    const issue = await getDigestBySlug('does-not-exist');
    expect(issue).toBeNull();
  });

  it('throws for non-PGRST116 errors', async () => {
    setupSlugQuery(null, { code: '500', message: 'Internal server error' });
    await expect(getDigestBySlug('some-slug')).rejects.toThrow('Internal server error');
  });

  it('calls from() with "digest_issues"', async () => {
    setupSlugQuery(mockIssueRow);
    await getDigestBySlug('week-13-2026');
    expect(mockFrom).toHaveBeenCalledWith('digest_issues');
  });

  it('filters by the provided slug', async () => {
    setupSlugQuery(mockIssueRow);
    await getDigestBySlug('week-13-2026');
    expect(mockEq).toHaveBeenCalledWith('slug', 'week-13-2026');
  });

  it('maps position defaulting to 0 when missing', async () => {
    const itemNoPosition = { ...mockItem, position: undefined };
    const rowNoPosition = { ...mockIssueRow, items: [itemNoPosition] };
    setupSlugQuery(rowNoPosition);

    const issue = await getDigestBySlug('week-13-2026');
    expect(issue?.items[0]?.position).toBe(0);
  });
});
