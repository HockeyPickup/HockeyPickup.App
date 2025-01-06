/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Handle external links
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async (): Promise<Response> => {
        try {
          // First try to get the preloaded response
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Otherwise do a normal fetch
          return await fetch(event.request);
        } catch {
          const cache = await caches.open('offline-cache');
          return (await cache.match('/offline.html')) ?? new Response('Offline');
        }
      })(),
    );
  }
  // For all other requests (images, API calls, etc), just pass through
  return;
});
