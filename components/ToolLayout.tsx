import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToolLayoutProps {
  title: string;
  description: string;
  /** Left column — inputs & configuration. */
  config: React.ReactNode;
  /** Right column — result / preview. */
  result: React.ReactNode;
  configLabel?: string;
  resultLabel?: string;
  className?: string;
}

/**
 * Two-column responsive layout shared by every tool page:
 *   - Left: input / configuration
 *   - Right: result / preview
 * Stacks vertically on small screens.
 */
export function ToolLayout({
  title,
  description,
  config,
  result,
  configLabel,
  resultLabel,
  className,
}: ToolLayoutProps) {
  return (
    <div className={cn('container py-10 lg:py-14', className)}>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section aria-label={configLabel} className="flex flex-col">
          {configLabel && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {configLabel}
            </h2>
          )}
          <div className="flex-1 rounded-xl border bg-card p-5 shadow-sm">
            {config}
          </div>
        </section>

        <section aria-label={resultLabel} className="flex flex-col">
          {resultLabel && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {resultLabel}
            </h2>
          )}
          <div className="flex-1 rounded-xl border bg-card p-5 shadow-sm">
            {result}
          </div>
        </section>
      </div>
    </div>
  );
}
