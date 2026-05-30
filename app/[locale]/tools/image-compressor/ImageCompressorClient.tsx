'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Download, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadFile, formatBytes } from '@/lib/utils';

interface CompressedResult {
  url: string;
  size: number;
  blob: Blob;
}

export function ImageCompressorClient() {
  const t = useTranslations('Tools.imageCompressor');

  const [fileName, setFileName] = React.useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = React.useState<string | null>(null);
  const [originalSize, setOriginalSize] = React.useState(0);
  const [quality, setQuality] = React.useState(70);
  const [result, setResult] = React.useState<CompressedResult | null>(null);
  const [busy, setBusy] = React.useState(false);

  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const debouncedQuality = useDebounce(quality, 250);

  function handleFile(file: File) {
    setOriginalSize(file.size);
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setOriginalUrl(url);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        compress(img, quality);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  const compress = React.useCallback((img: HTMLImageElement, q: number) => {
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setResult((prev) => {
            if (prev) URL.revokeObjectURL(prev.url);
            return {
              blob,
              size: blob.size,
              url: URL.createObjectURL(blob),
            };
          });
        }
        setBusy(false);
      },
      'image/jpeg',
      q / 100
    );
  }, []);

  // Re-compress whenever the (debounced) quality changes.
  React.useEffect(() => {
    if (imageRef.current) {
      compress(imageRef.current, debouncedQuality);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuality]);

  function reset() {
    if (originalUrl) setOriginalUrl(null);
    if (result) URL.revokeObjectURL(result.url);
    imageRef.current = null;
    setResult(null);
    setFileName(null);
    setOriginalSize(0);
  }

  const savedPct =
    result && originalSize > 0
      ? Math.max(0, Math.round((1 - result.size / originalSize) * 100))
      : 0;

  const config = (
    <div className="space-y-6">
      {!originalUrl ? (
        <FileUploader onFile={handleFile} hint={t('dropHint')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="original"
              className="mx-auto max-h-64 w-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">{t('quality')}</Label>
              <span className="text-sm font-medium text-muted-foreground">
                {quality}%
              </span>
            </div>
            <input
              id="quality"
              type="range"
              min={10}
              max={100}
              step={1}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
          </div>

          <Button variant="outline" onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4" />
            {t('reset')}
          </Button>
        </>
      )}
    </div>
  );

  const resultNode = !result ? (
    <div className="flex h-full min-h-[16rem] items-center justify-center text-center text-sm text-muted-foreground">
      {t('noFile')}
    </div>
  ) : (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.url}
          alt="compressed"
          className="mx-auto max-h-64 w-auto object-contain"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label={t('original')} value={formatBytes(originalSize)} />
        <Stat label={t('compressed')} value={formatBytes(result.size)} />
        <Stat label={t('saved')} value={`${savedPct}%`} highlight />
      </div>

      <Button
        className="w-full"
        disabled={busy}
        onClick={() =>
          downloadFile(result.blob, `${fileName ?? 'image'}-compressed.jpg`)
        }
      >
        <Download className="h-4 w-4" />
        {t('downloadCompressed')}
      </Button>
    </div>
  );

  return (
    <ToolLayout
      title={t('title')}
      description={t('description')}
      config={config}
      result={resultNode}
    />
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${
          highlight ? 'text-primary' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
