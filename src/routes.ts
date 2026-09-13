import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('landing/LandingPage.tsx'),
  route('*', 'App.tsx'),
] satisfies RouteConfig;
