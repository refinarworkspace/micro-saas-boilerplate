'use client';

/**
 * HttpStatusChecker
 * -----------------------------------------------------------------------------
 * Check the HTTP status of one or more URLs (one per line). Because browsers
 * enforce CORS, cross-origin requests may report "blocked" — pass a server
 * `proxyEndpoint` that fetches the URL server-side to get reliable results.
 *
 * Usage:
 *   <HttpStatusChecker />
 *   <HttpStatusChecker proxyEndpoint="/api/http-status" />
 *
 * Props:
 *   - proxyEndpoint?: string   POST { url } -> { status, statusText }
 *   - defaultUrls?: string[]
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HttpStatusCheckerProps {
  proxyEndpoint?: string;
  defaultUrls?: string[];
  className?: string;
}

interface Result {
  url: string;
  status: number | null;
  text: string;
  ok: boolean;
}

export function HttpStatusChecker({
  proxyEndpoint,
  defaultUrls = ['https://example.com', 'https://httpstat.us/404'],
  className,
}: HttpStatusCheckerProps) {
  const [text, setText] = React.useState(defaultUrls.join('\n'));
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function checkOne(url: string): Promise<Result> {
    try {
      if (proxyEndpoint) {
        const res = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        return {
          url,
          status: data.status ?? null,
          text: data.statusText ?? '',
          ok: data.status >= 200 && data.status < 400,
        };
      }
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      return { url, status: res.status, text: res.statusText, ok: res.ok };
    } catch {
      return { url, status: null, text: 'Blocked / network error (CORS?)', ok: false };
    }
  }

  async function run() {
    const urls = text.split('\n').map((u) => u.trim()).filter(Boolean);
    setLoading(true);
    setResults([]);
    const out = await Promise.all(urls.map(checkOne));
    setResults(out);
    setLoading(false);
  }

  function tone(r: Result) {
    if (r.status == null) return 'text-destructive';
    if (r.status < 300) return 'text-emerald-600 dark:text-emerald-400';
    if (r.status < 400) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  }

  return (
    <div className={cn('space-y-3', className)}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="One URL per line…"
        className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Check status
      </button>

      {!proxyEndpoint && (
        <p className="text-xs text-muted-foreground">
          Tip: cross-origin checks may be blocked by CORS. Provide a{' '}
          <code>proxyEndpoint</code> for reliable results.
        </p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <span className="truncate font-mono">{r.url}</span>
              <span className={cn('font-semibold tabular-nums', tone(r))}>
                {r.status ?? '—'} {r.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
