import Rollbar from 'rollbar';

export default new Rollbar({
  accessToken: ROLLBAR_CLIENT_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: ROLLBAR_CLIENT_ENV,
  payload: {
    client: {
      javascript: {
        code_version: VERCEL_GIT_COMMIT_SHA || '0.1.0',
        source_map_enabled: true,
      },
    },
  },
  replay: {
    enabled: true,
  },
});
