// ---------------------------------------------------------------------------
// Zod validation schemas for AI Weekly Digest
// lib/schemas.ts
//
// Every schema mirrors its counterpart TypeScript interface in types/index.ts.
// Use these schemas to validate API request bodies, query params, and form data.
//
// NOTE: lib/validators.ts holds simple API-request schemas used directly by
//       route handlers. This file provides full entity-level schemas.
// ---------------------------------------------------------------------------

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const isoDateString = z
  .string()
  .datetime({ message: 'Must be a valid ISO 8601 date-time string' });

const uuid = z.string().uuid({ message: 'Must be a valid UUID' });

const urlString = z.string().url({ message: 'Must be a valid URL' });

const slugPattern = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens');

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const digestCategorySchema = z.enum([
  'research',
  'product',
  'industry',
  'tools',
  'policy',
  'other',
]);

export const blogPostStatusSchema = z.enum(['draft', 'published', 'archived']);

export const emailTemplateTypeSchema = z.enum([
  'welcome',
  'digest',
  'announcement',
  'reengagement',
]);

export const socialPlatformSchema = z.enum([
  'twitter',
  'linkedin',
  'instagram',
  'threads',
]);

export const socialPostStatusSchema = z.enum([
  'draft',
  'scheduled',
  'published',
  'failed',
]);

// ---------------------------------------------------------------------------
// Author
// ---------------------------------------------------------------------------

export const authorSocialLinksSchema = z.object({
  twitter: urlString.optional(),
  linkedin: urlString.optional(),
  github: urlString.optional(),
  website: urlString.optional(),
});

export const authorSchema = z.object({
  id: uuid,
  name: z.string().min(1, 'Name is required').max(120),
  bio: z.string().max(500),
  avatarUrl: urlString.nullable(),
  socialLinks: authorSocialLinksSchema,
  createdAt: isoDateString,
});

export const createAuthorSchema = authorSchema.omit({ id: true, createdAt: true });

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;

// ---------------------------------------------------------------------------
// Digest Item
// ---------------------------------------------------------------------------

export const digestItemSchema = z.object({
  id: uuid,
  issueId: uuid,
  title: z.string().min(1, 'Title is required').max(300),
  url: urlString,
  source: z.string().min(1, 'Source is required').max(120),
  summary: z.string().min(1, 'Summary is required').max(1000),
  category: digestCategorySchema,
  publishedAt: isoDateString,
  position: z.number().int().nonnegative(),
  createdAt: isoDateString,
});

export const createDigestItemSchema = digestItemSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateDigestItemInput = z.infer<typeof createDigestItemSchema>;

// ---------------------------------------------------------------------------
// Digest Issue
// ---------------------------------------------------------------------------

export const digestIssueSchema = z.object({
  id: uuid,
  slug: slugPattern.max(160),
  title: z.string().min(1, 'Title is required').max(300),
  weekLabel: z.string().min(1, 'Week label is required').max(60),
  publishedAt: isoDateString,
  summary: z.string().min(1, 'Summary is required').max(2000),
  items: z.array(digestItemSchema),
  tags: z.array(z.string().min(1).max(60)),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const createDigestIssueSchema = digestIssueSchema.omit({
  id: true,
  items: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateDigestIssueInput = z.infer<typeof createDigestIssueSchema>;

// ---------------------------------------------------------------------------
// Blog Post
// ---------------------------------------------------------------------------

export const blogPostSchema = z.object({
  id: uuid,
  slug: slugPattern,
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  authorId: uuid,
  status: blogPostStatusSchema,
  tags: z.array(z.string().min(1).max(60)),
  coverImageUrl: urlString.nullable(),
  publishedAt: isoDateString.nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const createBlogPostSchema = blogPostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

// ---------------------------------------------------------------------------
// Subscriber
// ---------------------------------------------------------------------------

export const subscriberSchema = z.object({
  id: uuid,
  email: z.string().email('Must be a valid email address').max(254),
  subscribedAt: isoDateString,
  confirmed: z.boolean(),
  unsubscribedAt: isoDateString.nullable(),
  createdAt: isoDateString,
});

export const createSubscriberSchema = z.object({
  email: z.string().email('Must be a valid email address').max(254),
});

export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;

// ---------------------------------------------------------------------------
// Email Template
// ---------------------------------------------------------------------------

export const emailTemplateSchema = z.object({
  id: uuid,
  name: z.string().min(1, 'Name is required').max(120),
  subject: z.string().min(1, 'Subject is required').max(300),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().min(1, 'Text content is required'),
  templateType: emailTemplateTypeSchema,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const createEmailTemplateSchema = emailTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;

// ---------------------------------------------------------------------------
// Social Post
// ---------------------------------------------------------------------------

export const socialPostSchema = z.object({
  id: uuid,
  platform: socialPlatformSchema,
  content: z.string().min(1, 'Content is required').max(2200),
  mediaUrls: z.array(urlString),
  status: socialPostStatusSchema,
  scheduledAt: isoDateString.nullable(),
  publishedAt: isoDateString.nullable(),
  relatedIssueId: uuid.nullable(),
  relatedBlogPostId: uuid.nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const createSocialPostSchema = socialPostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSocialPostSchema = createSocialPostSchema.partial();

export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;
export type UpdateSocialPostInput = z.infer<typeof updateSocialPostSchema>;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParamsInput = z.infer<typeof paginationParamsSchema>;
