import { renderToString } from 'react-dom/server';

import LandingPage from './LandingPage';

export const render = () => {
  return renderToString(<LandingPage />);
};
