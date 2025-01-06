/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Handle external links
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async (): Promise<Response> => {
        try {
          // Try to perform the regular fetch
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          return await fetch(event.request);
        } catch {
          // If fetch fails, return the offline page
          const cache = await caches.open('offline-cache');
          return (await cache.match('/offline.html')) ?? new Response('Offline');
        }
      })(),
    );
  }
});
