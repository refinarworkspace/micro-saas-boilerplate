import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { PLAN_AMOUNTS, type PlanId } from './stripe';

/**
 * -----------------------------------------------------------------------------
 * Supabase admin client (service_role) for server-side DB operations.
 * -----------------------------------------------------------------------------
 * NEVER import this into client components — it uses the service-role key which
 * bypasses Row Level Security. When the project is not configured it returns
 * `null` and the helpers below fall back to representative demo data so the
 * dashboard/admin UIs remain explorable.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isDbConfigured = Boolean(
  supabaseUrl &&
    serviceRoleKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !serviceRoleKey.includes('your-service-role')
);

let cachedAdmin: SupabaseClient | null = null;

/** Returns a singleton service-role client, or `null` in demo mode. */
export function getAdminClient(): SupabaseClient | null {
  if (!isDbConfigured) return null;
  if (!cachedAdmin) {
    cachedAdmin = createSupabaseClient(supabaseUrl!, serviceRoleKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanId | 'free';
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
  role: 'user' | 'admin';
  plan: PlanId | 'free';
  status: SubscriptionStatus | 'none';
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  totalRevenue: number;
  byPlan: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/* Demo dataset (used only when the DB is not configured)                     */
/* -------------------------------------------------------------------------- */

const DEMO_USERS: AppUser[] = [
  { id: 'usr_demo_admin', email: 'admin@example.com', created_at: '2025-01-04T10:00:00Z', role: 'admin', plan: 'business', status: 'active' },
  { id: 'usr_demo_1', email: 'ada@example.com', created_at: '2025-02-12T08:30:00Z', role: 'user', plan: 'pro', status: 'active' },
  { id: 'usr_demo_2', email: 'grace@example.com', created_at: '2025-03-01T14:15:00Z', role: 'user', plan: 'pro', status: 'past_due' },
  { id: 'usr_demo_3', email: 'linus@example.com', created_at: '2025-03-22T19:05:00Z', role: 'user', plan: 'free', status: 'none' },
  { id: 'usr_demo_4', email: 'margaret@example.com', created_at: '2025-04-09T11:45:00Z', role: 'user', plan: 'business', status: 'active' },
  { id: 'usr_demo_5', email: 'dennis@example.com', created_at: '2025-04-28T07:20:00Z', role: 'user', plan: 'free', status: 'canceled' },
  { id: 'usr_demo_6', email: 'katherine@example.com', created_at: '2025-05-15T16:00:00Z', role: 'user', plan: 'pro', status: 'trialing' },
];

function demoSubscriptions(): SubscriptionRecord[] {
  return DEMO_USERS.filter((u) => u.plan !== 'free').map((u, i) => ({
    id: `sub_demo_${i}`,
    user_id: u.id,
    stripe_customer_id: `cus_demo_${i}`,
    stripe_subscription_id: `sub_stripe_demo_${i}`,
    plan: u.plan as PlanId,
    status: u.status as SubscriptionStatus,
    current_period_end: '2026-06-30T00:00:00Z',
    created_at: u.created_at,
    updated_at: u.created_at,
  }));
}

/* -------------------------------------------------------------------------- */
/* Subscription helpers                                                       */
/* -------------------------------------------------------------------------- */

export async function getSubscriptionByUserId(
  userId: string
): Promise<SubscriptionRecord | null> {
  const admin = getAdminClient();
  if (!admin) {
    return demoSubscriptions().find((s) => s.user_id === userId) ?? null;
  }
  const { data, error } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[db] getSubscriptionByUserId', error.message);
    return null;
  }
  return (data as SubscriptionRecord) ?? null;
}

/**
 * Insert or update a subscription row keyed by `user_id`. Called from the
 * Stripe webhook on checkout/subscription events.
 */
export async function upsertSubscription(
  record: Partial<SubscriptionRecord> & { user_id: string }
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.info('[db demo] upsertSubscription', record);
    return;
  }
  const { error } = await admin
    .from('subscriptions')
    .upsert(
      { ...record, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) throw new Error(`upsertSubscription failed: ${error.message}`);
}

/** Update a subscription identified by its Stripe subscription id. */
export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  patch: Partial<SubscriptionRecord>
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.info('[db demo] updateSubscriptionByStripeId', stripeSubscriptionId, patch);
    return;
  }
  const { error } = await admin
    .from('subscriptions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', stripeSubscriptionId);
  if (error) throw new Error(`updateSubscriptionByStripeId failed: ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* Admin helpers                                                              */
/* -------------------------------------------------------------------------- */

export interface ListUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface ListUsersResult {
  users: AppUser[];
  total: number;
  page: number;
  perPage: number;
}

export async function listUsers({
  page = 1,
  perPage = 10,
  search = '',
}: ListUsersParams): Promise<ListUsersResult> {
  const admin = getAdminClient();

  if (!admin) {
    const filtered = DEMO_USERS.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    const start = (page - 1) * perPage;
    return {
      users: filtered.slice(start, start + perPage),
      total: filtered.length,
      page,
      perPage,
    };
  }

  // Pull auth users (paginated) and join with the subscriptions table.
  const { data: authData, error } = await admin.auth.admin.listUsers({
    page,
    perPage,
  });
  if (error) throw new Error(`listUsers failed: ${error.message}`);

  const ids = authData.users.map((u) => u.id);
  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id, plan, status')
    .in('user_id', ids.length ? ids : ['__none__']);

  const subByUser = new Map(
    (subs ?? []).map((s: any) => [s.user_id, s])
  );

  const users: AppUser[] = authData.users.map((u) => {
    const sub = subByUser.get(u.id);
    return {
      id: u.id,
      email: u.email ?? '(no email)',
      created_at: u.created_at,
      role:
        (u.app_metadata?.role as 'admin' | 'user') ??
        (u.user_metadata?.role as 'admin' | 'user') ??
        'user',
      plan: (sub?.plan as PlanId) ?? 'free',
      status: (sub?.status as SubscriptionStatus) ?? 'none',
    };
  });

  return {
    users,
    total: (authData as any).total ?? users.length,
    page,
    perPage,
  };
}

export async function listSubscriptions(
  statusFilter?: string
): Promise<SubscriptionRecord[]> {
  const admin = getAdminClient();
  if (!admin) {
    const all = demoSubscriptions();
    return statusFilter && statusFilter !== 'all'
      ? all.filter((s) => s.status === statusFilter)
      : all;
  }
  let query = admin.from('subscriptions').select('*').order('created_at', {
    ascending: false,
  });
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  const { data, error } = await query;
  if (error) throw new Error(`listSubscriptions failed: ${error.message}`);
  return (data as SubscriptionRecord[]) ?? [];
}

export async function getAdminStats(): Promise<AdminStats> {
  const admin = getAdminClient();

  if (!admin) {
    const subs = demoSubscriptions();
    return computeStats(DEMO_USERS.length, subs);
  }

  const [{ count: userCount }, { data: subs }] = await Promise.all([
    admin.from('subscriptions').select('id', { count: 'exact', head: true }),
    admin.from('subscriptions').select('plan, status'),
  ]);

  // Total users comes from auth; fall back to subscription count if unavailable.
  let totalUsers = userCount ?? 0;
  try {
    const { data: authData } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    totalUsers = (authData as any)?.total ?? totalUsers;
  } catch {
    /* ignore */
  }

  return computeStats(totalUsers, (subs as SubscriptionRecord[]) ?? []);
}

function computeStats(
  totalUsers: number,
  subs: Pick<SubscriptionRecord, 'plan' | 'status'>[]
): AdminStats {
  const active = subs.filter(
    (s) => s.status === 'active' || s.status === 'trialing'
  );
  const byPlan: Record<string, number> = {};
  let mrr = 0;
  for (const s of active) {
    byPlan[s.plan] = (byPlan[s.plan] ?? 0) + 1;
    mrr += PLAN_AMOUNTS[s.plan as PlanId] ?? 0;
  }
  return {
    totalUsers,
    activeSubscriptions: active.length,
    mrr,
    // Simple lifetime estimate: 6x MRR (replace with real invoice data).
    totalRevenue: mrr * 6,
    byPlan,
  };
}

/* -------------------------------------------------------------------------- */
/* A/B testing event storage (used by Module 5)                               */
/* -------------------------------------------------------------------------- */

export interface AbResultRow {
  experiment_name: string;
  variant: string;
  exposures: number;
  conversions: number;
  rate: number;
}

export async function recordAbEvent(params: {
  experimentName: string;
  variant: string;
  event: string;
  userId?: string | null;
}): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.info('[db demo] recordAbEvent', params);
    return;
  }
  const { error } = await admin.from('ab_events').insert({
    experiment_name: params.experimentName,
    variant: params.variant,
    event: params.event,
    user_id: params.userId ?? null,
  });
  if (error) throw new Error(`recordAbEvent failed: ${error.message}`);
}

export async function getAbResults(): Promise<AbResultRow[]> {
  const admin = getAdminClient();
  if (!admin) {
    return [
      { experiment_name: 'homepage_hero', variant: 'A', exposures: 1240, conversions: 86, rate: 6.94 },
      { experiment_name: 'homepage_hero', variant: 'B', exposures: 1198, conversions: 121, rate: 10.1 },
      { experiment_name: 'pricing_cta', variant: 'A', exposures: 642, conversions: 39, rate: 6.07 },
      { experiment_name: 'pricing_cta', variant: 'B', exposures: 651, conversions: 44, rate: 6.76 },
    ];
  }

  const { data, error } = await admin
    .from('ab_events')
    .select('experiment_name, variant, event');
  if (error) throw new Error(`getAbResults failed: ${error.message}`);

  const agg = new Map<string, { exposures: number; conversions: number }>();
  for (const row of data ?? []) {
    const key = `${row.experiment_name}::${row.variant}`;
    const entry = agg.get(key) ?? { exposures: 0, conversions: 0 };
    if (row.event === 'exposure') entry.exposures += 1;
    else entry.conversions += 1;
    agg.set(key, entry);
  }

  return Array.from(agg.entries()).map(([key, value]) => {
    const [experiment_name, variant] = key.split('::');
    return {
      experiment_name,
      variant,
      exposures: value.exposures,
      conversions: value.conversions,
      rate: value.exposures ? (value.conversions / value.exposures) * 100 : 0,
    };
  });
}


/* -------------------------------------------------------------------------- */
/* Tool usage (dashboard stats)                                               */
/* -------------------------------------------------------------------------- */

export interface UsageSummary {
  totalToolsUsed: number;
  recent: { tool: string; created_at: string }[];
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const admin = getAdminClient();
  if (!admin) {
    return {
      totalToolsUsed: 128,
      recent: [
        { tool: 'image-compressor', created_at: '2026-05-30T09:12:00Z' },
        { tool: 'color-converter', created_at: '2026-05-29T18:40:00Z' },
        { tool: 'markdown-preview', created_at: '2026-05-28T11:05:00Z' },
        { tool: 'image-compressor', created_at: '2026-05-27T15:22:00Z' },
      ],
    };
  }

  const [{ count }, { data }] = await Promise.all([
    admin
      .from('tool_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    admin
      .from('tool_usage')
      .select('tool, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    totalToolsUsed: count ?? 0,
    recent: (data as { tool: string; created_at: string }[]) ?? [],
  };
}
