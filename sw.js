const CACHE_NAME = 'iso-audit-assistant-v5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/components/AuditInfoForm.tsx',
  '/components/Checklist.tsx',
  '/components/ChecklistItem.tsx',
  '/components/ComplianceChart.tsx',
  '/components/Dashboard.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/ReportGenerator.tsx',
  '/components/RequirementsChart.tsx',
  '/components/SideNav.tsx',
  '/components/StatusSelector.tsx',
  '/components/SummaryCard.tsx',
  '/components/UserManagement.tsx',
  '/components/Login.tsx',
];

// Pre-cache the application shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Serve cached content when offline using a stale-while-revalidate strategy.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Check for a valid response to cache.
        // We also check the URL to avoid caching browser extension requests.
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith('http')) {
            // We need to clone the response because it's a stream that can only be consumed once.
            cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(error => {
        // The fetch failed, probably because the user is offline.
        // The cachedResponse will be used in this case if it exists.
        console.log('Fetch failed; user is likely offline.', error);
      });

      // Return the cached response if it exists, otherwise wait for the network response.
      return cachedResponse || fetchPromise;
    })
  );
});

// Clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});