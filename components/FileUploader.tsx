'use client';

import * as React from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFile: (file: File) => void;
  accept?: string;
  hint?: string;
  className?: string;
}

/**
 * Accessible drag-and-drop file picker used by tool pages (e.g. the image
 * compressor). Clicking or pressing Enter opens the native file dialog.
 */
export function FileUploader({
  onFile,
  accept = 'image/*',
  hint,
  className,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) {
      onFile(files[0]);
    }
  }

  return (
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
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-input bg-background/50 px-6 py-12 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        dragging && 'border-primary bg-accent/60',
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="h-6 w-6" />
      </span>
      {hint && (
        <p className="text-sm font-medium text-muted-foreground">{hint}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
