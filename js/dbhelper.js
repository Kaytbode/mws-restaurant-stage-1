// Register a service worker
/**
 * Common database helper functions.
 */
class DBHelper {
  //Register a service worker
  // Service worker background sync
  //https://developers.google.com/web/updates/2015/12/background-sync
  //https://jakearchibald.github.io/isserviceworkerready/demos/sync/
  static registerSW() {
      navigator.serviceWorker.register('./sw.js').then(reg=>{
        if(!navigator.serviceWorker.controller)return;
        console.log('sw registered')
        return reg.sync.getTags();
      }).then(tags=>{
          if(tags.includes('syncForms')) console.log('background sync pending');
      }).catch(err=>{
          console.log('sync not supported or flag not enabled');
          console.log(err.message);
      });
  }
  // sync service worker
  static syncSW() {
    navigator.serviceWorker.ready.then(swRegistration=>{
      console.log('service worker ready')
      return swRegistration.sync.register('syncForms');
     })
    .then(()=> console.log('syncForms registered'))
    .catch(()=> {
      console.log('syncForms failed');
    })
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  //Initialize database to store network responses from server
  static initializeDatabase(){
    const dbPromise = idb.open('restaurant-reviews', 2, upgradeDb=>{
      switch(upgradeDb.oldVersion){
        case 0:
          upgradeDb.createObjectStore('restaurantsById', {keyPath: 'id'});
        case 1:
          upgradeDb.createObjectStore('reviews', {keyPath: 'name'});
      }    
    });

    return dbPromise;
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
   fetch(DBHelper.DATABASE_URL)
      .then(response=> response.json())
      .then(restaurants=> {
        callback(null, restaurants);
        //cache response for offline using indexDb 
        const dbPromise = DBHelper.initializeDatabase();
        dbPromise.then(db=>{
          if(!db) return;

          const tx = db.transaction('restaurantsById', 'readwrite');
          const store= tx.objectStore('restaurantsById');

          for(const restaurant of restaurants){
            store.put(restaurant);
          }

          return tx.complete;
        });
      })
      .catch(err=> callback(err, null)); 
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    if(navigator.onLine){
      const idUrl = `http://localhost:1337/restaurants/${id}`;
      fetch(idUrl)
          .then(response=> response.json())
          .then(restaurant=> callback(null, restaurant))
          .catch(err=> callback(error, null));
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        return store.get(+id);
      }).then(restaurant=> callback(null, restaurant));
    }
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    if(navigator.onLine){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          const results = restaurants.filter(r => r.cuisine_type == cuisine);
          callback(null, results);
        }
      });
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        store.getAll().then(restaurants=>{
          // Filter restaurants to have only given cuisine type
          const results = restaurants.filter(r => r.cuisine_type == cuisine);
          callback(null, results);
        });
      });
    }
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    if(navigator.onLine){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          callback(null, results);
        }
      });
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        store.getAll().then(restaurants=>{
          // Filter restaurants to have only given neighborhood
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          callback(null, results);
        });
      });
    }
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    if(navigator.onLine){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          let results = restaurants
          if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          callback(null, results);
        }
      });
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        store.getAll().then(restaurants=>{
          let results = restaurants
          if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          callback(null, results);
        });
      });
    }
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    if(navigator.onLine){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        }
      });
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        store.getAll().then(restaurants=>{
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        });
      });
    }
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    if(navigator.onLine){
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        }
      });
    }
    else{
      const dbPromise = DBHelper.initializeDatabase();
      dbPromise.then(db=>{
        const store = db.transaction('restaurantsById').objectStore('restaurantsById');
        store.getAll().then(restaurants=>{
          // Get all neighborhoods from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        });
      });
    }
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return ([`/images/${restaurant.photograph[0]}`, 
            `/images/${restaurant.photograph[1]} 2x`,
            `/images/${restaurant.photograph[2]} 1x, /images/${restaurant.photograph[3]} 2x`
         ]);
  }
  
  // we are offline, post review to indexDb
  static postReviewToIdb(formReview) {
    const info = document.querySelector('.no-reviews');
    const data = {};

      // Get form review data
      for(const ppty of formReview.entries()) {
        data[ppty[0]] = ppty[1];
      }
    
      const dbPromise = DBHelper.initializeDatabase();

      dbPromise.then(db=>{
        if(!db) return;

        const tx = db.transaction('reviews', 'readwrite').objectStore('reviews');

        tx.put(data);

        return tx.complete;
      });

      info.style.color = "red";
      info.textContent = `Review will be submitted when server comes online`;
    
  }
  // Post review about restaurants
  static postReview() {
    const form = document.getElementById('review-form')
    const formReview = new FormData(form);
    const info = document.querySelector('.no-reviews');
    
    if(!navigator.onLine){
      /*
         service worker background sync
         we only want to notify sw of a sync when we are offline
         or cannot connect to server
      */ 
      DBHelper.syncSW();
      //post review to idb
      DBHelper.postReviewToIdb(formReview);
    }
    
    // we are online post to server
    fetch("http://localhost:1337/reviews/",{
      method: 'POST',
      body: formReview
    })
    .then(response=> {
      return response.json();
    })
    .then((data)=> {
      info.style.color = "green";
      info.textContent = `Review submitted successfully!`;
    })
    .catch(()=> {
       //background service worker sync
       DBHelper.syncSW();
       //Network error : cannot find server
      //lets put the review in indexDb,
      DBHelper.postReviewToIdb(formReview);
    });
  }
  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
      })
      marker.addTo(newMap);
    return marker;
  } 
 
}

