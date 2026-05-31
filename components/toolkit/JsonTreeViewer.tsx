'use client';

/**
 * JsonTreeViewer
 * -----------------------------------------------------------------------------
 * Collapsible tree view for JSON values. Accepts either a parsed value or a
 * raw JSON string (which it will parse, showing an error on failure).
 *
 * Usage:
 *   <JsonTreeViewer data={{ a: 1, b: [1, 2, { c: true }] }} />
 *   <JsonTreeViewer json='{"a":1}' defaultExpanded />
 *
 * Props:
 *   - data?: unknown            already-parsed value
 *   - json?: string             raw JSON string (parsed internally)
 *   - defaultExpanded?: boolean expand all nodes initially (default true)
 */

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JsonTreeViewerProps {
  data?: unknown;
  json?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function JsonTreeViewer({
  data,
  json,
  defaultExpanded = true,
  className,
}: JsonTreeViewerProps) {
  let value: unknown = data;
  let error: string | null = null;
  if (json !== undefined) {
    try {
      value = JSON.parse(json);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid JSON';
    }
  }

  return (
    <div
      className={cn(
        'overflow-auto rounded-lg border bg-card p-3 font-mono text-sm',
        className
      )}
    >
      {error ? (
        <p className="text-destructive">⚠ {error}</p>
      ) : (
        <Node name={null} value={value} depth={0} defaultExpanded={defaultExpanded} isLast />
      )}
    </div>
  );
}

function Node({
  name,
  value,
  depth,
  defaultExpanded,
  isLast,
}: {
  name: string | null;
  value: unknown;
  depth: number;
  defaultExpanded: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = React.useState(defaultExpanded || depth < 1);
  const isObject = value !== null && typeof value === 'object';
  const keyLabel =
    name !== null ? <span className="text-primary">&quot;{name}&quot;</span> : null;

  if (!isObject) {
    return (
      <div style={{ paddingLeft: depth * 14 }}>
        {keyLabel}
        {keyLabel && <span className="text-muted-foreground">: </span>}
        <ValueLeaf value={value} />
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);
  const open1 = Array.isArray(value) ? '[' : '{';
  const close1 = Array.isArray(value) ? ']' : '}';

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 hover:text-primary"
      >
        <ChevronRight
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-90')}
        />
        {keyLabel}
        {keyLabel && <span className="text-muted-foreground">: </span>}
        <span className="text-muted-foreground">
          {open1}
          {!open && (
            <span className="opacity-60">
              {' '}
              {entries.length} {Array.isArray(value) ? 'items' : 'keys'}{' '}
              {close1}
            </span>
          )}
        </span>
      </button>
      {open && (
        <div>
          {entries.map(([k, v], i) => (
            <Node
              key={k}
              name={Array.isArray(value) ? null : k}
              value={v}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
              isLast={i === entries.length - 1}
            />
          ))}
          <div style={{ paddingLeft: 0 }}>
            <span className="text-muted-foreground">{close1}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function ValueLeaf({ value }: { value: unknown }) {
  if (typeof value === 'string')
    return <span className="text-emerald-600 dark:text-emerald-400">&quot;{value}&quot;</span>;
  if (typeof value === 'number')
    return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
  if (typeof value === 'boolean')
    return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>;
  if (value === null) return <span className="text-muted-foreground">null</span>;
  return <span>{String(value)}</span>;
}
