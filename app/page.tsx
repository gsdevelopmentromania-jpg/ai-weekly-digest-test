import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          AI Weekly Digest
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Your weekly curated newsletter covering the latest developments in Artificial
          Intelligence — product launches, research highlights, and industry insights.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="#subscribe"
            className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Subscribe
          </a>
          <a
            href="/digest"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Browse issues <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
