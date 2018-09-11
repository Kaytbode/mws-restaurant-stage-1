// Register a service worker
/**
 * Common database helper functions.
 */
class DBHelper {
  //Register a service worker
  static registerSW() {
      navigator.serviceWorker.register('./sw.js').then(reg=>{
      if(!navigator.serviceWorker.controller){
        return;
      }
      });
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
          upgradeDb.createObjectStore('reviews', {keyPath: 'restaurant_id'});
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

  // Post review about restaurants
  static postReview(form) {
    const formReview = new FormData(form);
    const info = document.querySelector('.no-reviews');
    /*
      Content is being served from localhost, we actually do not 
      need to be online to get content. we only need the
      server to be up. Hence, no need to check the property navigator.onLine
    */
    fetch("http://localhost:1337/reviews/",{
      method: 'POST',
      body: formReview
    })
    .then(response=> {
      response.json();
    })
    .then(()=> {
      info.style.color = "green";
      info.textContent = `Review submitted successfully!`;
    })
    .catch(()=> {
      /* 
         Network error : cannot find server
         lets put the review in indexDb,
         to be posted later to the server
      */
      const data = {};
      // Get form review data
      for(const ppty of formReview.entries()) {
        data[ppty[0]] = ppty[1];
      }
    
      // store review in indexDb
      const dbPromise = DBHelper.initializeDatabase();

      dbPromise.then(db=>{
        if(!db) return;

        const tx = db.transaction('reviews', 'readwrite').objectStore('reviews');

        tx.put(data);

        return tx.complete;
      });

      info.style.color = "red";
      info.textContent = `Review will be submitted when server comes online`;
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

