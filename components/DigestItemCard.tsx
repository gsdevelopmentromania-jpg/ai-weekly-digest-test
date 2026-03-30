import { CategoryBadge } from '@/components/ui/Badge';
import { formatDateShort } from '@/lib/utils';
import type { DigestItem } from '@/types';

interface DigestItemCardProps {
  item: DigestItem;
}

export function DigestItemCard({ item }: DigestItemCardProps): React.JSX.Element {
  return (
    <article className="border-b border-gray-100 pb-6 last:border-0 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={item.category} />
        <span className="text-xs text-gray-400 dark:text-gray-500">{item.source}</span>
        <time
          dateTime={item.publishedAt}
          className="ml-auto text-xs text-gray-400 dark:text-gray-500"
        >
          {formatDateShort(item.publishedAt)}
        </time>
      </div>

      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {item.title}
          <span className="ml-1 text-xs text-gray-400" aria-hidden="true">↗</span>
        </a>
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {item.summary}
      </p>
    </article>
  );
}
