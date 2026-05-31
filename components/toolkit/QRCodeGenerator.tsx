'use client';

/**
 * QRCodeGenerator
 * -----------------------------------------------------------------------------
 * Generate a QR code from any text/URL using the `qrcode` library and download
 * it as a PNG. Error-correction level and size are configurable.
 *
 * Usage:
 *   <QRCodeGenerator defaultValue="https://example.com" size={240} />
 *
 * Props:
 *   - defaultValue?: string
 *   - size?: number (px, default 240)
 */

import * as React from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { downloadFile, cn } from '@/lib/utils';

export interface QRCodeGeneratorProps {
  defaultValue?: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({
  defaultValue = 'https://example.com',
  size = 240,
  className,
}: QRCodeGeneratorProps) {
  const [text, setText] = React.useState(defaultValue);
  const [dataUrl, setDataUrl] = React.useState<string>('');
  const [level, setLevel] = React.useState<'L' | 'M' | 'Q' | 'H'>('M');

  React.useEffect(() => {
    let active = true;
    if (!text) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(text, {
      errorCorrectionLevel: level,
      width: size,
      margin: 2,
    })
      .then((url) => active && setDataUrl(url))
      .catch(() => active && setDataUrl(''));
    return () => {
      active = false;
    };
  }, [text, level, size]);

  return (
    <div className={cn('space-y-4', className)}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Enter text or a URL…"
        className="w-full rounded-lg border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Error correction</span>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof level)}
          className="h-9 rounded-md border border-input bg-background px-2"
        >
          <option value="L">L (7%)</option>
          <option value="M">M (15%)</option>
          <option value="Q">Q (25%)</option>
          <option value="H">H (30%)</option>
        </select>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border bg-white p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="QR code" width={size} height={size} />
          ) : (
            <div
              className="flex items-center justify-center text-sm text-muted-foreground"
              style={{ width: size, height: size }}
            >
              —
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={!dataUrl}
          onClick={() => downloadFile(dataUrl, 'qrcode.png')}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}
