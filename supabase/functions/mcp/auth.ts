// OAuth / JWT plumbing for the Habitrack MCP server.
//
// The MCP server is a *protected resource*: it does not run the OAuth flow
// itself. It only (1) tells clients where to authenticate via the
// `oauth-protected-resource` discovery document, and (2) verifies the Bearer
// access token that clients present on every request.
//
// Tokens are standard Supabase JWTs (RS256/ES256, signed by the project's
// asymmetric keys). We verify them against the project JWKS. Because the token
// carries the user's `sub`, a Supabase client created with it is automatically
// scoped to that user by Row Level Security — no per-user checks needed here.

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'npm:jose@^5.9.6';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

// The issuer/JWKS for project-issued JWTs live under /auth/v1.
const ISSUER = `${SUPABASE_URL}/auth/v1`;
const JWKS = createRemoteJWKSet(
  new URL(`${ISSUER}/.well-known/jwks.json`)
);

export type AuthedUser = {
  /** Supabase user id (JWT `sub`). */
  userId: string;
  /** OAuth client that obtained the token (JWT `client_id`), if any. */
  clientId?: string;
  /** Raw access token — forwarded to PostgREST so RLS applies. */
  token: string;
  /** Granted OAuth scopes, space-separated in the token. */
  scopes: string[];
  email?: string;
};

/**
 * The resource server's base URL, e.g.
 * https://<ref>.supabase.co/functions/v1/mcp
 */
export const resourceUrl = () =>
  `${SUPABASE_URL}/functions/v1/mcp`;

/**
 * RFC 9728 protected-resource metadata. MCP clients fetch this first to learn
 * which authorization server to use. We point them at the Supabase OAuth
 * server, which exposes /authorize, /token, DCR and JWKS.
 */
export const protectedResourceMetadata = () => ({
  resource: resourceUrl(),
  authorization_servers: [ISSUER],
  bearer_methods_supported: ['header'],
  scopes_supported: ['openid', 'email', 'profile', 'habits:read', 'habits:write'],
});

/** 401 challenge that tells the client where the discovery document lives. */
export const unauthorized = (detail = 'invalid_token') => {
  const challenge =
    `Bearer resource_metadata="${resourceUrl()}/.well-known/oauth-protected-resource", ` +
    `error="${detail}"`;

  return new Response(
    JSON.stringify({ error: detail }),
    {
      status: 401,
      headers: {
        'content-type': 'application/json',
        'www-authenticate': challenge,
      },
    }
  );
};

/**
 * Verify the Authorization: Bearer <jwt> header. Returns the authed user, or
 * null when the token is missing/invalid (caller should emit `unauthorized`).
 */
export const authenticate = async (
  req: Request
): Promise<AuthedUser | null> => {
  const header = req.headers.get('authorization') ?? '';

  if (!header.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = header.slice(7).trim();

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: 'authenticated',
    });

    const p = payload as JWTPayload & {
      client_id?: string;
      email?: string;
      scope?: string;
    };

    if (!p.sub) {
      return null;
    }

    return {
      userId: p.sub,
      clientId: p.client_id,
      token,
      scopes: p.scope ? p.scope.split(' ') : [],
      email: p.email,
    };
  } catch {
    return null;
  }
};
