// Habitrack MCP server — Supabase Edge Function.
//
// Exposes a user's habits and occurrences to MCP clients (ChatGPT, Claude,
// etc.) over the OAuth 2.1 flow that Supabase Auth provides. Every tool runs
// against a Supabase client carrying the *caller's* access token, so existing
// Row Level Security policies scope all data to that user automatically.
//
// Deploy with `verify_jwt = false` (see supabase/config.toml) so the
// unauthenticated discovery handshake can reach this code; we verify the JWT
// ourselves in `authenticate()`.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { McpServer, StreamableHttpTransport, type Ctx } from 'mcp-lite';
import { z } from 'zod';

import {
  authenticate,
  protectedResourceMetadata,
  unauthorized,
  type AuthedUser,
} from './auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Per-request Supabase client bound to the user's token → RLS applies.
const userClient = (user: AuthedUser): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${user.token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

// The authenticated user is threaded per request via mcp-lite's `authInfo`
// (set on `httpHandler(req, { authInfo })`), so each tool handler reads it from
// its own `ctx` — no shared mutable state, no cross-request leakage.
const userFromContext = (ctx: Ctx): AuthedUser => {
  const user = ctx.authInfo?.extra?.user as AuthedUser | undefined;

  if (!user) {
    throw new Error('Not authenticated');
  }

  return user;
};

// Note on authorization: Supabase's OAuth server only negotiates the standard
// scopes (openid/profile/email/phone) — custom scopes like "habits:read" are
// rejected at /authorize, so we can't express read-vs-write granularity via
// scopes. A successfully issued token already means the user consented to
// connect their account, and RLS scopes every query to that user. The
// read/write distinction is therefore enforced by which tools we expose, not
// by scope checks. `authenticate()` rejects any missing/invalid token (401).

const ok = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

// Build a PostgREST select string from a base column list plus the embedded
// resources a client opted into via `include`. Keeping the base lean and the
// joins opt-in keeps default payloads small while letting clients pull the
// full picture (stocks, metrics, etc.) when they ask. Curated column lists —
// not `*` — so payloads stay stable and free of internal columns.
const buildSelect = (
  base: string,
  include: string[],
  joins: Record<string, string>
): string => {
  const parts = [base];

  for (const key of include) {
    const join = joins[key];

    if (join) {
      parts.push(join);
    }
  }

  return parts.join(',');
};

const mcp = new McpServer({
  name: 'habitrack',
  version: '1.0.0',
  schemaAdapter: (schema) => z.toJSONSchema(schema as z.ZodType),
});

// Recorded metric values are stored as JSONB whose shape depends on the metric
// definition's `type`. Surfacing the mapping in the tool descriptions lets a
// client interpret `metric_values[].value` without guessing.
const METRIC_VALUE_SHAPES =
  'A metric definition\'s `type` determines the JSONB shape of a recorded ' +
  '`value`: number/percentage/scale → {numericValue}; duration → ' +
  '{durationMs}; range → {rangeFrom,rangeTo}; choice → {selectedOption} or ' +
  '{selectedOptions}; boolean → {booleanValue}; text → {textValue}. The ' +
  "definition's `config` (JSONB) holds type-specific settings (units, min/max, " +
  'options, labels, etc.).';

const HABIT_INCLUDES = ['trait', 'metrics', 'stocks'] as const;

const HABIT_JOINS: Record<string, string> = {
  trait: 'trait:traits(id, name, color)',
  metrics:
    'metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required)',
  stocks:
    'stocks:habit_stocks(id, name, cost, currency, total_items, remaining_items, is_depleted, purchased_at, metric_defaults:habit_stock_metric_defaults(id, habit_metric_id, value, should_compound))',
};

mcp.tool('list_habits', {
  description:
    "List the authenticated user's habits. By default returns the core habit " +
    'fields; pass `include` to embed the trait, metric definitions, and/or ' +
    'stocks (with their metric defaults). ' +
    METRIC_VALUE_SHAPES,
  inputSchema: z.object({
    include: z
      .array(z.enum(HABIT_INCLUDES))
      .default([])
      .describe(
        'Embedded resources to fetch: "trait", "metrics", "stocks". Omit for the lean row.'
      ),
  }),
  handler: async (args: { include: string[] }, ctx: Ctx) => {
    const supabase = userClient(userFromContext(ctx));

    const select = buildSelect(
      'id, name, description, icon_path',
      args.include,
      HABIT_JOINS
    );

    const { data, error } = await supabase
      .from('habits')
      .select(select)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return ok(data);
  },
});

const OCCURRENCE_INCLUDES = ['habit', 'metrics', 'stock_usages'] as const;

const OCCURRENCE_JOINS: Record<string, string> = {
  habit:
    'habit:habits(id, name, icon_path, trait:traits(id, name, color), metric_definitions:habit_metrics(id, name, type, config, sort_order, is_required))',
  metrics:
    'metric_values:occurrence_metric_values(id, habit_metric_id, value)',
  stock_usages:
    'stock_usages:occurrence_stock_usages(id, habit_stock_id, quantity)',
};

mcp.tool('list_occurrences', {
  description:
    "List the user's habit occurrences (loggings) within an optional date " +
    'range (ISO 8601). By default returns the core occurrence fields; pass ' +
    '`include` to embed the habit (with trait + metric definitions), recorded ' +
    'metric values, and/or stock usages. Each recorded value carries its ' +
    '`habit_metric_id`; include `habit` to get the matching definition (its ' +
    '`type` and `config`) needed to interpret it. ' +
    METRIC_VALUE_SHAPES,
  inputSchema: z.object({
    habit_id: z
      .string()
      .uuid()
      .optional()
      .describe('Filter to a single habit id (UUID).'),
    from: z
      .string()
      .optional()
      .describe('Inclusive lower bound, ISO timestamp.'),
    to: z.string().optional().describe('Inclusive upper bound, ISO timestamp.'),
    limit: z.number().int().min(1).max(500).default(100),
    include: z
      .array(z.enum(OCCURRENCE_INCLUDES))
      .default([])
      .describe(
        'Embedded resources: "habit", "metrics" (recorded values), "stock_usages". Omit for the lean row.'
      ),
  }),
  handler: async (
    args: {
      habit_id?: string;
      from?: string;
      to?: string;
      limit: number;
      include: string[];
    },
    ctx: Ctx
  ) => {
    const supabase = userClient(userFromContext(ctx));

    const select = buildSelect(
      'id, habit_id, occurred_at, time_zone, created_at',
      args.include,
      OCCURRENCE_JOINS
    );

    let query = supabase
      .from('occurrences')
      .select(select)
      .order('occurred_at', { ascending: false })
      .limit(args.limit);

    if (args.habit_id !== undefined) {
      query = query.eq('habit_id', args.habit_id);
    }
    if (args.from) {
      query = query.gte('occurred_at', args.from);
    }
    if (args.to) {
      query = query.lte('occurred_at', args.to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return ok(data);
  },
});

mcp.tool('log_occurrence', {
  description:
    'Log a new occurrence for one of the user\'s habits at a given time.',
  inputSchema: z.object({
    habit_id: z.string().uuid().describe('The habit to log (UUID).'),
    occurred_at: z
      .string()
      .describe('When it happened, ISO 8601. Defaults to now if omitted.')
      .optional(),
    time_zone: z
      .string()
      .describe('IANA time zone, e.g. "Europe/Berlin".')
      .default('UTC'),
  }),
  handler: async (
    args: {
      habit_id: string;
      occurred_at?: string;
      time_zone: string;
    },
    ctx: Ctx
  ) => {
    const user = userFromContext(ctx);
    const supabase = userClient(user);

    const { data, error } = await supabase
      .from('occurrences')
      .insert({
        habit_id: args.habit_id,
        occurred_at: args.occurred_at ?? new Date().toISOString(),
        time_zone: args.time_zone,
        // user_id is enforced by the RLS WITH CHECK policy; we set it
        // explicitly to satisfy the NOT NULL column.
        user_id: user.userId,
      })
      .select('id, habit_id, occurred_at, time_zone')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return ok(data);
  },
});

const NOTE_INCLUDES = ['habit'] as const;

const NOTE_BASE_COLUMNS =
  'id, content, occurrence_id, period_kind, period_date, created_at, updated_at';

// A note targets at most one occurrence; pull that occurrence's habit so
// clients can attribute the note. Period notes have no occurrence → null.
const NOTE_HABIT_EMBED =
  'occurrence:occurrences(id, occurred_at, habit:habits(id, name, icon_path))';

// The note's effective date is its occurrence's `occurred_at` (occurrence
// notes) or its `period_date` (period notes) — not `created_at`. Range
// filtering must therefore hit whichever target the note has, mirroring the
// two-query strategy in src/services/notes.service.ts.
const noteTargetDate = (note: Record<string, unknown>): string => {
  const occurrence = note.occurrence as { occurred_at?: string } | null;

  return (
    occurrence?.occurred_at ??
    (note.period_date as string | null) ??
    (note.created_at as string)
  );
};

mcp.tool('list_notes', {
  description:
    "List the user's notes. A note is attached either to an occurrence or to " +
    'a time period (day/week/month). By default returns the core note fields; ' +
    'pass `include: ["habit"]` to embed the linked occurrence and its habit. ' +
    'When a date range is given it filters on the note\'s target date — the ' +
    "occurrence's time for occurrence notes, the period date for period notes.",
  inputSchema: z.object({
    from: z
      .string()
      .optional()
      .describe("Inclusive lower bound on the note's target date, ISO."),
    to: z
      .string()
      .optional()
      .describe("Inclusive upper bound on the note's target date, ISO."),
    limit: z.number().int().min(1).max(500).default(100),
    include: z
      .array(z.enum(NOTE_INCLUDES))
      .default([])
      .describe('Embedded resources: "habit". Omit for the lean row.'),
  }),
  handler: async (
    args: { from?: string; to?: string; limit: number; include: string[] },
    ctx: Ctx
  ) => {
    const supabase = userClient(userFromContext(ctx));

    const wantsHabit = args.include.includes('habit');
    const hasRange = Boolean(args.from || args.to);

    // No range → one simple query; the occurrence embed is optional.
    if (!hasRange) {
      const select = wantsHabit
        ? `${NOTE_BASE_COLUMNS}, ${NOTE_HABIT_EMBED}`
        : NOTE_BASE_COLUMNS;

      const { data, error } = await supabase
        .from('notes')
        .select(select)
        .order('created_at', { ascending: false })
        .limit(args.limit);

      if (error) {
        throw new Error(error.message);
      }

      return ok(data);
    }

    // Range → two queries against the two possible target dates, then merge.
    // Period notes are filtered on `period_date`; occurrence notes on the
    // joined `occurred_at` via an inner join so out-of-range ones drop out.
    // We always select the occurrence embed here (needed for sorting); it's
    // stripped from the output below unless the client asked for `habit`.
    const periodQuery = supabase
      .from('notes')
      .select(`${NOTE_BASE_COLUMNS}, ${NOTE_HABIT_EMBED}`)
      .not('period_date', 'is', null);

    const occurrenceQuery = supabase
      .from('notes')
      .select(
        `${NOTE_BASE_COLUMNS}, occurrence:occurrences!inner(id, occurred_at, habit:habits(id, name, icon_path))`
      );

    if (args.from) {
      periodQuery.gte('period_date', args.from);
      occurrenceQuery.gte('occurrences.occurred_at', args.from);
    }
    if (args.to) {
      periodQuery.lte('period_date', args.to);
      occurrenceQuery.lte('occurrences.occurred_at', args.to);
    }

    const [periodResult, occurrenceResult] = await Promise.all([
      periodQuery,
      occurrenceQuery,
    ]);

    if (periodResult.error) {
      throw new Error(periodResult.error.message);
    }
    if (occurrenceResult.error) {
      throw new Error(occurrenceResult.error.message);
    }

    const byId = new Map<string, Record<string, unknown>>();
    for (const note of [...periodResult.data, ...occurrenceResult.data]) {
      byId.set(note.id as string, note as Record<string, unknown>);
    }

    const merged = [...byId.values()]
      .sort((a, b) => noteTargetDate(b).localeCompare(noteTargetDate(a)))
      .slice(0, args.limit)
      .map((note) => {
        if (wantsHabit) {
          return note;
        }

        // Drop the occurrence embed we only fetched for filtering/sorting.
        const { occurrence: _occurrence, ...rest } = note;

        return rest;
      });

    return ok(merged);
  },
});

const transport = new StreamableHttpTransport();
const httpHandler = transport.bind(mcp);

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'authorization, content-type, mcp-protocol-version, mcp-session-id',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-expose-headers': 'mcp-session-id, www-authenticate',
};

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  // RFC 9728 discovery — served unauthenticated so clients can bootstrap OAuth.
  if (url.pathname.endsWith('/.well-known/oauth-protected-resource')) {
    return new Response(JSON.stringify(protectedResourceMetadata()), {
      headers: { 'content-type': 'application/json', ...cors },
    });
  }

  // Everything else requires a valid Supabase OAuth access token.
  const user = await authenticate(req);

  if (!user) {
    const res = unauthorized();
    for (const [k, v] of Object.entries(cors)) {
      res.headers.set(k, v);
    }

    return res;
  }

  // Thread the authed user through mcp-lite's request-local authInfo so each
  // tool handler reads it from its own ctx (see userFromContext).
  const res = await httpHandler(req, {
    authInfo: {
      token: user.token,
      scopes: user.scopes,
      extra: { user },
    },
  });
  for (const [k, v] of Object.entries(cors)) {
    res.headers.set(k, v);
  }

  return res;
});
