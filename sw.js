
const myCacheName = 'indexDB-v1'
const cacheItems = [
    '/index.html',
    '/css/bootstrap-grid.min.css',
    '/css/bootstrap-reboot.min.css',
    '/css/bootstrap-utilities.min.css',
    '/css/bootstrap.min.css',
    '/css/style.css',
    '/js/base.js',
    '/js/script.js',
]

// Install 
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(myCacheName)
        .then(cache => {
            cache.addAll(cacheItems)
        }).then(()=> self.skipWaiting())
    )
})


// Activate
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => (
            Promise.all(
                cacheNames.map(cacheName => {
                    if(cacheName !== myCacheName){
                        caches.delete(cacheName)
                    }
                })
            )
        ))
    )
})


// Fetch
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(res => res)
            .catch(err => caches.match(e.request).then(res => res))
    )
})
