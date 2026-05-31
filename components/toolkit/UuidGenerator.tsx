'use client';

/**
 * UuidGenerator
 * -----------------------------------------------------------------------------
 * Generate one or more RFC-4122 v4 UUIDs (via crypto.randomUUID with a safe
 * fallback) and copy them individually or all at once.
 *
 * Usage:
 *   <UuidGenerator defaultCount={5} />
 *
 * Props:
 *   - defaultCount?: number (default 1)
 *   - uppercase?: boolean
 */

import * as React from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { copyToClipboard, cn } from '@/lib/utils';

export interface UuidGeneratorProps {
  defaultCount?: number;
  uppercase?: boolean;
  className?: string;
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older environments.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGenerator({
  defaultCount = 1,
  uppercase = false,
  className,
}: UuidGeneratorProps) {
  const [count, setCount] = React.useState(defaultCount);
  const [upper, setUpper] = React.useState(uppercase);
  const [ids, setIds] = React.useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);

  const generate = React.useCallback(() => {
    const n = Math.max(1, Math.min(100, count));
    setIds(Array.from({ length: n }, () => uuidv4()));
  }, [count]);

  React.useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const display = (id: string) => (upper ? id.toUpperCase() : id);

  async function copyOne(id: string, i: number) {
    if (await copyToClipboard(display(id))) {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1200);
    }
  }
  async function copyAll() {
    if (await copyToClipboard(ids.map(display).join('\n'))) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="h-9 w-20 rounded-md border border-input bg-background px-2"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.target.checked)}
            className="accent-primary"
          />
          Uppercase
        </label>
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" /> Generate
        </button>
        {ids.length > 1 && (
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            {copiedAll ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            Copy all
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {ids.map((id, i) => (
          <li key={i} className="flex items-center gap-2">
            <code className="flex-1 rounded-md border bg-muted px-3 py-1.5 text-sm">
              {display(id)}
            </code>
            <button
              type="button"
              aria-label="Copy"
              onClick={() => copyOne(id, i)}
              className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {copiedIdx === i ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
