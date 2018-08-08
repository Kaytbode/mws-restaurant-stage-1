const staticCacheName = 'restaurants-reviews-v1';

self.addEventListener('install', event=>{
    event.waitUntil(
        caches.open(staticCacheName).then(cache=>{
            return cache.addAll([
                '/',
                '/index.html',
                '/restaurant.html',
                '/css/below500.css',
                '/css/btw500and750.css',
                '/css/above750.css',
                '/data/restaurants.json',
                '/images',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/dbhelper.js'
            ]);
        })
    );
});