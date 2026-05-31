'use client';

/**
 * DragDropUpload
 * -----------------------------------------------------------------------------
 * Drag-and-drop (or click) file upload with per-file read progress and image
 * previews. Fully client-side — files are never uploaded anywhere by default.
 *
 * Usage:
 *   <DragDropUpload
 *     accept="image/*"
 *     multiple
 *     maxSizeMb={10}
 *     onFiles={(files) => console.log(files)}
 *   />
 *
 * Props:
 *   - onFiles: (files: File[]) => void   callback with accepted files
 *   - accept?: string                    input accept filter (default "*")
 *   - multiple?: boolean                 allow multiple files (default false)
 *   - maxSizeMb?: number                 reject files larger than this
 *   - showPreview?: boolean              show image thumbnails (default true)
 */

import * as React from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

export interface DragDropUploadProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  showPreview?: boolean;
  className?: string;
}

interface Item {
  file: File;
  preview?: string;
  progress: number;
  error?: string;
}

export function DragDropUpload({
  onFiles,
  accept = '*',
  multiple = false,
  maxSizeMb,
  showPreview = true,
  className,
}: DragDropUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);

  function readWithProgress(file: File): Promise<Item> {
    return new Promise((resolve) => {
      const item: Item = { file, progress: 0 };
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        resolve({ ...item, error: `> ${maxSizeMb}MB`, progress: 100 });
        return;
      }
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          item.progress = Math.round((e.loaded / e.total) * 100);
          setItems((prev) => prev.map((it) => (it.file === file ? { ...item } : it)));
        }
      };
      reader.onloadend = () => {
        item.progress = 100;
        if (showPreview && file.type.startsWith('image/')) {
          item.preview = reader.result as string;
        }
        resolve({ ...item });
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList).slice(0, multiple ? undefined : 1);
    const placeholders = incoming.map((f) => ({ file: f, progress: 0 }));
    setItems(multiple ? (prev) => [...prev, ...placeholders] : placeholders);

    const processed = await Promise.all(incoming.map(readWithProgress));
    setItems((prev) => {
      const map = new Map(prev.map((it) => [it.file, it]));
      processed.forEach((it) => map.set(it.file, it));
      return Array.from(map.values());
    });
    onFiles?.(processed.filter((it) => !it.error).map((it) => it.file));
  }

  function removeItem(file: File) {
    setItems((prev) => prev.filter((it) => it.file !== file));
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background/50 px-6 py-10 text-center transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          dragging && 'border-primary bg-accent/60'
        )}
      >
        <UploadCloud className="h-7 w-7 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Drag &amp; drop or click to upload
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li
              key={it.file.name + it.file.size}
              className="flex items-center gap-3 rounded-lg border bg-card p-2"
            >
              {it.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.preview}
                  alt={it.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs uppercase text-muted-foreground">
                  {it.file.name.split('.').pop()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {it.error ? (
                    <span className="text-destructive">{it.error}</span>
                  ) : (
                    formatBytes(it.file.size)
                  )}
                </p>
                {!it.error && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Remove"
                onClick={() => removeItem(it.file)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
