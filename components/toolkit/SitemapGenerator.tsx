'use client';

/**
 * SitemapGenerator
 * -----------------------------------------------------------------------------
 * Paste a list of URLs (one per line) to build a visual path tree and generate
 * a valid XML sitemap you can copy.
 *
 * Usage:
 *   <SitemapGenerator defaultUrls={['https://x.com/', 'https://x.com/about']} />
 *
 * Props:
 *   - defaultUrls?: string[]
 */

import * as React from 'react';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/lib/utils';

export interface SitemapGeneratorProps {
  defaultUrls?: string[];
  className?: string;
}

interface TreeNode {
  name: string;
  children: Map<string, TreeNode>;
}

function buildTree(urls: string[]): TreeNode {
  const root: TreeNode = { name: '/', children: new Map() };
  for (const raw of urls) {
    let path: string;
    try {
      path = new URL(raw).pathname;
    } catch {
      path = raw;
    }
    const segments = path.split('/').filter(Boolean);
    let node = root;
    for (const seg of segments) {
      if (!node.children.has(seg)) {
        node.children.set(seg, { name: seg, children: new Map() });
      }
      node = node.children.get(seg)!;
    }
  }
  return root;
}

function TreeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const children = Array.from(node.children.values());
  return (
    <ul className={cn(depth > 0 && 'ml-4 border-l border-border pl-3')}>
      <li className="py-0.5 font-mono text-sm">
        {depth === 0 ? '/' : node.name}
      </li>
      {children.map((c) => (
        <TreeView key={c.name} node={c} depth={depth + 1} />
      ))}
    </ul>
  );
}

export function SitemapGenerator({
  defaultUrls = [
    'https://example.com/',
    'https://example.com/about',
    'https://example.com/blog',
    'https://example.com/blog/hello-world',
    'https://example.com/pricing',
  ],
  className,
}: SitemapGeneratorProps) {
  const [text, setText] = React.useState(defaultUrls.join('\n'));

  const urls = text
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean);

  const tree = React.useMemo(() => buildTree(urls), [text]);

  const xml = React.useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    const body = urls
      .map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`)
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }, [text]);

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      <div className="space-y-3">
        <label className="text-sm font-medium">URLs (one per line)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="rounded-lg border bg-muted p-3">
          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
            Structure
          </p>
          <TreeView node={tree} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          sitemap.xml
        </p>
        <CodeBlock code={xml} language="xml" showLineNumbers />
      </div>
    </div>
  );
}
