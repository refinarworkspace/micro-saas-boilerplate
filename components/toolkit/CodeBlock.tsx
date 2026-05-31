'use client';

/**
 * CodeBlock
 * -----------------------------------------------------------------------------
 * Syntax-highlighted code display with a copy button. Uses a tiny, dependency
 * free highlighter (keywords / strings / comments / numbers) that works for
 * most C-like languages and JSON. Light & dark mode aware.
 *
 * Usage:
 *   <CodeBlock code={`const x = 1;`} language="js" showLineNumbers />
 *
 * Props:
 *   - code: string
 *   - language?: string         (label only)
 *   - showLineNumbers?: boolean
 *   - copyable?: boolean        (default true)
 */

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard, cn } from '@/lib/utils';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  className?: string;
}

const KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|true|false|null|undefined|this|super|void|yield|in|of|do|public|private|protected|static|interface|type|enum)\b/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlight(code: string): string {
  let html = escapeHtml(code);
  // Strings (single, double, backtick)
  html = html.replace(
    /(&quot;.*?&quot;|&#39;.*?&#39;|"[^"]*"|'[^']*'|`[^`]*`)/g,
    '<span class="text-emerald-600 dark:text-emerald-400">$1</span>'
  );
  // Line + block comments
  html = html.replace(
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    '<span class="text-muted-foreground italic">$1</span>'
  );
  // Numbers
  html = html.replace(
    /\b(\d+(\.\d+)?)\b/g,
    '<span class="text-amber-600 dark:text-amber-400">$1</span>'
  );
  // Keywords
  html = html.replace(
    KEYWORDS,
    '<span class="text-primary font-medium">$1</span>'
  );
  return html;
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  copyable = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = code.replace(/\n$/, '').split('\n');

  async function onCopy() {
    if (await copyToClipboard(code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-muted', className)}>
      {(language || copyable) && (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted px-3 py-1.5">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {language ?? 'code'}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className="font-mono">
          {lines.map((line, i) => (
            <div key={i} className="table-row">
              {showLineNumbers && (
                <span className="table-cell select-none pr-4 text-right text-muted-foreground/60">
                  {i + 1}
                </span>
              )}
              <span
                className="table-cell"
                dangerouslySetInnerHTML={{ __html: highlight(line) || '&nbsp;' }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
