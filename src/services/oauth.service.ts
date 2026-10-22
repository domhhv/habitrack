import type { TypedSupabaseClient } from '@models';

export const getAuthorizationDetails = async (
  supabase: TypedSupabaseClient,
  authorizationId: string
) => {
  const { data, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const decideAuthorization = async (
  supabase: TypedSupabaseClient,
  authorizationId: string,
  isApproved: boolean
) => {
  const options = { skipBrowserRedirect: true };
  const { data, error } = isApproved
    ? await supabase.auth.oauth.approveAuthorization(authorizationId, options)
    : await supabase.auth.oauth.denyAuthorization(authorizationId, options);

  if (error) {
    throw new Error(error.message);
  }

  return data.redirect_url;
};
