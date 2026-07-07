import { hydrateRoot } from 'react-dom/client';

import './landing.css';
import LandingPage from './LandingPage';

const container = document.getElementById('root');

if (container) {
  hydrateRoot(container, <LandingPage />);
}
