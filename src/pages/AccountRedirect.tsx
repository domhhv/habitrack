import { href, redirect } from 'react-router';

import type { Route } from './+types/AccountRedirect';

export const loader = ({ request }: Route.LoaderArgs) => {
  throw redirect(`${href('/settings')}${new URL(request.url).search}`);
};
