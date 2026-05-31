'use client';

/**
 * DiffViewer
 * -----------------------------------------------------------------------------
 * Side-by-side text diff powered by the `diff` library. The left column shows
 * the original (removed lines highlighted), the right shows the new version
 * (added lines highlighted).
 *
 * Usage:
 *   <DiffViewer oldText={a} newText={b} />
 *   <DiffViewer oldText={a} newText={b} editable />  // built-in textareas
 *
 * Props:
 *   - oldText / newText: string
 *   - editable?: boolean   render editable inputs above the diff
 */

import * as React from 'react';
import { diffLines } from 'diff';
import { cn } from '@/lib/utils';

export interface DiffViewerProps {
  oldText?: string;
  newText?: string;
  editable?: boolean;
  className?: string;
}

function splitLines(value: string): string[] {
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function DiffViewer({
  oldText = '',
  newText = '',
  editable = false,
  className,
}: DiffViewerProps) {
  const [a, setA] = React.useState(oldText);
  const [b, setB] = React.useState(newText);

  const left = !editable ? oldText : a;
  const right = !editable ? newText : b;

  const parts = React.useMemo(() => diffLines(left, right), [left, right]);

  const leftRows: { text: string; type: 'removed' | 'common' }[] = [];
  const rightRows: { text: string; type: 'added' | 'common' }[] = [];

  for (const part of parts) {
    const lines = splitLines(part.value);
    if (part.added) {
      lines.forEach((t) => rightRows.push({ text: t, type: 'added' }));
    } else if (part.removed) {
      lines.forEach((t) => leftRows.push({ text: t, type: 'removed' }));
    } else {
      lines.forEach((t) => {
        leftRows.push({ text: t, type: 'common' });
        rightRows.push({ text: t, type: 'common' });
      });
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {editable && (
        <div className="grid gap-3 md:grid-cols-2">
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={5}
            placeholder="Original…"
            className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={5}
            placeholder="Changed…"
            className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      <div className="grid grid-cols-2 overflow-hidden rounded-lg border font-mono text-xs">
        <DiffColumn rows={leftRows} side="left" />
        <DiffColumn rows={rightRows} side="right" />
      </div>
    </div>
  );
}

function DiffColumn({
  rows,
  side,
}: {
  rows: { text: string; type: string }[];
  side: 'left' | 'right';
}) {
  return (
    <div className={cn('overflow-x-auto', side === 'left' && 'border-r')}>
      {rows.length === 0 ? (
        <div className="p-3 text-muted-foreground">—</div>
      ) : (
        rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-2 px-3 py-0.5 leading-5',
              row.type === 'removed' && 'bg-destructive/10 text-destructive',
              row.type === 'added' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            )}
          >
            <span className="select-none text-muted-foreground/50">
              {row.type === 'removed' ? '-' : row.type === 'added' ? '+' : ' '}
            </span>
            <span className="whitespace-pre-wrap break-all">{row.text || ' '}</span>
          </div>
        ))
      )}
    </div>
  );
}
