'use client';

/**
 * IpLookup
 * -----------------------------------------------------------------------------
 * Look up geolocation / network information for an IP address (or the visitor's
 * own IP when left blank) using a public JSON API. The API base is
 * configurable so you can swap providers or proxy through your own backend.
 *
 * Usage:
 *   <IpLookup />
 *   <IpLookup apiBase="https://ipapi.co" />
 *
 * Props:
 *   - apiBase?: string   default "https://ipapi.co"  (expects `${base}/${ip}/json/`)
 */

import * as React from 'react';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IpLookupProps {
  apiBase?: string;
  className?: string;
}

interface IpInfo {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
}

export function IpLookup({ apiBase = 'https://ipapi.co', className }: IpLookupProps) {
  const [ip, setIp] = React.useState('');
  const [info, setInfo] = React.useState<IpInfo | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function lookup() {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const target = ip.trim() ? `${apiBase}/${ip.trim()}/json/` : `${apiBase}/json/`;
      const res = await fetch(target);
      const data: IpInfo = await res.json();
      if (data.error) {
        setError(data.reason ?? 'Lookup failed');
      } else {
        setInfo(data);
      }
    } catch {
      setError('Network error (the API may be rate-limited or blocked).');
    } finally {
      setLoading(false);
    }
  }

  const rows: { label: string; value?: string | number }[] = info
    ? [
        { label: 'IP', value: info.ip },
        { label: 'City', value: info.city },
        { label: 'Region', value: info.region },
        { label: 'Country', value: info.country_name },
        { label: 'Org', value: info.org },
        { label: 'ASN', value: info.asn },
        { label: 'Timezone', value: info.timezone },
        {
          label: 'Coords',
          value:
            info.latitude != null && info.longitude != null
              ? `${info.latitude}, ${info.longitude}`
              : undefined,
        },
      ]
    : [];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Leave blank for your own IP…"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={lookup}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Lookup
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {info && (
        <dl className="overflow-hidden rounded-lg border text-sm">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={cn(
                'flex items-center justify-between gap-4 px-3 py-2',
                i % 2 === 0 ? 'bg-muted/40' : ''
              )}
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="truncate font-mono">{r.value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
