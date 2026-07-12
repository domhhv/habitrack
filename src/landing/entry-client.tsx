import { createRoot, hydrateRoot } from 'react-dom/client';

import './landing.css';
import LandingPage from './LandingPage';

const container = document.getElementById('root');

if (container) {
  if (container.childElementCount > 0) {
    hydrateRoot(container, <LandingPage />);
  } else {
    createRoot(container).render(<LandingPage />);
  }
}
