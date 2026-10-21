import { supabaseClient } from '@utils';

export const getAuthorizationDetails = async (authorizationId: string) => {
  const { data, error } =
    await supabaseClient.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const decideAuthorization = async (
  authorizationId: string,
  isApproved: boolean
) => {
  const options = { skipBrowserRedirect: true };
  const { data, error } = isApproved
    ? await supabaseClient.auth.oauth.approveAuthorization(
        authorizationId,
        options
      )
    : await supabaseClient.auth.oauth.denyAuthorization(
        authorizationId,
        options
      );

  if (error) {
    throw new Error(error.message);
  }

  return data.redirect_url;
};
