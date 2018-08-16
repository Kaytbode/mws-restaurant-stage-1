const staticCacheName = 'restaurants-reviews-v1';
const contentImgsCache = 'restaurants-contents-imgs';
const allCaches = [
    staticCacheName,
    contentImgsCache
];

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
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/dbhelper.js',
                '/js/idb.js',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
            ]);
        })
    );
});
/*
self.addEventListener('activate', event=>{
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.filter(cacheName=>{
                    return cacheName.startsWith('restaurants-')&&
                    !allCaches.includes(cacheName);
                }).map(cacheName=> caches.delete(cacheName))
            );
        })
    );
});
*/
self.addEventListener('fetch', event=>{
    const requestUrl = new URL(event.request.url);
    // restaurants images
    if(requestUrl.pathname.startsWith('/images/')) {
        event.respondWith(servePhoto(event.request));
        return;
    }
    //map images
    if(requestUrl.pathname.startsWith('/v4/mapbox.streets/')) {
        event.respondWith(servePhoto(event.request));
        return;
    }
    //map icon images
    if(requestUrl.pathname.startsWith('/leaflet@1.3.1/dist/images/')) {
        event.respondWith(servePhoto(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request, {ignoreSearch: true}).then(response=>{
            if(response){
                return response;
            }
            //https://developers.google.com/web/fundamentals/primers/service-workers/
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(response=>{
                if(!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();

                caches.open(staticCacheName)
                .then(cache=> cache.put(event.request, responseToCache));

                event.respondWith(servePhoto(event.request));

                return response;
            });
        })
    );
});


const servePhoto = request=>{
    let storageUrl = request.url;

    return caches.open(contentImgsCache).then(cache=>{
        return cache.match(storageUrl).then(response=>{
            if(response){
                return response;
            }
            return fetch(request).then(networkResponse=>{
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });    
};
