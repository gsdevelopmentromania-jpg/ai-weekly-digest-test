'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function SubscribeForm(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          🎉 You&apos;re subscribed! Check your inbox to confirm your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row" noValidate>
      <label htmlFor="subscribe-email" className="sr-only">
        Email address
      </label>
      <input
        id="subscribe-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      />
      <Button type="submit" isLoading={status === 'loading'} size="md">
        Subscribe
      </Button>
      {status === 'error' && (
        <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400 sm:col-span-2">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
