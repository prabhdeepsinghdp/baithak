const CACHE = 'baithak-v1';
const ASSETS = [
  '/baithak/',
  '/baithak/index.html',
  '/baithak/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always go network-first for Microsoft auth, OneDrive API, and audio file requests
  if (e.request.url.includes('microsoftonline') ||
      e.request.url.includes('graph.microsoft') ||
      e.request.url.includes('onedrive.live.com') ||
      e.request.url.includes('1drv.ms') ||
      e.request.url.includes('sharepoint.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    // Cache-first for app shell (fonts, icons, the HTML itself)
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
