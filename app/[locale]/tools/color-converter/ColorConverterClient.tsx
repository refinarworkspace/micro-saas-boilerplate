'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { copyToClipboard } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Color math                                                          */
/* ------------------------------------------------------------------ */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.trim().replace(/^#/, '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rr:
        h = ((gg - bb) / d) % 6;
        break;
      case gg:
        h = (bb - rr) / d + 2;
        break;
      default:
        h = (rr - gg) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ll - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: clampByte((r + m) * 255),
    g: clampByte((g + m) * 255),
    b: clampByte((b + m) * 255),
  };
}

function parseRgb(str: string): RGB | null {
  const nums = str.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length < 3) return null;
  const [r, g, b] = nums.slice(0, 3).map(Number);
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return { r, g, b };
}

function parseHsl(str: string): HSL | null {
  const nums = str.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length < 3) return null;
  const [h, s, l] = nums.slice(0, 3).map(Number);
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return { h, s, l };
}

const formatRgb = ({ r, g, b }: RGB) => `${r}, ${g}, ${b}`;
const formatHsl = ({ h, s, l }: HSL) => `${h}, ${s}%, ${l}%`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const INITIAL: RGB = { r: 99, g: 102, b: 241 }; // indigo-500

export function ColorConverterClient() {
  const t = useTranslations('Tools.colorConverter');

  const [hex, setHex] = React.useState(rgbToHex(INITIAL));
  const [rgb, setRgb] = React.useState(formatRgb(INITIAL));
  const [hsl, setHsl] = React.useState(formatHsl(rgbToHsl(INITIAL)));
  const [swatch, setSwatch] = React.useState(rgbToHex(INITIAL));
  const [errors, setErrors] = React.useState({
    hex: false,
    rgb: false,
    hsl: false,
  });

  function syncFrom(source: 'hex' | 'rgb' | 'hsl', rgbValue: RGB) {
    const nextHex = rgbToHex(rgbValue);
    const nextHsl = rgbToHsl(rgbValue);
    setSwatch(nextHex);
    if (source !== 'hex') setHex(nextHex);
    if (source !== 'rgb') setRgb(formatRgb(rgbValue));
    if (source !== 'hsl') setHsl(formatHsl(nextHsl));
  }

  function onHexChange(v: string) {
    setHex(v);
    const parsed = hexToRgb(v);
    setErrors((e) => ({ ...e, hex: !parsed }));
    if (parsed) syncFrom('hex', parsed);
  }

  function onRgbChange(v: string) {
    setRgb(v);
    const parsed = parseRgb(v);
    setErrors((e) => ({ ...e, rgb: !parsed }));
    if (parsed) syncFrom('rgb', parsed);
  }

  function onHslChange(v: string) {
    setHsl(v);
    const parsed = parseHsl(v);
    setErrors((e) => ({ ...e, hsl: !parsed }));
    if (parsed) syncFrom('hsl', hslToRgb(parsed));
  }

  function onPick(v: string) {
    const parsed = hexToRgb(v);
    if (parsed) {
      setHex(rgbToHex(parsed));
      setErrors({ hex: false, rgb: false, hsl: false });
      syncFrom('hex', parsed);
    }
  }

  const fields = [
    {
      id: 'hex',
      label: t('hex'),
      value: hex,
      onChange: onHexChange,
      error: errors.hex,
      copyValue: hex,
    },
    {
      id: 'rgb',
      label: t('rgb'),
      value: rgb,
      onChange: onRgbChange,
      error: errors.rgb,
      copyValue: `rgb(${rgb})`,
    },
    {
      id: 'hsl',
      label: t('hsl'),
      value: hsl,
      onChange: onHslChange,
      error: errors.hsl,
      copyValue: `hsl(${hsl})`,
    },
  ];

  const config = (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Label htmlFor="picker">{t('pick')}</Label>
        <input
          id="picker"
          type="color"
          value={swatch}
          onChange={(e) => onPick(e.target.value)}
          className="h-10 w-16 cursor-pointer rounded-md border bg-background p-1"
        />
      </div>

      {fields.map((field) => (
        <ColorField key={field.id} field={field} invalidLabel={t('invalid')} />
      ))}
    </div>
  );

  const result = (
    <div className="flex h-full flex-col gap-4">
      <span className="text-sm font-medium">{t('preview')}</span>
      <div
        className="flex flex-1 items-end justify-start rounded-xl border p-4 shadow-inner transition-colors"
        style={{ backgroundColor: swatch }}
      >
        <span className="rounded-md bg-black/40 px-2 py-1 font-mono text-sm text-white">
          {swatch}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-lg border bg-background p-2">
          <p className="uppercase text-muted-foreground">HEX</p>
          <p className="mt-1 font-mono">{hex}</p>
        </div>
        <div className="rounded-lg border bg-background p-2">
          <p className="uppercase text-muted-foreground">RGB</p>
          <p className="mt-1 font-mono">{rgb}</p>
        </div>
        <div className="rounded-lg border bg-background p-2">
          <p className="uppercase text-muted-foreground">HSL</p>
          <p className="mt-1 font-mono">{hsl}</p>
        </div>
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

function ColorField({
  field,
  invalidLabel,
}: {
  field: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    error: boolean;
    copyValue: string;
  };
  invalidLabel: string;
}) {
  const tc = useTranslations('Common');
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    const ok = await copyToClipboard(field.copyValue);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>{field.label}</Label>
      <div className="flex gap-2">
        <Input
          id={field.id}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          spellCheck={false}
          className={`font-mono ${field.error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label={tc('copy')}
          onClick={copy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {field.error && (
        <p className="text-xs text-destructive">{invalidLabel}</p>
      )}
    </div>
  );
}
