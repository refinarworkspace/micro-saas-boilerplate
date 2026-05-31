'use client';

/**
 * RobotsTester
 * -----------------------------------------------------------------------------
 * Test whether a path is allowed for a given user-agent against a robots.txt
 * body. Implements the common "longest matching rule wins" precedence used by
 * Google's parser (simplified — supports User-agent, Allow, Disallow, `*`, `$`).
 *
 * Usage:
 *   <RobotsTester defaultRobots={"User-agent: *\nDisallow: /admin"} />
 *
 * Props:
 *   - defaultRobots?: string
 *   - defaultPath?: string
 *   - defaultUserAgent?: string
 */

import * as React from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RobotsTesterProps {
  defaultRobots?: string;
  defaultPath?: string;
  defaultUserAgent?: string;
  className?: string;
}

interface Rule {
  type: 'allow' | 'disallow';
  path: string;
}

function parseGroups(robots: string): Map<string, Rule[]> {
  const groups = new Map<string, Rule[]>();
  let current: string[] = [];
  for (let line of robots.split('\n')) {
    line = line.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      current = [value.toLowerCase()];
      if (!groups.has(value.toLowerCase())) groups.set(value.toLowerCase(), []);
    } else if (key === 'allow' || key === 'disallow') {
      for (const ua of current) {
        const arr = groups.get(ua) ?? [];
        arr.push({ type: key, path: value });
        groups.set(ua, arr);
      }
    }
  }
  return groups;
}

function ruleMatches(pattern: string, path: string): number {
  // Returns match length if the pattern matches the path, else -1.
  if (pattern === '') return -1;
  const anchored = pattern.endsWith('$');
  const pat = anchored ? pattern.slice(0, -1) : pattern;
  const regex = new RegExp(
    '^' +
      pat
        .split('*')
        .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      (anchored ? '$' : '')
  );
  return regex.test(path) ? pattern.length : -1;
}

function evaluate(robots: string, ua: string, path: string) {
  const groups = parseGroups(robots);
  const rules = groups.get(ua.toLowerCase()) ?? groups.get('*') ?? [];
  let best: { rule: Rule; len: number } | null = null;
  for (const rule of rules) {
    const len = ruleMatches(rule.path, path);
    if (len >= 0 && (!best || len > best.len)) best = { rule, len };
  }
  // No matching rule => allowed by default.
  return { allowed: !best || best.rule.type === 'allow', rule: best?.rule ?? null };
}

export function RobotsTester({
  defaultRobots = 'User-agent: *\nDisallow: /admin\nAllow: /admin/public\nDisallow: /*.pdf$',
  defaultPath = '/admin/settings',
  defaultUserAgent = '*',
  className,
}: RobotsTesterProps) {
  const [robots, setRobots] = React.useState(defaultRobots);
  const [path, setPath] = React.useState(defaultPath);
  const [ua, setUa] = React.useState(defaultUserAgent);

  const result = React.useMemo(() => {
    try {
      return evaluate(robots, ua, path);
    } catch {
      return { allowed: true, rule: null as Rule | null };
    }
  }, [robots, ua, path]);

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      <div className="space-y-3">
        <label className="text-sm font-medium">robots.txt</label>
        <textarea
          value={robots}
          onChange={(e) => setRobots(e.target.value)}
          rows={8}
          className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Path</span>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">User-agent</span>
          <input
            value={ua}
            onChange={(e) => setUa(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
          />
        </label>

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium',
            result.allowed
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          {result.allowed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Ban className="h-5 w-5" />
          )}
          {result.allowed ? 'Allowed' : 'Blocked'}
          {result.rule && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {result.rule.type}: {result.rule.path}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
