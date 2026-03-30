// ---------------------------------------------------------------------------
// Core domain types for AI Weekly Digest
// ---------------------------------------------------------------------------

export type ISODateString = string;

// ---------------------------------------------------------------------------
// Enums / union types
// ---------------------------------------------------------------------------

export type DigestCategory =
  | 'research'
  | 'product'
  | 'industry'
  | 'tools'
  | 'policy'
  | 'other';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type EmailTemplateType = 'welcome' | 'digest' | 'announcement' | 'reengagement';

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'threads';

export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

// ---------------------------------------------------------------------------
// Author
// ---------------------------------------------------------------------------

export interface AuthorSocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: AuthorSocialLinks;
  createdAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

/** An individual article / news item inside a digest */
export interface DigestItem {
  id: string;
  issueId: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  category: DigestCategory;
  publishedAt: ISODateString;
  /** Display order within the issue */
  position: number;
  createdAt: ISODateString;
}

/** A single digest issue (weekly newsletter edition) */
export interface DigestIssue {
  id: string;
  slug: string;
  title: string;
  weekLabel: string;
  publishedAt: ISODateString;
  summary: string;
  items: DigestItem[];
  tags: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Blog Post
// ---------------------------------------------------------------------------

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  /** Markdown content */
  content: string;
  excerpt: string;
  authorId: string;
  author?: Author;
  status: BlogPostStatus;
  tags: string[];
  coverImageUrl: string | null;
  publishedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Subscriber
// ---------------------------------------------------------------------------

/** Newsletter subscriber */
export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: ISODateString;
  confirmed: boolean;
  unsubscribedAt: ISODateString | null;
  createdAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Email Template
// ---------------------------------------------------------------------------

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  templateType: EmailTemplateType;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Social Media Post
// ---------------------------------------------------------------------------

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls: string[];
  status: SocialPostStatus;
  scheduledAt: ISODateString | null;
  publishedAt: ISODateString | null;
  /** Optional link to the digest issue this post promotes */
  relatedIssueId: string | null;
  /** Optional link to the blog post this post promotes */
  relatedBlogPostId: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// API / Pagination helpers
// ---------------------------------------------------------------------------

/** API response envelope */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  perPage: number;
}

/** Paginated result */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
