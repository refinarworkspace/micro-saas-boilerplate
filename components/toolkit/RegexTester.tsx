'use client';

/**
 * RegexTester
 * -----------------------------------------------------------------------------
 * Test a regular expression against sample text with live match highlighting,
 * a match/group list and invalid-pattern handling.
 *
 * Usage:
 *   <RegexTester defaultPattern="\\b\\w+@\\w+\\.\\w+\\b" defaultText="a@b.com" />
 *
 * Props:
 *   - defaultPattern?: string
 *   - defaultFlags?: string (default "g")
 *   - defaultText?: string
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RegexTesterProps {
  defaultPattern?: string;
  defaultFlags?: string;
  defaultText?: string;
  className?: string;
}

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

export function RegexTester({
  defaultPattern = '\\b\\w+\\b',
  defaultFlags = 'g',
  defaultText = 'The quick brown fox jumps over the lazy dog.',
  className,
}: RegexTesterProps) {
  const [pattern, setPattern] = React.useState(defaultPattern);
  const [flags, setFlags] = React.useState(defaultFlags);
  const [text, setText] = React.useState(defaultText);

  const { matches, error } = React.useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: null };
    try {
      const safeFlags = flags.includes('g') ? flags : flags + 'g';
      const re = new RegExp(pattern, safeFlags);
      const out: MatchInfo[] = [];
      let m: RegExpExecArray | null;
      let guard = 0;
      while ((m = re.exec(text)) !== null && guard < 10000) {
        out.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m.index === re.lastIndex) re.lastIndex++; // avoid zero-width loops
        guard++;
      }
      return { matches: out, error: null };
    } catch (e) {
      return {
        matches: [] as MatchInfo[],
        error: e instanceof Error ? e.message : 'Invalid pattern',
      };
    }
  }, [pattern, flags, text]);

  // Build highlighted output.
  const highlighted = React.useMemo(() => {
    if (error || matches.length === 0) return null;
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m, i) => {
      if (m.index > cursor) nodes.push(text.slice(cursor, m.index));
      nodes.push(
        <mark key={i} className="rounded bg-primary/30 px-0.5 text-foreground">
          {m.match}
        </mark>
      );
      cursor = m.index + m.match.length;
    });
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
  }, [matches, text, error]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-muted-foreground">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3"
        />
        <span className="text-muted-foreground">/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
          placeholder="flags"
          className="h-10 w-20 rounded-md border border-input bg-background px-3"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-lg border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          ⚠ {error}
        </p>
      ) : (
        <>
          <div className="rounded-lg border bg-muted p-3 text-sm leading-7 whitespace-pre-wrap">
            {highlighted ?? <span className="text-muted-foreground">No matches</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {matches.length} match{matches.length === 1 ? '' : 'es'}
          </p>
          {matches.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-auto text-xs">
              {matches.map((m, i) => (
                <li key={i} className="rounded-md border px-2 py-1 font-mono">
                  <span className="text-primary">#{i + 1}</span> @{m.index}:{' '}
                  {m.match}
                  {m.groups.length > 0 && (
                    <span className="text-muted-foreground">
                      {' '}
                      [{m.groups.map((g) => g ?? '∅').join(', ')}]
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
