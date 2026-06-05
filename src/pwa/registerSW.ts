/**
 * Guarded service worker registration.
 * - Never registers in Lovable preview/dev/iframe contexts.
 * - Supports ?sw=off kill switch.
 */
export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const url = new URL(window.location.href);
  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const killed = url.searchParams.get('sw') === 'off';

  const blockedHosts =
    host.startsWith('id-preview--') ||
    host.startsWith('preview--') ||
    host === 'lovableproject.com' || host.endsWith('.lovableproject.com') ||
    host === 'lovableproject-dev.com' || host.endsWith('.lovableproject-dev.com') ||
    host === 'beta.lovable.dev' || host.endsWith('.beta.lovable.dev');

  const shouldRegister = import.meta.env.PROD && !inIframe && !blockedHosts && !killed;

  if (!shouldRegister) {
    // Clean up any stale registration for /sw.js
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => {
        if (r.active?.scriptURL.endsWith('/sw.js')) r.unregister();
      });
    }).catch(() => {});
    return;
  }

  import('workbox-window').then(({ Workbox }) => {
    const wb = new Workbox('/sw.js');
    wb.register().catch(() => {});
  }).catch(() => {});
}
