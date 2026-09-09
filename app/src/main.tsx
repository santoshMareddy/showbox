import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/screens.css';
import { useNav } from './nav/useNav';
import { MotionGlobalConfig } from 'framer-motion';

// Test hook: ?noanim=1 completes every animation instantly (used for screenshots).
if (new URLSearchParams(location.search).has('noanim')) MotionGlobalConfig.skipAnimations = true;
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__nav = useNav;
  import('./store/useStore').then((m) => { (window as unknown as Record<string, unknown>).__store = m.useStore; });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') useNav.getState().pop();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
