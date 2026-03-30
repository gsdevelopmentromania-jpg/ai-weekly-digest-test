import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @/lib/supabase before any service import
// ---------------------------------------------------------------------------
const mockMaybeSingle = vi.fn();
const mockInsertSelect = vi.fn();
const mockInsertSingle = vi.fn();
const mockInsert = vi.fn();
const mockDeleteEq = vi.fn();
const mockDelete = vi.fn();
const mockSelectEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { subscribe, unsubscribe } from '@/lib/services/subscriber.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const existingRow = {
  id: 'sub-id-1',
  email: 'user@example.com',
  subscribed_at: '2026-01-01T00:00:00.000Z',
  confirmed: true,
  unsubscribed_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
};

const newRow = {
  id: 'sub-id-2',
  email: 'newuser@example.com',
  subscribed_at: '2026-03-30T00:00:00.000Z',
  confirmed: false,
  unsubscribed_at: null,
  created_at: '2026-03-30T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupExistingCheck(existing: unknown): void {
  mockMaybeSingle.mockResolvedValueOnce({ data: existing });
  mockSelectEq.mockReturnValueOnce({ maybeSingle: mockMaybeSingle });
  mockSelect.mockReturnValueOnce({ eq: mockSelectEq });
  mockFrom.mockReturnValueOnce({ select: mockSelect });
}

function setupInsert(data: unknown, error: unknown = null): void {
  mockInsertSingle.mockResolvedValueOnce({ data, error });
  mockInsertSelect.mockReturnValueOnce({ single: mockInsertSingle });
  mockInsert.mockReturnValueOnce({ select: mockInsertSelect });
  mockFrom.mockReturnValueOnce({ insert: mockInsert });
}

function setupDelete(count: number, error: unknown = null): void {
  mockDeleteEq.mockResolvedValueOnce({ error, count });
  mockDelete.mockReturnValueOnce({ eq: mockDeleteEq });
  mockFrom.mockReturnValueOnce({ delete: mockDelete });
}

// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// subscribe()
// ---------------------------------------------------------------------------

describe('subscribe()', () => {
  it('returns the existing subscriber when email is already registered', async () => {
    setupExistingCheck(existingRow);

    const result = await subscribe('user@example.com');

    expect(result.id).toBe('sub-id-1');
    expect(result.email).toBe('user@example.com');
    expect(result.confirmed).toBe(true);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('inserts and returns a new subscriber when email is not registered', async () => {
    setupExistingCheck(null);
    setupInsert(newRow);

    const result = await subscribe('newuser@example.com');

    expect(result.id).toBe('sub-id-2');
    expect(result.email).toBe('newuser@example.com');
    expect(result.confirmed).toBe(false);
  });

  it('queries subscribers table for existing email', async () => {
    setupExistingCheck(existingRow);
    await subscribe('user@example.com');
    expect(mockFrom).toHaveBeenCalledWith('subscribers');
  });

  it('throws when insert fails', async () => {
    setupExistingCheck(null);
    setupInsert(null, { message: 'unique constraint violation' });

    await expect(subscribe('dup@example.com')).rejects.toThrow('unique constraint violation');
  });

  it('maps subscribedAt from subscribed_at column', async () => {
    setupExistingCheck(existingRow);
    const result = await subscribe('user@example.com');
    expect(result.subscribedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

// ---------------------------------------------------------------------------
// unsubscribe()
// ---------------------------------------------------------------------------

describe('unsubscribe()', () => {
  it('returns true when a subscriber is deleted', async () => {
    setupDelete(1);
    const result = await unsubscribe('user@example.com');
    expect(result).toBe(true);
  });

  it('returns false when no subscriber matched the email', async () => {
    setupDelete(0);
    const result = await unsubscribe('nobody@example.com');
    expect(result).toBe(false);
  });

  it('returns false when count is null', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: null, count: null });
    mockDelete.mockReturnValueOnce({ eq: mockDeleteEq });
    mockFrom.mockReturnValueOnce({ delete: mockDelete });

    const result = await unsubscribe('user@example.com');
    expect(result).toBe(false);
  });

  it('throws when Supabase returns an error', async () => {
    setupDelete(0, { message: 'DB timeout' });
    await expect(unsubscribe('user@example.com')).rejects.toThrow('DB timeout');
  });

  it('deletes from subscribers table', async () => {
    setupDelete(1);
    await unsubscribe('user@example.com');
    expect(mockFrom).toHaveBeenCalledWith('subscribers');
  });

  it('filters by the provided email', async () => {
    setupDelete(1);
    await unsubscribe('user@example.com');
    expect(mockDeleteEq).toHaveBeenCalledWith('email', 'user@example.com');
  });
});
