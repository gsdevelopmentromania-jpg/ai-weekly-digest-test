// ---------------------------------------------------------------------------
// Core domain types for AI Weekly Digest
// ---------------------------------------------------------------------------

export type ISODateString = string;

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
}

/** An individual article / news item inside a digest */
export interface DigestItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  category: DigestCategory;
  publishedAt: ISODateString;
}

export type DigestCategory =
  | 'research'
  | 'product'
  | 'industry'
  | 'tools'
  | 'policy'
  | 'other';

/** Newsletter subscriber */
export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: ISODateString;
  confirmed: boolean;
}

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
