import type { Metadata } from 'next';
import { DigestCard } from '@/components/DigestCard';
import type { DigestIssue } from '@/types';

export const metadata: Metadata = {
  title: 'All Issues',
  description: 'Browse all editions of AI Weekly Digest — your weekly AI newsletter.',
};

/** Mock data — replace with Supabase query once data layer is wired */
const allIssues: DigestIssue[] = [
  {
    id: '3',
    slug: 'week-13-2026',
    title: 'GPT-5 Launches, Gemini Ultra 2, and the Race Toward AGI',
    weekLabel: 'Week 13, 2026',
    publishedAt: '2026-03-30T00:00:00Z',
    summary:
      'This week marked a historic moment as OpenAI unveiled GPT-5 with unprecedented reasoning capabilities, while Google countered with Gemini Ultra 2.',
    tags: ['openai', 'google', 'models', 'agi'],
    items: [
      {
        id: 'i1',
        title: 'OpenAI Unveils GPT-5',
        url: 'https://openai.com',
        source: 'OpenAI Blog',
        summary: 'GPT-5 demonstrates breakthrough performance on reasoning benchmarks.',
        category: 'product',
        publishedAt: '2026-03-28T00:00:00Z',
      },
      {
        id: 'i2',
        title: 'Google DeepMind Releases Gemini Ultra 2',
        url: 'https://deepmind.google',
        source: 'DeepMind',
        summary: "Google's latest flagship model rivals GPT-5 on multimodal tasks.",
        category: 'product',
        publishedAt: '2026-03-29T00:00:00Z',
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
      'The EU AI Act enforcement phase officially began, compelling major AI labs to comply with transparency requirements.',
    tags: ['policy', 'eu', 'regulation', 'safety'],
    items: [
      {
        id: 'i3',
        title: 'EU AI Act Enforcement Begins',
        url: 'https://ec.europa.eu',
        source: 'European Commission',
        summary: 'The landmark regulation enters enforcement, setting global standards.',
        category: 'policy',
        publishedAt: '2026-03-21T00:00:00Z',
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
      'Autonomous AI agents dominated headlines as Anthropic, Microsoft, and a wave of startups shipped agent frameworks capable of executing multi-step real-world workflows.',
    tags: ['agents', 'anthropic', 'microsoft', 'tools'],
    items: [
      {
        id: 'i4',
        title: 'Anthropic Launches Claude Agents Platform',
        url: 'https://anthropic.com',
        source: 'Anthropic',
        summary: 'Claude can now autonomously execute long-horizon software engineering tasks.',
        category: 'product',
        publishedAt: '2026-03-14T00:00:00Z',
      },
    ],
  },
];

export default function DigestListPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          All Issues
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          Every edition of AI Weekly Digest, from newest to oldest.
        </p>
      </div>

      {/* Issue grid */}
      {allIssues.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No issues published yet. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allIssues.map((issue) => (
            <DigestCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
