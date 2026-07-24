import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('/', 'landing/LandingPage.tsx'),
  route('/calendar', 'App.tsx'),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route('*?', 'catchall.tsx'),
] satisfies RouteConfig;
