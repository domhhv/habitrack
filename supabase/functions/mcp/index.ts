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
import { McpServer, StreamableHttpTransport } from 'mcp-lite';
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

// The current authed user for the in-flight request. mcp-lite tool handlers
// don't receive the raw Request, so we stash the user per request before
// dispatching. Edge Function invocations are single-request, so this is safe.
let currentUser: AuthedUser | null = null;

const requireUser = (): AuthedUser => {
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  return currentUser;
};

const ok = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const mcp = new McpServer({
  name: 'habitrack',
  version: '1.0.0',
  schemaAdapter: (schema) => z.toJSONSchema(schema as z.ZodType),
});

mcp.tool('list_habits', {
  description:
    "List the authenticated user's habits, including trait name and color.",
  inputSchema: z.object({}),
  handler: async () => {
    const supabase = userClient(requireUser());

    const { data, error } = await supabase
      .from('habits')
      .select('id, name, description, icon_path, trait:traits(name, color)')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return ok(data);
  },
});

mcp.tool('list_occurrences', {
  description:
    'List the user\'s habit occurrences (loggings) within an optional date range. Dates are ISO 8601.',
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
  }),
  handler: async (args: {
    habit_id?: string;
    from?: string;
    to?: string;
    limit: number;
  }) => {
    const supabase = userClient(requireUser());

    let query = supabase
      .from('occurrences')
      .select('id, habit_id, occurred_at, time_zone, created_at')
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
  handler: async (args: {
    habit_id: string;
    occurred_at?: string;
    time_zone: string;
  }) => {
    const user = requireUser();
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

  currentUser = user;

  try {
    const res = await httpHandler(req);
    for (const [k, v] of Object.entries(cors)) {
      res.headers.set(k, v);
    }

    return res;
  } finally {
    currentUser = null;
  }
});
