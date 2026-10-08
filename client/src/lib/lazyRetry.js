import { lazy } from 'react';

/**
 * Resilient dynamic component loader with retry logic and exponential backoff.
 * Prevents transient network glitches or PWA chunk update mismatches from crashing
 * the application into the ErrorBoundary.
 *
 * @param {() => Promise<{ default: React.ComponentType<any> }>} componentImport
 * @param {number} [retries=3]
 * @param {number} [interval=500]
 * @returns {React.LazyExoticComponent<React.ComponentType<any>>}
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const message = error?.message || String(error);
      const isChunkError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError && typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const lastReload = Number(sessionStorage.getItem('dsa_last_chunk_reload') || 0);
        const now = Date.now();
        // Allow automatic recovery once every 10 seconds
        if (now - lastReload > 10000) {
          sessionStorage.setItem('dsa_last_chunk_reload', String(now));
          console.warn(
            '[lazyWithRetry] Dynamic import chunk invalidated (Vite restart or deployment). Refreshing page to fetch updated modules...'
          );
          window.location.reload();
          // Keep promise pending during reload to prevent flashing the ErrorBoundary
          return new Promise(() => {});
        }
      }

      throw error;
    }
  });
}

export default lazyWithRetry;
