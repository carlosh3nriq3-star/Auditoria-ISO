
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
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                return response;
            }

            const responseToCache = response.clone();
            
            if (!event.request.url.includes('generativelanguage.googleapis.com')) {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }

            return response;
        })
        .catch(() => {
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
            });
        })
    );
});
