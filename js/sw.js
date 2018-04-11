var filesToCache = [
    '../',
    '../index.html',
    '../restaurant.html',
    '../img/',
    '../img/1.jpg',
    '../img/2.jpg',
    '../img/3.jpg',
    '../img/4.jpg',
    '../img/5.jpg',
    '../img/6.jpg',
    '../img/7.jpg',
    '../img/8.jpg',
    '../img/9.jpg',
    '../img/10.jpg',
    '../img/undefined.jpg',
    '../js/',
    '../js/dbhelper.js',
    '../js/main.js',
    '../js/restaurant_info.js',
    '../css/styles.css',
    '../data/restaurants.json'

];

var staticCacheName = 'cache-v1';

self.addEventListener('install', function(event) {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
        caches.open(staticCacheName)
            .then(function(cache) {
                return cache.addAll(filesToCache);
            })
    );


    /*

    /!**
     * Save restaurants info to IndexedDb.
     *!/

    let restaurants = ;

        // fetch all restaurants with proper error handling.
        if (restaurants) { // Got the restaurant


            if (!window.indexedDB) {
                window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
            }

            const dbName = "restaurants-db";

            var request = indexedDB.open(dbName, 1);

            request.onerror = function(event) {
                // Handle errors.
            };
            request.onupgradeneeded = function(event) {
                var db = event.target.result;

                // Create an objectStore to hold information about restaurants. We're
                // going to use "id" as our key path because it's guaranteed to be unique
                var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });

                // Create an index to search restaurants by name. We may have duplicates
                // so we can't use a unique index.
                objectStore.createIndex("name", 'name', { unique: false });


                // Use transaction oncomplete to make sure the objectStore creation is
                // finished before adding data into it.
                objectStore.transaction.oncomplete = function(event) {
                    // Store values in the newly created objectStore.

                    console.log(typeof customerData);
                    console.log(typeof restaurants);

                    var customerObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
                    restaurants.forEach(function(rest) {
                        customerObjectStore.add(rest);
                    });
                };
            };
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }


        */


});


self.addEventListener('fetch', function(event) {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                console.log('Found ', event.request.url, ' in cache');
                return response;
            }
            console.log('Network request for ', event.request.url);
            return fetch(event.request)

                .then(function(response) {

                    return caches.open(staticCacheName).then(function(cache) {
                        if (event.request.url.indexOf('test') < 0) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    });
                });

        }).catch(function(error) {})
    );
});



self.addEventListener('activate', function(event) {
    console.log('Activating new service worker...');

    var cacheWhitelist = [staticCacheName];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});




/*
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll(
                [
                    '/',
                    '/index.html',
                    '/restaurant.html',
                    'img/1.jpg',
                    'img/2.jpg',
                    'img/3.jpg',
                    'img/4.jpg',
                    'img/5.jpg',
                    'img/6.jpg',
                    'img/7.jpg',
                    'img/8.jpg',
                    'img/9.jpg',
                    'img/10.jpg',
                    'js/dbhelper.js',
                    'js/main.js',
                    'js/restaurant_info.js',
                    'css/style.css',
                    'data/restaurant.json'
                ]
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open('v1')
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
*/
