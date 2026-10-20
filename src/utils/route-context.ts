import { createContext } from 'react-router';

import type { getSession } from '@services';

export type SessionUser = Awaited<ReturnType<typeof getSession>>;

export const userContext = createContext<SessionUser>(null);
