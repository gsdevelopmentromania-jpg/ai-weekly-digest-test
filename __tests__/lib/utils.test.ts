import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateShort, slugify, truncate, getWeekLabel } from '@/lib/utils';

// ---------------------------------------------------------------------------
// cn()
// ---------------------------------------------------------------------------

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts — last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles conditional classes (falsy values are ignored)', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'active')).toBe('base active');
  });

  it('handles object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('returns empty string when no inputs', () => {
    expect(cn()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatDate()
// ---------------------------------------------------------------------------

describe('formatDate()', () => {
  it('formats an ISO string as a long date', () => {
    expect(formatDate('2026-03-30T00:00:00.000Z')).toMatch(/March 30, 2026/);
  });

  it('formats a Date object', () => {
    const d = new Date('2026-01-01T12:00:00.000Z');
    const result = formatDate(d);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/January/);
    expect(result).toMatch(/1/);
  });
});

// ---------------------------------------------------------------------------
// formatDateShort()
// ---------------------------------------------------------------------------

describe('formatDateShort()', () => {
  it('formats an ISO string as a short date', () => {
    expect(formatDateShort('2026-03-30T00:00:00.000Z')).toMatch(/Mar/);
    expect(formatDateShort('2026-03-30T00:00:00.000Z')).toMatch(/2026/);
  });

  it('uses abbreviated month names', () => {
    expect(formatDateShort('2026-12-25T00:00:00.000Z')).toMatch(/Dec/);
  });
});

// ---------------------------------------------------------------------------
// slugify()
// ---------------------------------------------------------------------------

describe('slugify()', () => {
  it('lowercases input', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('AI Weekly Digest')).toBe('ai-weekly-digest');
  });

  it('removes special characters', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('foo   bar---baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('handles an already-slugified string', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numeric strings', () => {
    expect(slugify('Issue 42')).toBe('issue-42');
  });
});

// ---------------------------------------------------------------------------
// truncate()
// ---------------------------------------------------------------------------

describe('truncate()', () => {
  it('returns the original string when shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns the original string when equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis when too long', () => {
    const result = truncate('Hello World', 5);
    expect(result).toMatch(/…$/);
    expect(result.length).toBeLessThanOrEqual(6); // 5 chars + ellipsis
  });

  it('handles an empty string', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('handles maxLength of 0', () => {
    const result = truncate('hello', 0);
    expect(result).toMatch(/…$/);
  });
});

// ---------------------------------------------------------------------------
// getWeekLabel()
// ---------------------------------------------------------------------------

describe('getWeekLabel()', () => {
  it('returns a string matching "Week N, YYYY" format', () => {
    const label = getWeekLabel(new Date('2026-01-05T00:00:00.000Z'));
    expect(label).toMatch(/^Week \d+, \d{4}$/);
  });

  it('returns Week 1 for the first ISO week of 2026', () => {
    // 2026-01-01 falls in ISO week 1
    const label = getWeekLabel(new Date('2026-01-01T00:00:00.000Z'));
    expect(label).toMatch(/Week 1, 2026/);
  });

  it('returns a label for the current date when called with no argument', () => {
    const label = getWeekLabel();
    expect(label).toMatch(/^Week \d+, \d{4}$/);
  });

  it('correctly identifies the week number for a mid-year date', () => {
    // 2026-07-06 is in ISO week 28
    const label = getWeekLabel(new Date('2026-07-06T00:00:00.000Z'));
    expect(label).toMatch(/Week 28, 2026/);
  });
});
