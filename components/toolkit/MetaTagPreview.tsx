'use client';

/**
 * MetaTagPreview
 * -----------------------------------------------------------------------------
 * Preview how a page's Open Graph / Twitter card metadata will look when
 * shared, and edit the values live. Also outputs the corresponding meta tags.
 *
 * Usage:
 *   <MetaTagPreview
 *     defaultTitle="My page"
 *     defaultDescription="A great page"
 *     defaultUrl="https://example.com"
 *     defaultImage="/og-image.svg"
 *   />
 */

import * as React from 'react';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/lib/utils';

export interface MetaTagPreviewProps {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultUrl?: string;
  defaultImage?: string;
  className?: string;
}

export function MetaTagPreview({
  defaultTitle = 'MicroSaaS — Build & Launch in Hours',
  defaultDescription = 'A production-ready boilerplate with everything you need to ship fast.',
  defaultUrl = 'https://example.com',
  defaultImage = '',
  className,
}: MetaTagPreviewProps) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [description, setDescription] = React.useState(defaultDescription);
  const [url, setUrl] = React.useState(defaultUrl);
  const [image, setImage] = React.useState(defaultImage);

  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    /* keep raw */
  }

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    image ? `<meta property="og:image" content="${image}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {/* Editors */}
      <div className="space-y-3">
        <Field label="Title" value={title} onChange={setTitle} />
        <Field label="Description" value={description} onChange={setDescription} textarea />
        <Field label="URL" value={url} onChange={setUrl} />
        <Field label="Image URL" value={image} onChange={setImage} />
      </div>

      {/* Preview + tags */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Preview</p>
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="aspect-[1.91/1] w-full bg-muted">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  1200 × 630
                </div>
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="text-xs uppercase text-muted-foreground">{host}</p>
              <p className="line-clamp-1 font-semibold">{title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Meta tags</p>
          <CodeBlock code={tags} language="html" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
    </label>
  );
}
