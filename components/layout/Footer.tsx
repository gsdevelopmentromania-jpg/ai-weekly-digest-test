import Link from 'next/link';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Issues', href: '/digest' },
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
];

export function Footer(): React.JSX.Element {
  const currentYear = 2026;

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-brand-600 font-bold text-lg">⚡</span>
            <span className="font-semibold text-gray-900 dark:text-white">AI Weekly Digest</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} AI Weekly Digest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
