'use client';

/**
 * PasswordStrengthMeter
 * -----------------------------------------------------------------------------
 * Visual password strength indicator with a heuristic score (length + char
 * classes + variety) and actionable suggestions. Can be controlled or manage
 * its own input.
 *
 * Usage:
 *   <PasswordStrengthMeter />                        // self-contained input
 *   <PasswordStrengthMeter value={pw} showInput={false} />  // external value
 *
 * Props:
 *   - value?: string            controlled password value
 *   - showInput?: boolean       render the input field (default true)
 *   - onChange?: (v) => void
 */

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordStrengthMeterProps {
  value?: string;
  showInput?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  suggestions: string[];
}

function evaluate(pw: string): Strength {
  const suggestions: string[] = [];
  if (!pw) return { score: 0, label: 'Empty', suggestions: ['Enter a password'] };

  let score = 0;
  if (pw.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  else suggestions.push('Mix upper and lower case');
  if (/\d/.test(pw)) score++;
  else suggestions.push('Add a number');
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  else suggestions.push('Add a symbol');

  const clamped = Math.min(4, score) as Strength['score'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: clamped, label: labels[clamped], suggestions };
}

const BAR_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-600',
];

export function PasswordStrengthMeter({
  value,
  showInput = true,
  onChange,
  className,
}: PasswordStrengthMeterProps) {
  const [internal, setInternal] = React.useState('');
  const [reveal, setReveal] = React.useState(false);
  const pw = value ?? internal;
  const strength = evaluate(pw);

  function update(v: string) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  }

  return (
    <div className={cn('space-y-3', className)}>
      {showInput && (
        <div className="relative">
          <input
            type={reveal ? 'text' : 'password'}
            value={pw}
            onChange={(e) => update(e.target.value)}
            placeholder="Enter a password…"
            className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}

      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < strength.score ? BAR_COLORS[strength.score] : 'bg-muted'
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Strength</span>
        <span className="font-medium">{strength.label}</span>
      </div>

      {strength.suggestions.length > 0 && pw && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {strength.suggestions.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
