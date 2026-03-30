/**
 * Subscriber service — business logic for newsletter subscriptions.
 * Used only in API routes or Server Actions (never in Client Components).
 */
import { supabase } from '@/lib/supabase';
import type { Subscriber } from '@/types';

/**
 * Subscribe an email address.
 * - If the email already exists and is confirmed, returns the existing record.
 * - If the email exists but is unconfirmed, a new confirmation can be re-sent.
 * - Otherwise inserts a new subscriber row.
 */
export async function subscribe(email: string): Promise<Subscriber> {
  // Check for existing subscriber
  const { data: existing } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return mapRowToSubscriber(existing);
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({ email, confirmed: false })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToSubscriber(data);
}

/**
 * Unsubscribe by email — deletes the subscriber record.
 * Returns true if a row was deleted, false if no matching row existed.
 */
export async function unsubscribe(email: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('subscribers')
    .delete({ count: 'exact' })
    .eq('email', email);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Mapping helper
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToSubscriber(row: Record<string, any>): Subscriber {
  return {
    id: row.id as string,
    email: row.email as string,
    subscribedAt: row.subscribed_at as string,
    confirmed: row.confirmed as boolean,
    unsubscribedAt: (row.unsubscribed_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}
