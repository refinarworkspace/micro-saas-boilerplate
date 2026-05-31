'use client';

/**
 * UrlParser
 * -----------------------------------------------------------------------------
 * Parse a URL into its components (protocol, host, port, path, query params,
 * hash) using the native URL API.
 *
 * Usage:
 *   <UrlParser defaultUrl="https://example.com:8080/a/b?x=1&y=2#top" />
 *
 * Props:
 *   - defaultUrl?: string
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface UrlParserProps {
  defaultUrl?: string;
  className?: string;
}

export function UrlParser({
  defaultUrl = 'https://user:pass@example.com:8080/path/to/page?foo=bar&baz=qux#section',
  className,
}: UrlParserProps) {
  const [input, setInput] = React.useState(defaultUrl);

  const { url, error } = React.useMemo(() => {
    try {
      return { url: new URL(input), error: null as string | null };
    } catch {
      return { url: null, error: 'Invalid URL' };
    }
  }, [input]);

  const params = url ? Array.from(url.searchParams.entries()) : [];

  const rows: { label: string; value: string }[] = url
    ? [
        { label: 'Protocol', value: url.protocol },
        { label: 'Username', value: url.username || '—' },
        { label: 'Password', value: url.password ? '••••••' : '—' },
        { label: 'Hostname', value: url.hostname },
        { label: 'Port', value: url.port || '(default)' },
        { label: 'Path', value: url.pathname },
        { label: 'Hash', value: url.hash || '—' },
        { label: 'Origin', value: url.origin },
      ]
    : [];

  return (
    <div className={cn('space-y-4', className)}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://…"
        className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          ⚠ {error}
        </p>
      ) : (
        <>
          <dl className="overflow-hidden rounded-lg border text-sm">
            {rows.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  'flex items-center justify-between gap-4 px-3 py-2',
                  i % 2 === 0 ? 'bg-muted/40' : ''
                )}
              >
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="truncate font-mono">{r.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="mb-2 text-sm font-medium">
              Query parameters ({params.length})
            </p>
            {params.length === 0 ? (
              <p className="text-sm text-muted-foreground">No query parameters.</p>
            ) : (
              <ul className="space-y-1">
                {params.map(([k, v], i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-md border px-3 py-1.5 font-mono text-sm"
                  >
                    <span className="text-primary">{k}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className="truncate">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
