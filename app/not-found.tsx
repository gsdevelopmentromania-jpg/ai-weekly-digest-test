import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
      >
        Go back home
      </Link>
    </div>
  );
}
