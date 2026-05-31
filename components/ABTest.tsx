'use client';

/**
 * ABTest
 * -----------------------------------------------------------------------------
 * Renders one of two variants based on the visitor's persistent assignment and
 * automatically tracks an "exposure" event. Pair with `trackConversion` from
 * `@/lib/ab-testing` when the user completes the goal.
 *
 * Usage:
 *   <ABTest
 *     experiment="homepage_hero"
 *     a={<HeadlineA />}
 *     b={<HeadlineB />}
 *   />
 *
 *   // elsewhere, on conversion:
 *   import { trackConversion } from '@/lib/ab-testing';
 *   trackConversion('homepage_hero');
 *
 * Props:
 *   - experiment: string
 *   - a / b: React.ReactNode
 *   - weights?: [number, number]   relative split (default 50/50)
 *   - onAssigned?: (variant) => void
 */

import * as React from 'react';
import { assignVariant, trackEvent, type Variant } from '@/lib/ab-testing';

export interface ABTestProps {
  experiment: string;
  a: React.ReactNode;
  b: React.ReactNode;
  weights?: [number, number];
  onAssigned?: (variant: Variant) => void;
}

export function ABTest({ experiment, a, b, weights, onAssigned }: ABTestProps) {
  const [variant, setVariant] = React.useState<Variant | null>(null);

  React.useEffect(() => {
    const assigned = assignVariant(experiment, ['A', 'B'], weights);
    setVariant(assigned);
    onAssigned?.(assigned);
    // Record the exposure once per mount.
    trackEvent(experiment, 'exposure', assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment]);

  // Avoid hydration mismatch: render nothing until the variant is resolved.
  if (variant === null) {
    return <span aria-hidden className="contents" />;
  }
  return <>{variant === 'A' ? a : b}</>;
}
