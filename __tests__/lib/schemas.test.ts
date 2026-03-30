import { describe, it, expect } from 'vitest';
import {
  digestCategorySchema,
  digestItemSchema,
  digestIssueSchema,
  createSubscriberSchema,
  paginationParamsSchema,
  authorSchema,
  blogPostStatusSchema,
} from '@/lib/schemas';

// ---------------------------------------------------------------------------
// digestCategorySchema
// ---------------------------------------------------------------------------

describe('digestCategorySchema', () => {
  const valid = ['research', 'product', 'industry', 'tools', 'policy', 'other'] as const;

  valid.forEach((cat) => {
    it(`accepts "${cat}"`, () => {
      expect(digestCategorySchema.safeParse(cat).success).toBe(true);
    });
  });

  it('rejects an unknown category', () => {
    expect(digestCategorySchema.safeParse('unknown').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(digestCategorySchema.safeParse('').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// blogPostStatusSchema
// ---------------------------------------------------------------------------

describe('blogPostStatusSchema', () => {
  it('accepts "draft"', () => expect(blogPostStatusSchema.safeParse('draft').success).toBe(true));
  it('accepts "published"', () => expect(blogPostStatusSchema.safeParse('published').success).toBe(true));
  it('accepts "archived"', () => expect(blogPostStatusSchema.safeParse('archived').success).toBe(true));
  it('rejects "deleted"', () => expect(blogPostStatusSchema.safeParse('deleted').success).toBe(false));
});

// ---------------------------------------------------------------------------
// digestItemSchema
// ---------------------------------------------------------------------------

const validDigestItem = {
  id: '00000000-0000-0000-0000-000000000001',
  issueId: '00000000-0000-0000-0000-000000000002',
  title: 'GPT-5 Released',
  url: 'https://example.com/gpt5',
  source: 'OpenAI Blog',
  summary: 'OpenAI releases its most powerful model yet.',
  category: 'research',
  publishedAt: '2026-03-30T00:00:00.000Z',
  position: 0,
  createdAt: '2026-03-30T00:00:00.000Z',
};

describe('digestItemSchema', () => {
  it('accepts a fully valid item', () => {
    expect(digestItemSchema.safeParse(validDigestItem).success).toBe(true);
  });

  it('rejects missing title', () => {
    const { title: _title, ...rest } = validDigestItem;
    expect(digestItemSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects invalid URL', () => {
    expect(digestItemSchema.safeParse({ ...validDigestItem, url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects invalid category', () => {
    expect(digestItemSchema.safeParse({ ...validDigestItem, category: 'hype' }).success).toBe(false);
  });

  it('rejects non-integer position', () => {
    expect(digestItemSchema.safeParse({ ...validDigestItem, position: 1.5 }).success).toBe(false);
  });

  it('rejects negative position', () => {
    expect(digestItemSchema.safeParse({ ...validDigestItem, position: -1 }).success).toBe(false);
  });

  it('rejects malformed publishedAt (not ISO 8601)', () => {
    expect(
      digestItemSchema.safeParse({ ...validDigestItem, publishedAt: '2026-03-30' }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// digestIssueSchema
// ---------------------------------------------------------------------------

const validDigestIssue = {
  id: '00000000-0000-0000-0000-000000000010',
  slug: 'week-13-2026',
  title: 'AI Weekly Digest — Week 13, 2026',
  weekLabel: 'Week 13, 2026',
  publishedAt: '2026-03-30T00:00:00.000Z',
  summary: 'The biggest AI stories this week.',
  items: [validDigestItem],
  tags: ['llm', 'research'],
  createdAt: '2026-03-30T00:00:00.000Z',
  updatedAt: '2026-03-30T00:00:00.000Z',
};

describe('digestIssueSchema', () => {
  it('accepts a fully valid issue', () => {
    expect(digestIssueSchema.safeParse(validDigestIssue).success).toBe(true);
  });

  it('rejects slug with uppercase letters', () => {
    expect(digestIssueSchema.safeParse({ ...validDigestIssue, slug: 'Week-13' }).success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    expect(digestIssueSchema.safeParse({ ...validDigestIssue, slug: 'week 13' }).success).toBe(false);
  });

  it('accepts empty items array', () => {
    expect(digestIssueSchema.safeParse({ ...validDigestIssue, items: [] }).success).toBe(true);
  });

  it('accepts empty tags array', () => {
    expect(digestIssueSchema.safeParse({ ...validDigestIssue, tags: [] }).success).toBe(true);
  });

  it('rejects missing slug', () => {
    const { slug: _slug, ...rest } = validDigestIssue;
    expect(digestIssueSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createSubscriberSchema
// ---------------------------------------------------------------------------

describe('createSubscriberSchema', () => {
  it('accepts a valid email', () => {
    const result = createSubscriberSchema.safeParse({ email: 'hello@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(createSubscriberSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('rejects email over 254 characters', () => {
    const long = 'a'.repeat(243) + '@example.com';
    expect(createSubscriberSchema.safeParse({ email: long }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// paginationParamsSchema
// ---------------------------------------------------------------------------

describe('paginationParamsSchema', () => {
  it('coerces string numbers', () => {
    const result = paginationParamsSchema.safeParse({ page: '3', perPage: '15' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(15);
    }
  });

  it('defaults page to 1', () => {
    const result = paginationParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(1);
  });

  it('defaults perPage to 20', () => {
    const result = paginationParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.perPage).toBe(20);
  });

  it('rejects perPage > 100', () => {
    expect(paginationParamsSchema.safeParse({ perPage: 101 }).success).toBe(false);
  });

  it('rejects page < 1', () => {
    expect(paginationParamsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// authorSchema
// ---------------------------------------------------------------------------

describe('authorSchema', () => {
  const validAuthor = {
    id: '00000000-0000-0000-0000-000000000099',
    name: 'Jane Doe',
    bio: 'AI researcher and writer.',
    avatarUrl: null,
    socialLinks: {},
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('accepts a valid author with no social links', () => {
    expect(authorSchema.safeParse(validAuthor).success).toBe(true);
  });

  it('accepts a valid author with social links', () => {
    const author = {
      ...validAuthor,
      socialLinks: {
        twitter: 'https://twitter.com/janedoe',
        github: 'https://github.com/janedoe',
      },
    };
    expect(authorSchema.safeParse(author).success).toBe(true);
  });

  it('rejects social link that is not a URL', () => {
    const author = { ...validAuthor, socialLinks: { twitter: '@janedoe' } };
    expect(authorSchema.safeParse(author).success).toBe(false);
  });

  it('rejects empty name', () => {
    expect(authorSchema.safeParse({ ...validAuthor, name: '' }).success).toBe(false);
  });

  it('accepts null avatarUrl', () => {
    expect(authorSchema.safeParse({ ...validAuthor, avatarUrl: null }).success).toBe(true);
  });

  it('accepts a valid URL for avatarUrl', () => {
    expect(
      authorSchema.safeParse({ ...validAuthor, avatarUrl: 'https://cdn.example.com/avatar.png' }).success
    ).toBe(true);
  });
});
