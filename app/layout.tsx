import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
      <head>
        {/* Prevent flash of unstyled content: apply theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
