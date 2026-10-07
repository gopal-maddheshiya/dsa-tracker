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
export function lazyWithRetry(componentImport, retries = 3, interval = 500) {
  return lazy(() =>
    new Promise((resolve, reject) => {
      const execute = (attemptsLeft, currentDelay) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            // Check if error is related to dynamic import / chunk fetch failure
            const isChunkError =
              error?.message?.includes('Failed to fetch dynamically imported module') ||
              error?.message?.includes('Importing a module script failed') ||
              error?.name === 'ChunkLoadError';

            if (attemptsLeft > 0) {
              console.warn(
                `[lazyWithRetry] Dynamic import failed (${attemptsLeft} retries left). Retrying in ${currentDelay}ms...`,
                error
              );
              setTimeout(() => {
                execute(attemptsLeft - 1, currentDelay * 1.5);
              }, currentDelay);
            } else if (isChunkError) {
              // If completely exhausted and in a production build, try a single session-guarded reload
              const hasReloadedKey = `dsa_chunk_reload_${window.location.pathname}`;
              const hasReloaded = sessionStorage.getItem(hasReloadedKey);
              if (!hasReloaded) {
                sessionStorage.setItem(hasReloadedKey, 'true');
                console.warn('[lazyWithRetry] Refreshing page to fetch updated application bundle...');
                window.location.reload();
                return;
              }
              sessionStorage.removeItem(hasReloadedKey);
              reject(error);
            } else {
              reject(error);
            }
          });
      };

      execute(retries, interval);
    })
  );
}

export default lazyWithRetry;
