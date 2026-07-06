import { createRoot } from 'react-dom/client';

import './landing.css';
import LandingPage from './LandingPage';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(<LandingPage />);
}
