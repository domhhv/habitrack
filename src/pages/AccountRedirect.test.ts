import { it, expect, describe } from 'vitest';

import { makeRouteArgs } from '@tests';

import type { Route } from './+types/AccountRedirect';
import { loader } from './AccountRedirect';

describe('AccountRedirect loader', () => {
  it('redirects to the settings page with the same search params', () => {
    let thrown: unknown;

    try {
      loader(
        makeRouteArgs<Route.LoaderArgs>(
          'https://habitrack.test/account?emailConfirmed=true'
        )
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get('Location')).toBe(
      '/settings?emailConfirmed=true'
    );
  });
});
