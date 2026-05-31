'use client';

/**
 * ColorPicker
 * -----------------------------------------------------------------------------
 * Full color picker: native swatch + RGB sliders, with synced HEX / RGB / HSL
 * outputs and copy buttons.
 *
 * Usage:
 *   <ColorPicker value="#4f46e5" onChange={(hex) => setColor(hex)} />
 *
 * Props:
 *   - value?: string            controlled hex value
 *   - defaultValue?: string     uncontrolled initial hex (default "#4f46e5")
 *   - onChange?: (hex) => void
 */

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard, cn } from '@/lib/utils';

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  className?: string;
}

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  return {
    r: parseInt(c.slice(0, 2), 16) || 0,
    g: parseInt(c.slice(2, 4), 16) || 0,
    b: parseInt(c.slice(4, 6), 16) || 0,
  };
}
function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPicker({
  value,
  defaultValue = '#4F46E5',
  onChange,
  className,
}: ColorPickerProps) {
  const [internal, setInternal] = React.useState(value ?? defaultValue);
  const hex = (value ?? internal).toUpperCase();
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const [copied, setCopied] = React.useState<string | null>(null);

  function update(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }
  function setChannel(channel: 'r' | 'g' | 'b', v: number) {
    const rgb = { r, g, b, [channel]: v };
    update(rgbToHex(rgb.r, rgb.g, rgb.b));
  }
  async function copy(text: string, key: string) {
    if (await copyToClipboard(text)) {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    }
  }

  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-lg border shadow-inner"
          style={{ backgroundColor: hex }}
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => update(e.target.value.toUpperCase())}
          className="h-10 w-14 cursor-pointer rounded-md border bg-background p-1"
          aria-label="Pick a color"
        />
      </div>

      {/* RGB sliders */}
      <div className="space-y-2">
        {(['r', 'g', 'b'] as const).map((ch) => (
          <div key={ch} className="flex items-center gap-3">
            <span className="w-4 text-xs font-medium uppercase text-muted-foreground">
              {ch}
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={{ r, g, b }[ch]}
              onChange={(e) => setChannel(ch, Number(e.target.value))}
              className="h-2 flex-1 accent-primary"
            />
            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
              {{ r, g, b }[ch]}
            </span>
          </div>
        ))}
      </div>

      {/* Outputs */}
      <div className="space-y-2">
        {[
          { label: 'HEX', val: hex },
          { label: 'RGB', val: rgbStr },
          { label: 'HSL', val: hslStr },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-10 text-xs font-medium text-muted-foreground">
              {row.label}
            </span>
            <code className="flex-1 rounded-md border bg-muted px-2 py-1 text-sm">
              {row.val}
            </code>
            <button
              type="button"
              aria-label={`Copy ${row.label}`}
              onClick={() => copy(row.val, row.label)}
              className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {copied === row.label ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
