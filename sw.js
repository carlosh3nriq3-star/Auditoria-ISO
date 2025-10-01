
const CACHE_NAME = 'iso-audit-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/components/SideNav.tsx',
  '/components/AuditInfoForm.tsx',
  '/components/Checklist.tsx',
  '/components/ChecklistItem.tsx',
  '/components/StatusSelector.tsx',
  '/components/Dashboard.tsx',
  '/components/SummaryCard.tsx',
  '/components/ComplianceChart.tsx',
  '/components/RecentNonConformities.tsx',
  '/components/ReportGenerator.tsx',
  '/components/RequirementsChart.tsx',
  '/components/UserManagement.tsx',
  '/components/Login.tsx',
  '/components/ActionPlanManagement.tsx',
  '/components/LandingPage.tsx',
  '/components/Header.tsx',
  '/components/RoleManagement.tsx',
  '/components/AuditHistory.tsx',
  '/components/CompletedAuditView.tsx',
];

// Install event: pre-caches the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Fetch event: serves assets from cache or network.
// Strategy: Network falling back to cache. Updates cache on successful network response.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();
            
            // Do not cache calls to the Gemini API
            if (!event.request.url.includes('generativelanguage.googleapis.com')) {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }

            return response;
        })
        .catch(() => {
            // Network request failed, try to get it from the cache.
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                // If not in cache, the request will fail.
                // You could return a custom offline page here if you had one.
            });
        })
    );
});
