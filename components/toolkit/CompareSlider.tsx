'use client';

/**
 * CompareSlider
 * -----------------------------------------------------------------------------
 * Before/after image comparison with a draggable divider.
 *
 * Usage:
 *   <CompareSlider
 *     before="/before.jpg"
 *     after="/after.jpg"
 *     beforeLabel="Original"
 *     afterLabel="Compressed"
 *   />
 *
 * Props:
 *   - before / after: string (image URLs)
 *   - beforeLabel? / afterLabel?: string
 *   - initial?: number (0-100 starting divider position)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CompareSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  initial?: number;
  className?: string;
}

export function CompareSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initial = 50,
  className,
}: CompareSliderProps) {
  const [pos, setPos] = React.useState(initial);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  React.useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current) return;
      const clientX =
        'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      if (clientX != null) updateFromClientX(clientX);
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video w-full select-none overflow-hidden rounded-xl border bg-muted',
        className
      )}
    >
      {/* After (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt={afterLabel}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {afterLabel}
      </span>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt={beforeLabel}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: containerRef.current?.clientWidth ?? '100%' }}
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow"
        style={{ left: `${pos}%` }}
      >
        <button
          type="button"
          aria-label="Drag to compare"
          onMouseDown={() => (dragging.current = true)}
          onTouchStart={() => (dragging.current = true)}
          className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-black shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>

      {/* Accessible range fallback */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparison position"
        className="absolute bottom-2 left-1/2 z-20 w-2/3 -translate-x-1/2 opacity-0"
      />
    </div>
  );
}
