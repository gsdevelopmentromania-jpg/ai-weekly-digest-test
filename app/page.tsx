import type { Metadata } from 'next';
import Link from 'next/link';
import { SubscribeForm } from '@/components/ui/SubscribeForm';
import { DigestCard } from '@/components/DigestCard';
import type { DigestIssue } from '@/types';

export const metadata: Metadata = {
  title: 'Home',
};

/** Mock featured issues — replace with Supabase fetch once data layer is wired */
const featuredIssues: DigestIssue[] = [
  {
    id: '3',
    slug: 'week-13-2026',
    title: 'GPT-5 Launches, Gemini Ultra 2, and the Race Toward AGI',
    weekLabel: 'Week 13, 2026',
    publishedAt: '2026-03-30T00:00:00Z',
    summary:
      'This week marked a historic moment as OpenAI unveiled GPT-5 with unprecedented reasoning capabilities, while Google countered with Gemini Ultra 2. The AI race shows no signs of slowing down as both companies push toward more general AI systems.',
    tags: ['openai', 'google', 'models', 'agi'],
    createdAt: '2026-03-30T00:00:00Z',
    updatedAt: '2026-03-30T00:00:00Z',
    items: [
      {
        id: 'i1',
        issueId: '3',
        title: 'OpenAI Unveils GPT-5 with Advanced Reasoning',
        url: 'https://openai.com',
        source: 'OpenAI Blog',
        summary: 'GPT-5 demonstrates breakthrough performance on reasoning benchmarks.',
        category: 'product',
        publishedAt: '2026-03-28T00:00:00Z',
        position: 0,
        createdAt: '2026-03-30T00:00:00Z',
      },
      {
        id: 'i2',
        issueId: '3',
        title: 'Google DeepMind Releases Gemini Ultra 2',
        url: 'https://deepmind.google',
        source: 'DeepMind',
        summary: "Google's latest flagship model rivals GPT-5 on multimodal tasks.",
        category: 'product',
        publishedAt: '2026-03-29T00:00:00Z',
        position: 1,
        createdAt: '2026-03-30T00:00:00Z',
      },
    ],
  },
  {
    id: '2',
    slug: 'week-12-2026',
    title: 'AI Regulation Arrives: EU AI Act Takes Effect & Washington Weighs In',
    weekLabel: 'Week 12, 2026',
    publishedAt: '2026-03-23T00:00:00Z',
    summary:
      'The EU AI Act enforcement phase officially began, compelling major AI labs to comply with transparency requirements. Simultaneously, U.S. lawmakers introduced bipartisan legislation targeting frontier AI safety.',
    tags: ['policy', 'eu', 'regulation', 'safety'],
    createdAt: '2026-03-23T00:00:00Z',
    updatedAt: '2026-03-23T00:00:00Z',
    items: [
      {
        id: 'i3',
        issueId: '2',
        title: 'EU AI Act Enforcement Begins',
        url: 'https://ec.europa.eu',
        source: 'European Commission',
        summary: 'The landmark regulation enters enforcement, setting global standards.',
        category: 'policy',
        publishedAt: '2026-03-21T00:00:00Z',
        position: 0,
        createdAt: '2026-03-23T00:00:00Z',
      },
    ],
  },
  {
    id: '1',
    slug: 'week-11-2026',
    title: 'AI Agents Take Centre Stage: From Code to Real-World Tasks',
    weekLabel: 'Week 11, 2026',
    publishedAt: '2026-03-16T00:00:00Z',
    summary:
      'Autonomous AI agents dominated headlines as Anthropic, Microsoft, and a wave of startups shipped agent frameworks capable of executing multi-step real-world workflows with minimal human supervision.',
    tags: ['agents', 'anthropic', 'microsoft', 'tools'],
    createdAt: '2026-03-16T00:00:00Z',
    updatedAt: '2026-03-16T00:00:00Z',
    items: [
      {
        id: 'i4',
        issueId: '1',
        title: 'Anthropic Launches Claude Agents Platform',
        url: 'https://anthropic.com',
        source: 'Anthropic',
        summary: 'Claude can now autonomously execute long-horizon software engineering tasks.',
        category: 'product',
        publishedAt: '2026-03-14T00:00:00Z',
        position: 0,
        createdAt: '2026-03-16T00:00:00Z',
      },
    ],
  },
];

const features = [
  {
    icon: '🔬',
    title: 'Research Highlights',
    description: 'Summaries of the most important AI papers and breakthroughs each week.',
  },
  {
    icon: '🚀',
    title: 'Product Launches',
    description: 'New tools, models, and platforms launching across the AI ecosystem.',
  },
  {
    icon: '📊',
    title: 'Industry Insights',
    description: 'Business trends, funding rounds, and strategic moves shaping AI.',
  },
  {
    icon: '⚖️',
    title: 'Policy & Safety',
    description: 'Regulations, governance updates, and safety research worth knowing.',
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white px-4 py-20 text-center dark:from-gray-900 dark:to-gray-950 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            Every Monday · Free forever
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            The AI stories that{' '}
            <span className="text-brand-600">actually matter</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            AI Weekly Digest curates the most impactful developments in artificial intelligence —
            research breakthroughs, product launches, policy shifts, and industry insights —
            delivered to your inbox every Monday morning.
          </p>

          {/* Subscribe form */}
          <div id="subscribe" className="mx-auto mt-10 max-w-lg scroll-mt-20">
            <SubscribeForm />
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            What&apos;s inside each issue
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-3 text-3xl">{icon}</div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Issues */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Latest issues
            </h2>
            <Link
              href="/digest"
              className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredIssues.map((issue) => (
              <DigestCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Stay ahead of the curve
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Join thousands of engineers, researchers, and founders who read AI Weekly Digest every
            Monday.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
