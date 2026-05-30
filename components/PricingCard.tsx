'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popularLabel?: string;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelect?: (id: string) => void;
  loading?: boolean;
}

export function PricingCard({ tier, onSelect, loading }: PricingCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col',
        tier.highlighted &&
          'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary'
      )}
    >
      {tier.highlighted && tier.popularLabel && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
          {tier.popularLabel}
        </span>
      )}

      <CardHeader>
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-bold tracking-tight">
            {tier.price}
          </span>
          <span className="mb-1 text-sm text-muted-foreground">
            {tier.period}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={tier.highlighted ? 'default' : 'outline'}
          disabled={loading}
          onClick={() => onSelect?.(tier.id)}
        >
          {tier.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
