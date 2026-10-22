import { parseDateTime, getLocalTimeZone } from '@internationalized/date';
import React from 'react';
import {
  Outlet,
  replace,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';

import type { DaysOfWeek, TypedSupabaseClient } from '@models';
import { ErrorFallbackPage } from '@pages';
import {
  loadCalendarData,
  primeCalendarData,
  createCalendarData,
  loadCalendarEntries,
  getKnownFirstDayOfWeek,
} from '@services';
import {
  noop,
  userContext,
  isCalendarView,
  profileContext,
  supabaseContext,
  type SessionUser,
  getCalendarRange,
  getRequestLocale,
  type CalendarView,
  type CalendarRange,
  getRequestTimeZone,
  getFocusedCalendarDate,
} from '@utils';

import type { Route } from './+types/CalendarLayout';

const getCalendarView = (request: Request) => {
  const view = new URL(request.url).pathname.split('/')[2];

  if (!isCalendarView(view)) {
    throw replace('/calendar/month');
  }

  return view;
};

const getRange = (
  view: CalendarView,
  params: Route.LoaderArgs['params'],
  locale: string,
  firstDayOfWeek: DaysOfWeek | undefined,
  timeZone: string
) => {
  return getCalendarRange(
    view,
    getFocusedCalendarDate(view, params, locale, firstDayOfWeek, timeZone),
    locale,
    firstDayOfWeek
  );
};

/**
 * Loads the range on the server for the first visit to the calendar, using the visitor's time
 * zone cookie and language. The entries are a promise, so a document request isn't held up.
 */
export const loader = async ({
  context,
  params,
  request,
}: Route.LoaderArgs) => {
  const view = getCalendarView(request);
  const user = context.get(userContext);
  const firstDayOfWeek = (await context.get(profileContext)())?.firstDayOfWeek;
  const range = getRange(
    view,
    params,
    getRequestLocale(request),
    firstDayOfWeek,
    getRequestTimeZone(request)
  );
  const entries = user
    ? loadCalendarEntries(context.get(supabaseContext), range)
    : Promise.resolve({ notes: [], occurrences: [] });

  entries.catch(noop);

  return {
    entries,
    firstDayOfWeek,
    range: [range[0].toString(), range[1].toString()],
  };
};

const loadRange = (
  supabase: TypedSupabaseClient,
  user: SessionUser,
  range: CalendarRange
) => {
  return user
    ? loadCalendarData(supabase, range)
    : createCalendarData([], [], range);
};

/**
 * Serves the calendar from the browser's range cache. Until the app layout has reported the first
 * day of the week, which is on hydration and when entering the app, it seeds the cache from the
 * server loader instead.
 */
export const clientLoader = async ({
  context,
  params,
  request,
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const view = getCalendarView(request);
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);
  const knownFirstDayOfWeek = getKnownFirstDayOfWeek(user?.id ?? null);
  const locale = navigator.language;

  if (knownFirstDayOfWeek) {
    return loadRange(
      supabase,
      user,
      getRange(
        view,
        params,
        locale,
        knownFirstDayOfWeek.value,
        getLocalTimeZone()
      )
    );
  }

  const { entries, firstDayOfWeek, range } = await serverLoader();

  if (user) {
    primeCalendarData(
      [parseDateTime(range[0]), parseDateTime(range[1])],
      await entries
    );
  }

  return loadRange(
    supabase,
    user,
    getRange(view, params, locale, firstDayOfWeek, getLocalTimeZone())
  );
};

clientLoader.hydrate = true as const;

export const shouldRevalidate = ({
  currentUrl,
  defaultShouldRevalidate,
  nextUrl,
}: ShouldRevalidateFunctionArgs) => {
  return defaultShouldRevalidate || currentUrl.pathname !== nextUrl.pathname;
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  return (
    <ErrorFallbackPage
      error={error instanceof Error ? error : null}
      title="We couldn't load your calendar. Please try reloading the page."
    />
  );
};

const CalendarLayout = () => {
  return <Outlet />;
};

export default CalendarLayout;
