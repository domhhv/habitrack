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
- **Action result shape.** A new `src/utils/run-action.ts` wraps the existing `handleAsyncAction`, which keeps showing the toasts. It returns `{ ok: true } | { ok: false, error }` instead of rethrowing, so a failed mutation does not trigger the `ErrorBoundary`. The failure result has no 4xx status, so loaders still revalidate: a multi-step action can fail after some of its writes went through. Actions with a single write, or none, such as auth, can keep `data(…, { status: 400 })`. Complex payloads go through `fetcher.submit(json, { method: 'post', encType: 'application/json' })`. Photo uploads use `FormData`.
- **Cache invalidation happens in `clientAction`s.** This follows the docs' "Client-Side Caching" pattern. The range caches live in a module, e.g. `src/utils/data-cache.ts`, with `occurrencesCache` and `notesCache`. A `clearUserCaches()` function runs on sign-out.
- **Revalidation.** By default, the router re-runs the app layout loader on every navigation. To avoid that, the app layout exports `shouldRevalidate`. For plain GET navigations to a different URL it revalidates only while the app data is stale (`src/utils/app-revalidation.ts`). Submissions, same-URL navigations and explicit `revalidate()` calls mark the data stale and return `defaultShouldRevalidate`. The auth subscription also marks it stale before calling `revalidate()`. The `clientLoader` clears the mark only when a load finishes without being aborted. A revalidation that a navigation interrupts is therefore retried on the next navigation, not dropped. Mark the data stale wherever something else needs the app loader to refresh. Calendar routes keep the default behaviour, and cache hits keep it cheap. Pass `request.signal` into the Supabase queries (`.abortSignal()`). This replaces the hand-written `requestVersion`/`calendarRange` comparisons.
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
  - A sign-out revalidation or post-submit revalidation that a navigation interrupts still refreshes the app loader. This was a review finding on #488: the first version of `shouldRevalidate` dropped these.
- `entry.client.tsx` passes `onError` to `HydratedRouter` and reports errors caught by route boundaries to Rollbar. Route error responses, such as thrown 404s, are not reported. Before this, route render errors stopped at the router's boundaries and never reached `RollbarErrorBoundary`. That gap dates back to the switch to framework mode.

**PR 3 – Auth pages use `clientAction`s** – done on `refactor/auth-actions`

- `LoginPage`, `RegisterPage`, `AnonymousLoginPage`, `ResetPasswordPage`:
  - Each has a `clientAction` that reads the submitted `FormData` and calls the existing service: `signIn`, `signUp`/`convertAnonymousUser`, `signInAnonymously` or `sendPasswordResetEmail`. On success it shows the same toast as before and `redirect()`s to the same place.
  - On failure the action shows the error toast and returns `data({ error }, { status: 400 })`, so nothing revalidates.
  - The `if (user) <Navigate replace>` checks became `clientLoader`s that read `userContext` and `throw replace('/calendar')`. `RegisterPage` returns `{ isAnonymousUser }` instead.
  - Since #491, a successful login, anonymous login or anonymous-account conversion redirects to `/calendar`, not the landing page. So do signed-in visits to the auth pages.
  - The first day of the week still comes from `useFirstDayOfWeek`. It is posted as a hidden field and validated with `parseDayOfWeek`.
- `AuthForm` renders `<Form method="post">` and accepts extra hidden fields as `children`. Its `onSubmit` prop is gone, and the Google button stays a plain `type="button"`.
- `useIsSubmitting()` (in `@hooks`) compares `useNavigation().formAction` with `useFormAction()`. It stays `true` while the redirect after a successful action loads.
- `OAuthConsentPage`:
  - It used to load the authorization details in an effect. Now a `clientLoader` handles three cases: a missing `authorization_id` throws a 400, a signed-out user is redirected to `/settings?returnTo=…`, and an existing consent is sent to the client with `redirectDocument`.
  - Approve and deny are a `<Form>` with two `decision` submit buttons, handled by a `clientAction` that `redirectDocument`s to the client. Failures come back as `actionData.error` and render inline. Load errors render in the route's `ErrorBoundary`.
  - The Supabase calls moved to `src/services/oauth.service.ts`.
  - Pre-existing gap: nothing reads `returnTo` yet.
- Tests: `AuthForm` runs through `createRoutesStub` and checks that the fields reach the route action. The loader and action branches are covered for login, register and consent (`tests/makeRouteArgs.ts` builds the arguments).

**PR 4 – Settings route** – done on `refactor/settings-action`

- `SettingsPage` `clientAction` handles the intents `update-profile`, `update-user`, `delete-account`, `link-identity`, `unlink-identity` and `sync-email`.
  - The user comes from `userContext`. Each intent keeps its previous toasts. Failures return `data({ error, intent, ok: false }, { status: 400 })`.
  - `update-profile` and `update-user` patch only the fields that were submitted, and the page still submits only the fields that changed.
  - `delete-account` redirects to `/login`.
  - Unknown intents and signed-out requests get a 400.
- The page submits through one `useFetcher`, so it stays put and `isUpdating` is `fetcher.state !== 'idle'`. After every submission the app loader returns a fresh profile, so the existing `[profile]` effect resets the general and security fields. The password is cleared after a successful `update-user`.
- `ConnectedAccounts`:
  - Its identities now come from the settings `clientLoader` as props, instead of an effect with a spinner.
  - A failed load renders inline, not as a toast, so the page stays usable.
  - Link and unlink use its own fetcher. Unlink sends the `identity_id`, and the action finds that identity again before unlinking. Revalidation refreshes the list afterwards.
- `useAuthSearchParams` stays an effect. Its email-change sync is now `fetcher.submit({ intent: 'sync-email' })`, and the PR 2 `revalidate()` bridges are gone.
- `user.store.ts` keeps only `user` and `setUser`, for the PR 2 bridge in `App`. `profile`, `updateProfile`, `updateUser`, `deleteUser` and `clearProfile` are removed.
- Tests cover the settings loader and action branches, and check that `ConnectedAccounts` link/unlink submit to `/settings`.

### Phase 2 – Habits and traits

**PRs 5 + 6 – Habits and traits through loaders and actions** – done together on `refactor/habits-loaders`

- **Reads**
  - The app layout `clientLoader` also returns `habits` and `traits`, keyed by id, loaded in parallel with the profile.
  - `useHabits`/`useTraits` live in `src/hooks/` and read that data. They return a stable empty object when signed out.
  - `/habits` `clientLoader` returns `habitsStats`: `listHabitIds()` then `getHabitsStats()`. A failure is reported to Rollbar and the table renders without stats, as before. `HabitsTable` takes `habitsStats` as a prop, and its effect is gone.
  - `/habits/:habitId` `clientLoader` uses `getHabit`, which now returns `null` when there is no row. It throws a 404, and the route `ErrorBoundary` renders the "Habit not found" alert. `HabitDetails` is keyed by habit id, so its local edit state resets when you switch habits.
- **Mutations.** They go through `useActionFetcher(onSuccess)` (`src/hooks/use-action-fetcher.ts`), a `useFetcher` that runs `onSuccess` once an action returns `{ ok: true }`. Components use it to close modals or editors. Actions wrap their work in `runAction(promise, actionType)` (`src/utils/run-action.ts`), which keeps the `handleAsyncAction` toasts and returns `{ ok: true }` or `{ error, ok: false }`. The failure has no 4xx status, so partial writes still revalidate.
  - Shared fetchers block a new submission while one is pending. Otherwise a second submission interrupts the first, and the first one's writes are never revalidated. For example, `HabitsTable` disables the delete buttons while a delete is running.
  - `/habits` `clientAction`:
    - `create-habit` is multipart `FormData`, because of the icon file. Metric definitions travel as a JSON field.
    - `create-trait` is JSON.
  - `/habits/:habitId` `clientAction` takes the JSON `HabitDetailsSubmission` union (`src/models/habit-submission.model.ts`): `update-habit`, `delete-habit` (with photo and icon cleanup), `save-metrics` (remove/add/update from the form flags), `add-stock`, `update-stock` (optionally replacing the metric defaults) and `remove-stock`. The icon upload is multipart `FormData`.
  - Habit-scoped UI on any page submits with an explicit `action: /habits/<id>`. That covers `HabitsTable`'s delete and `HabitIcon` in the table.
  - Stock metric-default values go through `pickDefinedValues`, because JSON submissions can't contain `undefined` record values.
  - Files are detected with `typeof value !== 'string'`, not `instanceof File`, which also holds across realms in tests.
- **Calendar filters.** They store `hiddenHabitIds`/`hiddenTraitIds`. `CalendarFilters` computes the selected ids as all ids minus the hidden ones, and `MonthCalendarGrid` filters out the hidden ones. The `['']` sentinel and the filter writes from the store slices are gone.
- **Store.** `habits.store.ts`, `traits.store.ts` and `stocks.store.ts` are deleted. `metrics.store.ts` keeps only the occurrence metric-value actions. The store subscription no longer fetches or clears habits and traits.
- **Bridges until Phase 3**
  - `HabitDetailsPage` invalidates the store occurrences cache and refetches after a habit update, icon change, deletion or metric-definition save. It does not empty the calendar first, and a failed refetch is reported to Rollbar while the previous occurrences stay visible. This replaces the in-place patching in `metrics.store.ts`, and also refreshes chips after renames and deletes, which the old code did not.
  - `OccurrenceCreate/UpdateFormContainer` call `patchStock` directly and then `markAppDataStale()` + `revalidate()`, in place of `updateStock`/`refreshHabitStocks`.
- **Tests**
  - Loader and action tests for `/habits` and `/habits/:habitId`.
  - `HabitsTable.test.tsx` renders through `createRoutesStub` and runs again. It had been skipped since the HeroUI v3 migration.

### Phase 3 – Calendar, drawers, notes

**PR 7 – Occurrence mutations → `/resources/occurrences`** – done on `refactor/occurrence-actions`

- `src/routes/resources/occurrences.ts` is a component-less route under the app layout, so its action gets `userContext` from the layout middleware.
  - `create` and `update` are multipart. The form values go as a `values` JSON field, built by `toOccurrenceFormData`, and the photos as `photos` files.
  - `delete`, `remove-metric-value` and `remove-photo` are JSON (`OccurrenceSubmission` in `src/models/occurrence-submission.model.ts`). `OccurrenceFormValues` moved there too.
  - All the orchestration moved out of the containers: photo upload, cost, the occurrence row, note, metric values, the stock-usage diff and depletion.
  - The action loads the habit's stocks (for the cost) and, for update/delete/remove-photo, the current occurrence with the new `getOccurrence`. It no longer trusts the drawer's snapshot.
  - The cost lives in `calculateOccurrenceCost`. Stocks with zero `totalItems` are skipped on update as well; before, only create skipped them.
- The create/update containers use `useActionFetcher(closeOccurrenceDrawer)`, and `isSaving` comes from the fetcher.
  - Photo removal uses `useSubmit` with a `fetcherKey` per photo, so quick successive removals don't interrupt each other. It has no success toast, because `SignedImageViewer` already shows one.
  - The drawer's delete and `OccurrenceListItem`'s metric-value removal each use a fetcher. They ignore a new request while one is pending.
- `occurrenceDrawer.occurrenceToEdit` is now `occurrenceIdToEdit`. `useOccurrenceToEdit()` resolves it from the store occurrences until PR 9.
  - The update container keeps the occurrence it first loaded as the draft source until the edited id changes, so refreshes after a photo removal don't wipe unsaved edits. Only the live `photoPaths` reach the form, through a `photoPaths` prop.
- Writes to `photo_paths` (remove-photo, and the update's own patch) go through `writePhotoPaths`. It re-reads the row and queues the writes per occurrence, so concurrent removals can't restore a deleted file's path.
- Photo uploads keep the old lenient behaviour: `uploadImages` toasts any failed files and the entry saves with the photos that did upload.
- Habit stock counts refresh through app-loader revalidation after every occurrence action. That now includes deletes, which used to leave the counts stale.
- Store: `metrics.store.ts` is deleted, because metric values go through the services. `addOccurrence`, `updateOccurrence` and `removeOccurrence` are removed from the occurrences slice.
- Bridges:
  - `refreshStoreOccurrences()` (in `occurrences.store.ts`, shared with `HabitDetailsPage`) invalidates the slice's cache and refetches the current range. The calendar is not emptied first, and failures go to Rollbar. It runs in `finally`, so an action that fails after some of its writes still refreshes the calendar.
  - The occurrence note is still saved through `useBoundStore.getState().noteActions` until PR 8.
- Changed from the plan:
  - The range caches stay inside the slices.
  - `clearUserCaches()` waits for PR 9, when the caches move out with the reads.
- Tests cover every intent of the resource action, and `calculateOccurrenceCost` has its own tests.

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
