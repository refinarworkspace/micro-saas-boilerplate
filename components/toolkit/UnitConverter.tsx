'use client';

/**
 * UnitConverter
 * -----------------------------------------------------------------------------
 * Generic unit converter. Ships with length / mass / temperature categories
 * and accepts custom factor-based categories via props.
 *
 * Usage:
 *   <UnitConverter />
 *   <UnitConverter categories={[{ id:'data', label:'Data', base:'B',
 *     units:[{id:'B',label:'Bytes',factor:1},{id:'KB',label:'KB',factor:1024}] }]} />
 *
 * Props:
 *   - categories?: Category[]   override the built-in categories
 *
 * Note: temperature is handled specially (non-linear) when a category id is
 * "temperature".
 */

import * as React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Unit {
  id: string;
  label: string;
  /** Multiplier relative to the category base unit. */
  factor: number;
}
export interface Category {
  id: string;
  label: string;
  units: Unit[];
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'mm', label: 'Millimeter', factor: 0.001 },
      { id: 'cm', label: 'Centimeter', factor: 0.01 },
      { id: 'm', label: 'Meter', factor: 1 },
      { id: 'km', label: 'Kilometer', factor: 1000 },
      { id: 'in', label: 'Inch', factor: 0.0254 },
      { id: 'ft', label: 'Foot', factor: 0.3048 },
      { id: 'mi', label: 'Mile', factor: 1609.344 },
    ],
  },
  {
    id: 'mass',
    label: 'Mass',
    units: [
      { id: 'mg', label: 'Milligram', factor: 0.001 },
      { id: 'g', label: 'Gram', factor: 1 },
      { id: 'kg', label: 'Kilogram', factor: 1000 },
      { id: 'oz', label: 'Ounce', factor: 28.3495 },
      { id: 'lb', label: 'Pound', factor: 453.592 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      { id: 'C', label: 'Celsius', factor: 1 },
      { id: 'F', label: 'Fahrenheit', factor: 1 },
      { id: 'K', label: 'Kelvin', factor: 1 },
    ],
  },
];

function convertTemperature(value: number, from: string, to: string): number {
  let c = value;
  if (from === 'F') c = (value - 32) * (5 / 9);
  else if (from === 'K') c = value - 273.15;
  if (to === 'C') return c;
  if (to === 'F') return c * (9 / 5) + 32;
  return c + 273.15; // K
}

export function UnitConverter({
  categories = DEFAULT_CATEGORIES,
  className,
}: {
  categories?: Category[];
  className?: string;
}) {
  const [catId, setCatId] = React.useState(categories[0].id);
  const category = categories.find((c) => c.id === catId) ?? categories[0];
  const [from, setFrom] = React.useState(category.units[0].id);
  const [to, setTo] = React.useState(category.units[1]?.id ?? category.units[0].id);
  const [value, setValue] = React.useState('1');

  React.useEffect(() => {
    setFrom(category.units[0].id);
    setTo(category.units[1]?.id ?? category.units[0].id);
  }, [category]);

  const num = parseFloat(value);
  let result = '';
  if (!Number.isNaN(num)) {
    if (category.id === 'temperature') {
      result = convertTemperature(num, from, to).toFixed(4).replace(/\.?0+$/, '');
    } else {
      const f = category.units.find((u) => u.id === from)!.factor;
      const t = category.units.find((u) => u.id === to)!.factor;
      result = ((num * f) / t).toPrecision(6).replace(/\.?0+$/, '');
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCatId(c.id)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition-colors',
              c.id === catId
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="Swap"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="mb-1 hidden h-10 w-10 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent sm:flex"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        <div className="space-y-1.5">
          <div className="flex h-10 items-center rounded-md border bg-muted px-3 font-mono text-sm">
            {result || '—'}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
