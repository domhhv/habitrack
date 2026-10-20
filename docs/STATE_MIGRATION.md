# Zustand → React Router data APIs: migration plan

## Context

Habitrack runs React Router 8.4 in framework mode (`ssr: true`, Vercel preset), but only on paper. `src/routes.ts` has the landing index and one splat route (`App.tsx`). That route renders the old declarative `<Routes>` from `AppRoutes.tsx`. All server data lives in one Zustand bound store (`src/stores/bound.store.ts`): user, profile, habits, traits, occurrences, notes, metrics and stocks, plus UI state. A `subscribeWithSelector` subscription refetches everything when `user` or `calendarRange` changes. The calendar components push `calendarRange` into the store from effects that read URL params.

The React Router docs (`explanation/state-management`, `how-to/client-data`, `how-to/optimize-revalidation`) say that network data, pending flags and URL-derived values should not live in a client store. Loaders, actions, fetchers and revalidation already handle them. In this codebase that covers the hand-written cache-version guards, the `isFetching`/`isSaving` flags, the `calendarRange` sync, and the cross-slice patching in `metrics.store.ts` and `stocks.store.ts`. These all go away.

Decisions already made:

- **Data loads in the browser.** Use `clientLoader`/`clientAction` with the existing browser Supabase client. The session stays in localStorage. App routes server-render a `HydrateFallback`. Moving a route to a server `loader` with `@supabase/ssr` is a possible later phase and is out of scope here.
- **Calendar filters and drawers stay in Zustand.** They become pure UI state: ids and dates only, never entity objects.

Goal: a sequence of small PRs that can each ship on their own. Every PR leaves the app working.

## Target end state

| Concern                                     | Final home                                                                                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session user, profile                       | App layout `clientMiddleware` (sets `userContext`) plus `clientLoader`. Read with `useRouteLoaderData('app')`                                                               |
| Habits, traits                              | App layout `clientLoader`, limited by `shouldRevalidate`                                                                                                                    |
| Habit stats, habit details                  | `habits` and `habits/:habitId` route `clientLoader`s. An unknown id throws `data(null, { status: 404 })` and renders the route `ErrorBoundary`                              |
| Occurrences and notes for the visible range | Calendar route `clientLoader`s that read through the existing `createCalendarRangeCache` (moved out of the slices). This keeps sibling prefetch and instant month switching |
| Notes list (infinite scroll)                | `notes` route `clientLoader` loads page 0. Later pages load with `useFetcher().load('/notes?page=n')`                                                                       |
| All mutations                               | `clientAction`s, called through `<Form>`/`useFetcher`. Revalidation replaces the manual store patching                                                                      |
| Pending state                               | `useNavigation()` / `fetcher.state` instead of `isSaving`/`isAuthenticating` `useState`                                                                                     |
| **Zustand keeps**                           | `confirmation` (the promise-based `askConfirmation`), `isMobileSidebarOpen`, `occurrenceDrawer`/`noteDrawer` (open state plus ids and dates), `calendarFilters`, `theme`    |
| **Zustand loses**                           | `user`, `profile`, `habits`, `traits`, `occurrences*`, `notes*`, metrics, stocks, `calendarRange`, every `isFetching*` flag, and the `subscribeWithSelector` subscription   |

The store is created once at module level with `create`. Zustand's SSR guidance prefers a store per request (`createStore` plus a context provider). That is not needed here, because the remaining store holds only UI defaults and nothing writes to it on the server. Rule: never call `set` during render or inside a loader that runs on the server. If that ever changes, switch to `createStore` and a context provider in `Providers.tsx`.

## Conventions (established in PR 1–2, followed afterwards)

- **Route config.** `src/routes.ts` declares every route with an explicit `id`, e.g. `layout('App.tsx', { id: 'app' }, [...])`. Existing `src/pages/*Page.tsx` files become the route modules, so no new pages directory is needed. Their props and loader args are typed with `./+types/<File>`.
- **Same hook names, new source.** Each store read hook is re-created in `src/hooks/` with the same name and return shape, but reads loader data instead: `useUser`, `useProfile`, `useHabits`, `useTraits`, `useOccurrences`, `useFlatOccurrences`, `useDayNotes`, `useWeekNotes`, `useMonthNotes`, `usePeriodNotes`, `useNotesByOccurrenceId`. The hook calls `useRouteLoaderData<typeof clientLoader>('<id>')`. In components, only the import moves from `@stores` to `@hooks`. Each hook is exported from `src/hooks/index.ts`, as CLAUDE.md requires for new hooks.
- **Derivations become pure utils.** `buildOccurrencesByDate` and `getOccurrencesInRange` (from `occurrences.store.ts`), `mergeNotes`, and the notes-by-occurrence and period filters (from `notes.store.ts`) move to `src/utils/` and are computed inside the `clientLoader`. Note: loader data can hold `ZonedDateTime` only while it comes from a client loader. A future server loader would have to return ISO strings.
- **Where mutations live.** A mutation whose UI belongs to one page goes on that page's `clientAction`. Branch on an `intent` field. A mutation whose UI is global (drawers, header) goes on a component-less resource route, `src/routes/resources/<domain>.ts` (`/resources/occurrences`, `/resources/notes`). That route can also have a `clientLoader` that fetchers call for drawer data.
- **Action result shape.** A new `src/utils/run-action.ts` wraps the existing `handleAsyncAction`, which keeps showing the toasts. It returns `{ ok: true, data } | { ok: false, error }` instead of rethrowing, so a failed mutation does not trigger the `ErrorBoundary`. Complex payloads go through `fetcher.submit(json, { method: 'post', encType: 'application/json' })`. Photo uploads use `FormData`.
- **Cache invalidation happens in `clientAction`s.** This follows the docs' "Client-Side Caching" pattern. The range caches live in a module, e.g. `src/utils/data-cache.ts`, with `occurrencesCache` and `notesCache`. A `clearUserCaches()` function runs on sign-out.
- **Revalidation.** The app layout exports `shouldRevalidate`. It returns `false` for plain GET navigations to a different URL (`formMethod == null && currentUrl.href !== nextUrl.href`). In every other case it returns `defaultShouldRevalidate`: submissions, same-URL navigations, and explicit `revalidate()`. Calendar routes keep the default behaviour, and cache hits keep it cheap. Pass `request.signal` into the Supabase queries (`.abortSignal()`). This replaces the hand-written `requestVersion`/`calendarRange` comparisons.
- **Temporary bridges.** Migrate writes first and reads second within each domain. While a domain's reads are still in Zustand, its new `clientAction` refreshes the old slice through `useBoundStore.getState()`, for example `getState().habitActions.fetchHabits()`. The PR that moves the reads deletes those lines and the slice. Mark every bridge with a block comment `/* Bridge: remove with <slice> */` so the remaining ones are easy to grep.

## PR sequence

### Phase 0 – Route tree

**PR 1 – Real route modules (no behaviour change)** – done on `refactor/route-modules`

- `src/routes.ts`: the landing index, plus `layout('App.tsx', { id: 'app' }, [...])` holding every route from the old `AppRoutes.tsx`, with the same paths and optional segments. Every route has an explicit id.
- `App.tsx` renders `<Outlet />`. `AppRoutes.tsx` is deleted. The `@pages` barrel exports only `ErrorFallbackPage`, so route modules are not pulled into other chunks.
- `/account` and the catch-all are component routes (`AccountRedirect.tsx`, `FallbackRedirect.tsx`) that render `<Navigate>`. They do not use a `clientLoader` redirect, for two reasons:
  - Loader `request.url` has the hash stripped (`createClientSideRequest` → `stripHashFromPath`). `/account` has to forward the Supabase auth tokens in the hash.
  - The server treats a module with no default export and no `ErrorBoundary` as a resource route. A document request to it, which the catch-all receives, returns 400 when there is no server `loader`.
- Spike result for component-less modules that only export `clientLoader`/`clientAction`:
  - Typegen and `yarn build` accept them. The client manifest marks them `hasClientLoader`/`hasClientAction` with `hasDefaultExport: false`.
  - In the framework client router, built the same way as `HydratedRouter` (`UNSAFE_createClientRoutes` plus the single-fetch data strategy), `fetcher.load` runs the `clientLoader` with search params.
  - `fetcher.submit` with `encType: 'application/json'` runs the `clientAction`, and active route loaders revalidate afterwards.
  - Lazy route discovery (`/__manifest`) serves the route.
  - A direct document GET returns 400. That is acceptable, because `/resources/*` is reached only through fetchers.
  - Not covered: a run in a real browser.

### Phase 1 – Session and auth

**PR 2 – Session in the app layout** – done on `refactor/session-loader`

- `src/utils/route-context.ts`: `userContext` (typed from `getSession`).
- `App.tsx` exports:
  - `clientMiddleware`, which calls `getSession()` and sets `userContext`.
  - `clientLoader`, which returns `{ user, profile }`.
  - `HydrateFallback`, the "We're preparing the app" screen.
  - `ErrorBoundary`, which renders `ErrorFallbackPage` with its generic title. It now also catches render errors from child pages, so the old session-specific title would be misleading.
  - `shouldRevalidate`, as described in Conventions.
- `useSession` is replaced by `useAuthSubscription(user)`. It keeps the Rollbar person effect and calls `revalidate()` only when the session's user id differs from the loader's, or on `USER_UPDATED`. Token refreshes and tab-focus `SIGNED_IN` events for the same user do nothing.
- `useUser`/`useProfile` live in `src/hooks/` and read `'app'` loader data through `useAppLoaderData`. `fetchProfile`, `useUser` and `useProfile` are removed from `user.store.ts`.
- Bridges:
  - `App` calls `setUser(user)` in an effect, for the store subscription and the data slices.
  - `SettingsPage` and `useAuthSearchParams` call `revalidate()` after the store's `updateProfile`.
- The `Root` overlay shows only while navigating into the app, i.e. while the `app` route is not yet matched.
- Changed from the plan:
  - `profileContext` and `clearUserCaches()` are deferred to the PRs that need them (PR 9 and PR 7). Until then the store subscription still clears the slices on sign-out.
- Verified with the framework client router and stub modules:
  - The middleware runs during hydration, and both the app `clientLoader` and child loaders see `userContext`.
  - A plain navigation runs the middleware but skips the app loader.
  - `revalidate()` and fetcher submissions re-run the app loader.

**PR 3 – Auth pages use `clientAction`s**

- `LoginPage`, `RegisterPage`, `AnonymousLoginPage`, `ResetPasswordPage`: a `clientAction` calls the existing `signIn`, `signUp`, `convertAnonymousUser`, `signInAnonymously` or `sendPasswordResetEmail` service and then `redirect()`s. The page renders `<Form method="post">`, and `useNavigation().state` drives `isAuthenticating`. The `if (user) <Navigate>` checks become a `clientLoader` that reads `userContext` and redirects. `AuthForm` takes the pending state as a prop and keeps working outside `<Form>` for Google sign-in.
- `OAuthConsentPage`: same pattern if it submits; otherwise leave it alone.

**PR 4 – Settings route**

- `SettingsPage` `clientAction` with intents `update-profile`, `update-user`, `delete-account`, `link-identity`/`unlink-identity` (from `ConnectedAccounts`). `isUpdating` comes from `useNavigation`/`useFetcher`. `useAuthSearchParams` stays an effect for now. Its `updateProfile` call moves to `useFetcher().submit`.
- Delete `profile` and `userActions` from `user.store.ts`. Keep only the bridged `user` field.

### Phase 2 – Habits and traits

**PR 5 – Habit, trait, metric-definition and stock mutations → `clientAction`s**

- `/habits` `clientAction`: `create-habit` (`AddHabitDialogButton`: `createHabit`, `uploadHabitIcon`, `createHabitMetrics`), `create-trait` (`AddTraitModal`), `delete-habit` (`HabitsTable`, including the photo cleanup it does today).
- `/habits/:habitId` `clientAction`: `update-habit` (`HabitDetails` fields), `update-icon` (`HabitIcon`), `add-metrics`, `update-metric`, `remove-metrics`, `add-stock`, `update-stock`, `remove-stock`, `update-stock-defaults` (`AddStockForm`, `StockListItem`).
- Bridge: each action calls `getState().habitActions.fetchHabits()` (and `traitActions.fetchTraits()` where relevant). Metric-definition intents also invalidate and refetch occurrences, which replaces the hand-written patching in `metrics.store.ts`.

**PR 6 – Habits and traits reads → loaders; delete their slices**

- The app layout `clientLoader` also returns `habits` and `traits` (keyed by id, as today). Re-create `useHabits`/`useTraits` in `src/hooks/`. `/habits` `clientLoader` returns `getHabitsStats`, which removes the `useEffect` in `HabitsTable`. `/habits/:habitId` uses the layout habits and throws a 404 for an unknown id. The "Habit not found" alert moves into that route's `ErrorBoundary`. `useIsFetchingHabits` goes away.
- Calendar filters change to `hiddenHabitIds`/`hiddenTraitIds`. A new habit is then visible by default, and nothing has to sync filters with fetched data. That removes the filter writes in `habits.store.ts`/`traits.store.ts` and the `['']` sentinel. `CalendarFilters`/`MonthCalendarGrid` compute the selected ids as all ids minus the hidden ones.
- Delete `habits.store.ts`, `traits.store.ts`, `stocks.store.ts`, and the habit-definition half of `metrics.store.ts`. Remove the PR 5 bridges.

### Phase 3 – Calendar, drawers, notes

**PR 7 – Occurrence mutations → `/resources/occurrences`**

- Intents: `create` (the orchestration now in `OccurrenceCreateFormContainer.handleSubmit`: photos, occurrence, note, metric values, stock usages, cost, depletion), `update` (`OccurrenceUpdateFormContainer`), `delete` (`OccurrenceDrawer`), `remove-metric-value` (`OccurrenceListItem`). The forms submit through `useFetcher`. `isSaving` comes from `fetcher.state`, and the drawer closes when `fetcher.data?.ok`.
- Bridge: each action calls `occurrencesCache.clear()` and `getState().occurrencesActions.fetchOccurrences()`. The habits stock counts refresh through layout revalidation, so `refreshHabitStocks` disappears.
- `occurrenceDrawer.occurrenceToEdit` changes to `occurrenceIdToEdit`.

**PR 8 – Note mutations and the drawer's note lookup → `/resources/notes`**

- `clientAction` intents `create`/`update`/`delete` for `NoteDrawer`. A `clientLoader` takes `?kind=&date=` and returns the note for that period. `NoteDrawer` calls `useFetcher().load(...)` when its period changes. This fixes a current gap: opening the drawer from the header on a non-calendar page can miss an existing note.
- Bridge: the actions clear `notesCache` and call `getState().noteActions.fetchNotes()`.

**PR 9 – Calendar reads → calendar route loaders; delete the occurrences and notes range slices**

- `src/utils/calendar-range.ts`: a pure `getCalendarRange(view, params, locale, firstDayOfWeek)` built from the effects now in `MonthCalendar`/`WeekCalendar`/`DayCalendar`. The locale comes from `navigator.language`, which is what `I18nProvider` falls back to. The first day of the week comes from `profileContext`.
- Each calendar route's `clientLoader` computes the range, calls `occurrencesCache.load`/`notesCache.load` with `request.signal`, starts the sibling prefetch, and returns `{ range, occurrences, occurrencesByDate, notes, notesByOccurrenceId }`.
- Re-create the calendar data hooks in `src/hooks/use-calendar-data.ts`. They read the data of whichever calendar route is matched. `OccurrenceDrawer` reads the same data. It is only opened with `dayToDisplay` from calendar cells. If the drawer is open without calendar data, fall back to `fetcher.load('/resources/occurrences?date=')`.
- Delete `calendarRange`, `changeCalendarRange`, the `isFocusedDateInitialized` dance in the three calendar components, the occurrences slice, the range half of the notes slice, and the bound-store subscription. Remove the PR 7–8 bridges.

**PR 10 – Notes page**

- `/notes` `clientLoader` returns page 0 through `listAllNotes`. `NotesList` adds later pages from `useFetcher().load('/notes?page=n')` into local state, and resets that state when `loaderData` changes after revalidation. Delete the rest of `notes.store.ts`. Rewrite `NotesList.test.tsx` with `createRoutesStub`.

### Phase 4 – Cleanup

**PR 11 – Shrink the store and update docs**

- `bound.store.ts` keeps only the `ui` and `theme` slices. Drop `subscribeWithSelector`. Turn off `devtools` in production. Remove the `user` bridge from PR 2. Grep for `Bridge:` and expect no results.
- Move the remaining store-dependent tests (`ThemeToggle`, `ConfirmationDialog`, `SignedImageViewer`, `OccurrenceChip`, `HabitsTable`) to `createRoutesStub` or to UI-only store setup.
- Update the "State Management Pattern" section in `CLAUDE.md`/`AGENTS.md`, and the data-flow sections in `docs/METRICS.md`, `docs/STOCKS.md` and `docs/COSTS.md` (UI → `clientAction` → service → revalidation → `clientLoader`).

Optional later work, not planned here: server loaders through `@supabase/ssr` cookies, optimistic UI through `useFetchers()` for month cells, `fetcher.load` for `getLatestHabitOccurrence` in `OccurrenceFormView`.

## Risks to watch

- Component-less client resource routes: verified by the PR 1 spike, except in a real browser. Recheck when PR 7 adds the first one.
- Revalidation load on the app layout. Every submission re-runs the habits, traits and profile queries. Expect three small queries; if that is too much, also skip `/resources/notes` submissions in `shouldRevalidate`.
- `react-router:split-route-modules` logs `SOURCEMAP_BROKEN` warnings for route modules with split client exports (seen since PR 2). Check that Rollbar stack traces for those chunks still map back to the source.
- `HydrateFallback` on every hard load of an app route. This is the same experience as the current `useSession` loader, so it is not a regression.
- Moving the filter representation (PR 6) resets every user's current selection once. That is acceptable, because filters are not persisted today.

## Verification (every PR)

- `yarn typecheck` (runs `react-router typegen`), `yarn eslint:check`, `yarn prettier:check`, `yarn test`, `yarn build`.
- Manual check by the user in `yarn dev` / the Vercel preview, for the flows the PR touches: sign in and out, including anonymous; month/week/day navigation (instant on cache hits, sibling prefetch visible in the network tab); creating, editing and deleting an occurrence with photos, metrics and stocks; adding, editing and deleting a note from the calendar and the header; habit CRUD, metric definitions and stocks; notes infinite scroll; settings updates. Browser verification is not run by Claude unless you ask.
- After PR 9: grep confirms no `@stores` import remains outside `ui`/`theme` hooks.
