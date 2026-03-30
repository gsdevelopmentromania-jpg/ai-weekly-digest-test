import { describe, it, expect } from 'vitest';
import { subscribeSchema, paginationSchema } from '@/lib/validators';

// ---------------------------------------------------------------------------
// subscribeSchema
// ---------------------------------------------------------------------------

describe('subscribeSchema', () => {
  it('accepts a valid email address', () => {
    const result = subscribeSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('user@example.com');
  });

  it('rejects a missing email field', () => {
    const result = subscribeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a non-email string', () => {
    const result = subscribeSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty email string', () => {
    const result = subscribeSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null email', () => {
    const result = subscribeSchema.safeParse({ email: null });
    expect(result.success).toBe(false);
  });

  it('accepts email with subdomain', () => {
    const result = subscribeSchema.safeParse({ email: 'user@mail.example.co.uk' });
    expect(result.success).toBe(true);
  });

  it('accepts email with plus addressing', () => {
    const result = subscribeSchema.safeParse({ email: 'user+tag@example.com' });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// paginationSchema
// ---------------------------------------------------------------------------

describe('paginationSchema', () => {
  it('parses valid page and perPage strings', () => {
    const result = paginationSchema.safeParse({ page: '2', perPage: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.perPage).toBe(25);
    }
  });

  it('defaults page to 1 when omitted', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(1);
  });

  it('defaults perPage to 10 when omitted', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.perPage).toBe(10);
  });

  it('rejects page < 1', () => {
    const result = paginationSchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects perPage > 100', () => {
    const result = paginationSchema.safeParse({ perPage: '101' });
    expect(result.success).toBe(false);
  });

  it('accepts perPage of exactly 100', () => {
    const result = paginationSchema.safeParse({ perPage: '100' });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric strings', () => {
    const result = paginationSchema.safeParse({ page: 'abc' });
    expect(result.success).toBe(false);
  });
});
