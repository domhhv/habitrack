import { redirect } from 'react-router';

import type { Route } from './+types/AccountRedirect';

export const loader = ({ request }: Route.LoaderArgs) => {
  throw redirect(`/settings${new URL(request.url).search}`);
};
