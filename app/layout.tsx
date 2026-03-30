import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI Weekly Digest',
    template: '%s | AI Weekly Digest',
  },
  description:
    'Your weekly newsletter covering the latest developments in Artificial Intelligence — curated insights, product launches, and research highlights.',
  keywords: ['AI', 'artificial intelligence', 'newsletter', 'weekly digest', 'machine learning'],
  authors: [{ name: 'AI Weekly Digest' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aiweeklydigest.com',
    siteName: 'AI Weekly Digest',
    title: 'AI Weekly Digest',
    description:
      'Your weekly newsletter covering the latest developments in Artificial Intelligence.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Weekly Digest',
    description:
      'Your weekly newsletter covering the latest developments in Artificial Intelligence.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
