'use client';

/**
 * Base64Converter
 * -----------------------------------------------------------------------------
 * Encode text to Base64 and decode it back. Unicode-safe (uses TextEncoder /
 * TextDecoder), with a copy button and inline error handling.
 *
 * Usage:
 *   <Base64Converter defaultMode="encode" />
 *
 * Props:
 *   - defaultMode?: 'encode' | 'decode'
 */

import * as React from 'react';
import { ArrowRightLeft, Check, Copy } from 'lucide-react';
import { copyToClipboard, cn } from '@/lib/utils';

export interface Base64ConverterProps {
  defaultMode?: 'encode' | 'decode';
  className?: string;
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
function decodeBase64(b64: string): string {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function Base64Converter({
  defaultMode = 'encode',
  className,
}: Base64ConverterProps) {
  const [mode, setMode] = React.useState<'encode' | 'decode'>(defaultMode);
  const [input, setInput] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  let output = '';
  let error: string | null = null;
  try {
    output = input ? (mode === 'encode' ? encodeBase64(input) : decodeBase64(input)) : '';
  } catch {
    error = 'Invalid Base64 input';
  }

  async function copy() {
    if (output && (await copyToClipboard(output))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="inline-flex rounded-md border p-0.5 text-sm">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'rounded px-3 py-1 capitalize transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder={mode === 'encode' ? 'Text to encode…' : 'Base64 to decode…'}
        className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowRightLeft className="h-4 w-4" />
        {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
      </div>

      <div className="relative">
        <pre
          className={cn(
            'min-h-[5rem] whitespace-pre-wrap break-all rounded-lg border bg-muted p-3 font-mono text-sm',
            error && 'text-destructive'
          )}
        >
          {error ?? output}
        </pre>
        {output && !error && (
          <button
            type="button"
            onClick={copy}
            className="absolute right-2 top-2 rounded-md border bg-background p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Copy output"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
