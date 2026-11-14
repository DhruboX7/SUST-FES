import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure stale service workers from prior preview/prod builds do not serve broken lazy chunks in dev
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => {
      regs.forEach((reg) => {
        reg.unregister().catch(() => {});
      });
    })
    .catch(() => {});
  if ('caches' in window) {
    caches.keys()
      .then((keys) => {
        keys.forEach((k) => {
          caches.delete(k).catch(() => {});
        });
      })
      .catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(<App />);
