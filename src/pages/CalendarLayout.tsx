import { getLocalTimeZone } from '@internationalized/date';
import React from 'react';
import {
  Outlet,
  replace,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';

import { ErrorFallbackPage } from '@pages';
import { loadCalendarData, createCalendarData } from '@services';
import {
  userContext,
  isCalendarView,
  profileContext,
  supabaseContext,
  getCalendarRange,
  getFocusedCalendarDate,
} from '@utils';

import type { Route } from './+types/CalendarLayout';

export const clientLoader = async ({
  context,
  params,
  request,
}: Route.ClientLoaderArgs) => {
  const view = new URL(request.url).pathname.split('/')[2];

  if (!isCalendarView(view)) {
    throw replace('/calendar/month');
  }

  const locale = navigator.language;
  const firstDayOfWeek = context.get(profileContext)?.firstDayOfWeek;
  const range = getCalendarRange(
    view,
    getFocusedCalendarDate(
      view,
      params,
      locale,
      firstDayOfWeek,
      getLocalTimeZone()
    ),
    locale,
    firstDayOfWeek
  );

  return context.get(userContext)
    ? loadCalendarData(context.get(supabaseContext), range)
    : createCalendarData([], [], range);
};

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
