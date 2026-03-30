import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { TagBadge } from '@/components/ui/Badge';
import { formatDateShort } from '@/lib/utils';
import type { DigestIssue } from '@/types';

interface DigestCardProps {
  issue: DigestIssue;
}

export function DigestCard({ issue }: DigestCardProps): React.JSX.Element {
  return (
    <Link href={`/digest/${issue.slug}`} className="group block focus:outline-none">
      <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-brand-500">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
              {issue.weekLabel}
            </span>
            <time
              dateTime={issue.publishedAt}
              className="text-xs text-gray-400 dark:text-gray-500"
            >
              {formatDateShort(issue.publishedAt)}
            </time>
          </div>
          <CardTitle className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {issue.title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="line-clamp-3 text-sm leading-relaxed">{issue.summary}</p>
        </CardContent>

        <CardFooter className="flex-wrap gap-2">
          {issue.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {issue.items.length > 0 && (
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              {issue.items.length} item{issue.items.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
