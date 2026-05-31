'use client';

/**
 * LoremGenerator
 * -----------------------------------------------------------------------------
 * Generate placeholder text by paragraphs, sentences or words.
 *
 * Usage:
 *   <LoremGenerator />
 *   <LoremGenerator defaultCount={5} defaultUnit="paragraphs" />
 *
 * Props:
 *   - defaultCount?: number
 *   - defaultUnit?: 'paragraphs' | 'sentences' | 'words'
 *   - startWithLorem?: boolean (default true)
 */

import * as React from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { copyToClipboard, cn } from '@/lib/utils';

export interface LoremGeneratorProps {
  defaultCount?: number;
  defaultUnit?: 'paragraphs' | 'sentences' | 'words';
  startWithLorem?: boolean;
  className?: string;
}

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' '
  );

function rand(max: number) {
  return Math.floor(Math.random() * max);
}
function word() {
  return WORDS[rand(WORDS.length)];
}
function sentence() {
  const len = 6 + rand(10);
  const words = Array.from({ length: len }, word);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}
function paragraph() {
  const len = 3 + rand(4);
  return Array.from({ length: len }, sentence).join(' ');
}

export function LoremGenerator({
  defaultCount = 3,
  defaultUnit = 'paragraphs',
  startWithLorem = true,
  className,
}: LoremGeneratorProps) {
  const [count, setCount] = React.useState(defaultCount);
  const [unit, setUnit] = React.useState(defaultUnit);
  const [seed, setSeed] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const output = React.useMemo(() => {
    // `seed` is referenced so regenerate produces fresh text.
    void seed;
    const n = Math.max(1, Math.min(50, count));
    let parts: string[];
    if (unit === 'words') parts = [Array.from({ length: n }, word).join(' ')];
    else if (unit === 'sentences') parts = [Array.from({ length: n }, sentence).join(' ')];
    else parts = Array.from({ length: n }, paragraph);

    if (startWithLorem && parts.length) {
      parts[0] = 'Lorem ipsum dolor sit amet, ' + parts[0];
    }
    return parts.join('\n\n');
  }, [count, unit, startWithLorem, seed]);

  async function copy() {
    if (await copyToClipboard(output)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="h-9 w-20 rounded-md border border-input bg-background px-2"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as typeof unit)}
          className="h-9 rounded-md border border-input bg-background px-2"
        >
          <option value="paragraphs">Paragraphs</option>
          <option value="sentences">Sentences</option>
          <option value="words">Words</option>
        </select>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" /> Regenerate
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="whitespace-pre-wrap rounded-lg border bg-muted p-4 text-sm leading-7">
        {output}
      </div>
    </div>
  );
}
