'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Eraser } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { copyToClipboard } from '@/lib/utils';

const DEFAULT_MARKDOWN = `# Hello world

Welcome to the **Markdown Preview** tool.

## Features

- Live preview as you type
- GitHub flavored markdown (tables, task lists)
- One-click **Copy HTML**

> Blockquotes look great too.

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

| Tool | Status |
| ---- | ------ |
| Image Compressor | Ready |
| Color Converter  | Ready |

- [x] Write some markdown
- [ ] Ship a product
`;

// Tailwind-styled renderers so we don't depend on the typography plugin.
const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold tracking-tight first:mt-0" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mb-3 mt-6 border-b pb-1 text-xl font-semibold first:mt-0" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold" {...props} />
  ),
  p: ({ node, ...props }) => <p className="my-3 leading-7" {...props} />,
  a: ({ node, ...props }) => (
    <a className="font-medium text-primary underline underline-offset-4" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="my-3 ml-6 list-disc space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="my-3 ml-6 list-decimal space-y-1" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-7" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="my-4 border-l-4 border-primary/40 pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => <hr className="my-6 border-border" {...props} />,
  pre: ({ node, ...props }) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm"
      {...props}
    />
  ),
  code: ({ node, className, children, ...props }) => {
    const isInline = !className;
    return isInline ? (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={`font-mono text-sm ${className ?? ''}`} {...props}>
        {children}
      </code>
    );
  },
  table: ({ node, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th className="border bg-muted px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border px-3 py-2" {...props} />
  ),
  img: ({ node, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img className="my-4 max-w-full rounded-lg" {...props} />
  ),
};

export function MarkdownPreviewClient() {
  const t = useTranslations('Tools.markdownPreview');
  const tc = useTranslations('Common');

  const [value, setValue] = React.useState(DEFAULT_MARKDOWN);
  const [copied, setCopied] = React.useState(false);
  const debounced = useDebounce(value, 200);
  const previewRef = React.useRef<HTMLDivElement>(null);

  async function handleCopyHtml() {
    const html = previewRef.current?.innerHTML ?? '';
    const ok = await copyToClipboard(html);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const config = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t('inputLabel')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setValue('')}
          disabled={!value}
        >
          <Eraser className="h-4 w-4" />
          {t('clear')}
        </Button>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('placeholder')}
        spellCheck={false}
        className="min-h-[24rem] flex-1 resize-none rounded-lg border bg-background p-4 font-mono text-sm leading-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );

  const result = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t('previewLabel')}</span>
        <Button variant="outline" size="sm" onClick={handleCopyHtml}>
          {copied ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              {tc('copied')}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t('copyHtml')}
            </>
          )}
        </Button>
      </div>
      <div
        ref={previewRef}
        className="min-h-[24rem] flex-1 overflow-auto rounded-lg border bg-background p-4 text-sm"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {debounced}
        </ReactMarkdown>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title={t('title')}
      description={t('description')}
      config={config}
      result={result}
    />
  );
}
