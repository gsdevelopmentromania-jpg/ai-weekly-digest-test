import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DigestItemCard } from '@/components/DigestItemCard';
import { TagBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { DigestIssue } from '@/types';

/** Mock data — replace with Supabase query once data layer is wired */
const allIssues: DigestIssue[] = [
  {
    id: '3',
    slug: 'week-13-2026',
    title: 'GPT-5 Launches, Gemini Ultra 2, and the Race Toward AGI',
    weekLabel: 'Week 13, 2026',
    publishedAt: '2026-03-30T00:00:00Z',
    summary:
      'This week marked a historic moment as OpenAI unveiled GPT-5 with unprecedented reasoning capabilities, while Google countered with Gemini Ultra 2. The AI race shows no signs of slowing down as both companies push toward more general AI systems.',
    tags: ['openai', 'google', 'models', 'agi'],
    items: [
      {
        id: 'i1',
        title: 'OpenAI Unveils GPT-5 with Advanced Reasoning',
        url: 'https://openai.com',
        source: 'OpenAI Blog',
        summary:
          'OpenAI announced GPT-5 this week, claiming significant improvements in reasoning, coding, and multimodal understanding. Early benchmarks show it outperforming all prior public models on standard evaluations.',
        category: 'product',
        publishedAt: '2026-03-28T00:00:00Z',
      },
      {
        id: 'i2',
        title: 'Google DeepMind Releases Gemini Ultra 2',
        url: 'https://deepmind.google',
        source: 'DeepMind',
        summary:
          "Hours after OpenAI's announcement, Google DeepMind launched Gemini Ultra 2, featuring native video understanding and a 2M-token context window — the largest commercially available today.",
        category: 'product',
        publishedAt: '2026-03-29T00:00:00Z',
      },
      {
        id: 'i3',
        title: 'The AGI Timeline Debate Heats Up',
        url: 'https://example.com/agi-debate',
        source: 'MIT Technology Review',
        summary:
          "With rapid capability jumps at both OpenAI and Google, leading researchers are revisiting their AGI timeline estimates. Some now believe transformative AI could arrive within this decade.",
        category: 'research',
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
      'The EU AI Act enforcement phase officially began, compelling major AI labs to comply with transparency requirements. Simultaneously, U.S. lawmakers introduced bipartisan legislation targeting frontier AI safety.',
    tags: ['policy', 'eu', 'regulation', 'safety'],
    items: [
      {
        id: 'i4',
        title: 'EU AI Act Enforcement Begins',
        url: 'https://ec.europa.eu',
        source: 'European Commission',
        summary:
          'The EU AI Act enters its enforcement phase, requiring AI providers to register high-risk systems and provide detailed documentation of training data and model capabilities.',
        category: 'policy',
        publishedAt: '2026-03-21T00:00:00Z',
      },
      {
        id: 'i5',
        title: 'Bipartisan US AI Safety Bill Introduced',
        url: 'https://congress.gov',
        source: 'The Verge',
        summary:
          'A new Senate bill proposes mandatory safety evaluations for frontier AI models before public release, with significant bipartisan support from both sides of the aisle.',
        category: 'policy',
        publishedAt: '2026-03-22T00:00:00Z',
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
    items: [
      {
        id: 'i6',
        title: 'Anthropic Launches Claude Agents Platform',
        url: 'https://anthropic.com',
        source: 'Anthropic',
        summary:
          'Claude can now autonomously execute long-horizon software engineering tasks, including writing and running tests, debugging, and opening pull requests on GitHub.',
        category: 'product',
        publishedAt: '2026-03-14T00:00:00Z',
      },
      {
        id: 'i7',
        title: 'Microsoft Copilot Studio Gets Agentic Mode',
        url: 'https://microsoft.com',
        source: 'Microsoft Blog',
        summary:
          'Microsoft expanded Copilot Studio with agentic capabilities, allowing enterprise users to build custom agents that can browse the web, call APIs, and automate business workflows.',
        category: 'tools',
        publishedAt: '2026-03-15T00:00:00Z',
      },
    ],
  },
];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = allIssues.find((i) => i.slug === slug);

  if (!issue) {
    return { title: 'Issue Not Found' };
  }

  return {
    title: issue.title,
    description: issue.summary,
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return allIssues.map((issue) => ({ slug: issue.slug }));
}

export default async function DigestDetailPage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const issue = allIssues.find((i) => i.slug === slug);

  if (!issue) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/digest"
        className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
      >
        ← Back to all issues
      </Link>

      {/* Issue header */}
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {issue.weekLabel}
          </span>
          <time dateTime={issue.publishedAt} className="text-sm text-gray-400 dark:text-gray-500">
            {formatDate(issue.publishedAt)}
          </time>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {issue.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          {issue.summary}
        </p>

        {issue.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {issue.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {/* Items */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          {issue.items.length} item{issue.items.length !== 1 ? 's' : ''} this week
        </h2>
        <div className="space-y-6">
          {issue.items.map((item) => (
            <DigestItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
