'use client';

/**
 * StopwatchTimer
 * -----------------------------------------------------------------------------
 * Combined stopwatch (with laps) and countdown timer. Switch modes with the
 * tabs. Uses requestAnimationFrame-free interval ticking for simplicity.
 *
 * Usage:
 *   <StopwatchTimer defaultMode="stopwatch" />
 *
 * Props:
 *   - defaultMode?: 'stopwatch' | 'timer'
 */

import * as React from 'react';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StopwatchTimerProps {
  defaultMode?: 'stopwatch' | 'timer';
  className?: string;
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function StopwatchTimer({
  defaultMode = 'stopwatch',
  className,
}: StopwatchTimerProps) {
  const [mode, setMode] = React.useState(defaultMode);
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [laps, setLaps] = React.useState<number[]>([]);
  const [timerInput, setTimerInput] = React.useState({ m: 1, s: 0 });
  const [remaining, setRemaining] = React.useState(60000);

  const last = React.useRef<number>(0);

  React.useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - last.current;
      last.current = now;
      if (mode === 'stopwatch') {
        setElapsed((e) => e + delta);
      } else {
        setRemaining((r) => {
          const next = r - delta;
          if (next <= 0) {
            setRunning(false);
            return 0;
          }
          return next;
        });
      }
    }, 30);
    return () => clearInterval(interval);
  }, [running, mode]);

  function reset() {
    setRunning(false);
    if (mode === 'stopwatch') {
      setElapsed(0);
      setLaps([]);
    } else {
      setRemaining((timerInput.m * 60 + timerInput.s) * 1000);
    }
  }

  function switchMode(m: 'stopwatch' | 'timer') {
    setRunning(false);
    setMode(m);
  }

  const display = mode === 'stopwatch' ? elapsed : remaining;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="inline-flex rounded-md border p-0.5 text-sm">
        {(['stopwatch', 'timer'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'rounded px-3 py-1 capitalize transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'timer' && !running && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            min={0}
            value={timerInput.m}
            onChange={(e) => {
              const m = Number(e.target.value);
              setTimerInput((t) => ({ ...t, m }));
              setRemaining((m * 60 + timerInput.s) * 1000);
            }}
            className="h-9 w-16 rounded-md border border-input bg-background px-2"
          />
          <span className="text-muted-foreground">min</span>
          <input
            type="number"
            min={0}
            max={59}
            value={timerInput.s}
            onChange={(e) => {
              const s = Number(e.target.value);
              setTimerInput((t) => ({ ...t, s }));
              setRemaining((timerInput.m * 60 + s) * 1000);
            }}
            className="h-9 w-16 rounded-md border border-input bg-background px-2"
          />
          <span className="text-muted-foreground">sec</span>
        </div>
      )}

      <div className="rounded-xl border bg-muted py-8 text-center font-mono text-5xl font-bold tabular-nums">
        {fmt(display)}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={mode === 'timer' && remaining <= 0}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? 'Pause' : 'Start'}
        </button>
        {mode === 'stopwatch' && (
          <button
            type="button"
            onClick={() => setLaps((l) => [...l, elapsed])}
            disabled={!running}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Flag className="h-4 w-4" /> Lap
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {laps.length > 0 && (
        <ul className="space-y-1 text-sm">
          {laps.map((lap, i) => (
            <li
              key={i}
              className="flex justify-between rounded-md border px-3 py-1.5 font-mono"
            >
              <span className="text-muted-foreground">Lap {i + 1}</span>
              <span>{fmt(lap)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
