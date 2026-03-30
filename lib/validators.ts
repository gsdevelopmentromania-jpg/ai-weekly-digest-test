/**
 * Zod validation schemas for API request bodies and query params.
 * All API routes validate inputs using these schemas before processing.
 */
import { z } from 'zod';

/** Subscribe request body */
export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/** Pagination query params */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  perPage: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
