'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-xl border bg-card">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-accent/40"
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'grid overflow-hidden px-5 text-sm text-muted-foreground transition-all duration-300',
                isOpen
                  ? 'grid-rows-[1fr] pb-5 opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="min-h-0">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
