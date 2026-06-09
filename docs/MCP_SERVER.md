# MCP Server (OAuth)

Habitrack can act as a remote [MCP](https://modelcontextprotocol.io) server, letting
MCP clients (ChatGPT, Claude, etc.) read and write a user's habits and occurrences
**on that user's behalf and with their permission**. Authentication uses the
Supabase OAuth 2.1 server, so no separate auth system is needed.

## How it works

```
MCP client (ChatGPT / Claude)
  │  1. GET <mcp>/.well-known/oauth-protected-resource  → discovers the Supabase auth server
  │  2. Dynamic Client Registration + OAuth 2.1 (PKCE) against Supabase
  ▼
Supabase OAuth server  ── redirects to ──►  /oauth/consent  (React app, OAuthConsentPage)
  │                                          user Allows/Denies
  │  3. issues access + refresh JWT (carries the user's `sub`)
  ▼
MCP Edge Function (supabase/functions/mcp)
  - verifies the JWT against Supabase JWKS
  - builds a Supabase client with the user's token
  ▼
Postgres — existing RLS (`auth.uid() = user_id`) scopes every query to that user
```

The key property: **all data-access authorization is the existing RLS.** A
per-user OAuth token produces a per-user Supabase client, so a client can only
ever touch the authorizing user's rows. No new permission logic lives in the
server.

## Components in this repo

| Piece                                     | Location                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Edge Function entry (tools, HTTP handler) | [`supabase/functions/mcp/index.ts`](../supabase/functions/mcp/index.ts)                        |
| JWT verification + OAuth discovery        | [`supabase/functions/mcp/auth.ts`](../supabase/functions/mcp/auth.ts)                          |
| Deno imports                              | [`supabase/functions/mcp/deno.json`](../supabase/functions/mcp/deno.json)                      |
| Function config (`verify_jwt = false`)    | [`supabase/config.toml`](../supabase/config.toml) (`[functions.mcp]`)                          |
| Consent screen                            | [`src/pages/OAuthConsentPage.tsx`](../src/pages/OAuthConsentPage.tsx) (route `/oauth/consent`) |

### Tools exposed

- `list_habits` — the user's habits with trait name/color.
- `list_occurrences` — occurrences, optional `habit_id` / `from` / `to` / `limit`.
- `log_occurrence` — create an occurrence for a habit.

Add more by registering them in `index.ts` with `mcp.tool(...)`, reusing the
shapes in `src/services/`.

## One-time setup

### 1. Enable the Supabase OAuth Server

In the Supabase Dashboard → **Authentication → OAuth Server**:

1. **Enable** the OAuth 2.1 server.
2. Enable **Dynamic Client Registration** so MCP clients can self-register
   (without it, every client must be registered by hand).
3. Set the **authorization path** to your consent route:
   `https://www.habitrack.io/oauth/consent` (and the local equivalent,
   `http://localhost:5173/oauth/consent`, for dev).

> Requires asymmetric JWT signing keys (RS256/ES256). If the project is still on
> the legacy shared HS256 secret, migrate to signing keys first
> (Settings → JWT Keys) — `auth.ts` verifies via the JWKS endpoint.

### 2. Deploy the Edge Function

```bash
supabase functions deploy mcp           # remote
# or, locally:
supabase functions serve mcp            # http://localhost:54321/functions/v1/mcp
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically for deployed
functions. For `supabase functions serve`, put them in `supabase/functions/.env`
(or pass `--env-file`).

The function's public URL is the MCP endpoint:

```
https://<project-ref>.supabase.co/functions/v1/mcp
```

## Testing

### A. Token verification + RLS (the important checks)

1. Run the OAuth flow once by hand to get an access token:
   - Build an `/auth/v1/oauth/authorize?...` URL (response_type=code, client_id,
     redirect_uri, code_challenge, code_challenge_method=S256, scope).
   - Approve on `/oauth/consent`, grab the `code` from the callback, exchange it
     at `/auth/v1/oauth/token` for an `access_token`.
   - (Easier: let MCP Inspector do this — see C.)

2. Call a tool with the token and confirm you get **only your** data:

   ```bash
   curl -s https://<ref>.supabase.co/functions/v1/mcp \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Accept: application/json, text/event-stream" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
          "params":{"name":"list_habits","arguments":{}}}'
   ```

3. **Cross-user check (do not skip):** repeat with user B's token and confirm you
   never see user A's habits/occurrences. This proves RLS is enforced through the
   OAuth token, not just in the app UI.

4. **Unauthenticated discovery** must work without a token:

   ```bash
   curl -s https://<ref>.supabase.co/functions/v1/mcp/.well-known/oauth-protected-resource
   # → { "resource": "...", "authorization_servers": ["https://<ref>.supabase.co/auth/v1"], ... }
   ```

   And a tool call with no token must return `401` with a `WWW-Authenticate`
   header pointing at that discovery document.

### B. Consent page

Visit `/oauth/consent?authorization_id=<id>` (an id from a real `/authorize`
redirect). Logged out → bounced to `/account`; logged in → client name + scopes
render and Allow/Deny redirect back to the client.

### C. MCP Inspector (full loop)

```bash
npx @modelcontextprotocol/inspector
```

Point it at the function URL with **Streamable HTTP** transport. It runs the
whole discovery → DCR → OAuth → consent → tools loop interactively.

### D. End-to-end in a real client

Add the function URL as a **custom connector** in Claude or ChatGPT and watch it
register, prompt for consent, and call the tools.

## Notes / gotchas

- `verify_jwt = false` is **required** on `[functions.mcp]`: the platform's
  built-in gate would reject the unauthenticated discovery handshake before our
  code runs. We verify the JWT ourselves in `auth.ts`.
- Streamable HTTP clients must send
  `Accept: application/json, text/event-stream`.
- `currentUser` in `index.ts` is a per-invocation module variable; this is safe
  because each Edge Function invocation handles a single request.
- Scopes (`habits:read`, `habits:write`) are advisory today — RLS is the real
  boundary. To make them enforced, check `user.scopes` inside each tool.

```

```
