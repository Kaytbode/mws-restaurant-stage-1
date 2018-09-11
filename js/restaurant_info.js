let restaurant;
var newMap;
const form = document.getElementById('review-form');
const modal = document.querySelector('.modal');

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();

  //Hijack form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault();
   
    DBHelper.postReview(form);
    //close modal after submission
    closeModal(modal);
  });
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoia2F5dGJvZGUiLCJhIjoiY2prMHprZ21mMGJidDN2bXEwZmpqMWlnMyJ9.Nlxatou2UgUfYk-4mjsEOQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.textContent = restaurant.name;

  const restaurantId = document.getElementById('restaurant-id');
  restaurantId.value = restaurant.id;

  const address = document.getElementById('restaurant-address');
  address.textContent = restaurant.address;

  const sourceAbove400 = document.getElementById('srcset-above400');
  sourceAbove400.srcset = DBHelper.imageUrlForRestaurant(restaurant)[2];

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant)[0];
  image.srcset = DBHelper.imageUrlForRestaurant(restaurant)[1];
  image.alt = `${restaurant.name} in ${restaurant.neighborhood}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.textContent = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {  
    const row = hours.insertRow();

    const day = row.insertCell();

    const text = document.createTextNode(key);
    day.appendChild(text);

    const time = row.insertCell();

    const timeText = document.createTextNode(operatingHours[key]);
    time.appendChild(timeText);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  const title = document.createElement('h2');
  title.textContent = 'Reviews';
  container.appendChild(title);

  //modal
  const modal = document.querySelector('.modal');
  //button to close modal
  const closeModalBtn = modal.querySelector('.close-modal');
  //modal button to add reviews
  const addModal = document.createElement('button');
  addModal.textContent = 'Add New Review';
  addModal.classList.add('add-modal');
  addModal.addEventListener('click', function (){openModal(modal, closeModalBtn)});
  container.appendChild(addModal);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.textContent = 'No reviews yet!';
    noReviews.classList.add('no-reviews');
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review =>ul.appendChild(createReviewHTML(review)));
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  const nameAndDateBox = document.createElement('div');

  name.textContent = review.name;
  nameAndDateBox.appendChild(name);

  const date = document.createElement('p');
  date.textContent = review.date;
  nameAndDateBox.appendChild(date);
  li.appendChild(nameAndDateBox);

  const rating = document.createElement('p');
  rating.textContent = `Rating: ${review.rating}`;
  rating.setAttribute('class', 'rating');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.textContent = review.comments;
  comments.classList.add('comment');
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.textContent = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Launch modal to take in reviews
let focusedElementBeforeModal;

const modalOverlay = document.querySelector('.overlay');

const closeModal = (modal)=> {
    //hide the modal and overlay
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';

    //set focus back to the element that had it before it was opened
    focusedElementBeforeModal.focus();
}

const openModal = (modal, closeBtn)=>{
    //save current focus
    focusedElementBeforeModal = document.activeElement;
    // Listen for and trap the keyboard
    modal.addEventListener('keydown', trapTabKey);
    //Listen for indicators to close the modal
    modalOverlay.addEventListener('click', function(){closeModal(modal)});
    //close button
    closeBtn.addEventListener('click', function(){closeModal(modal)});
    //find focusable elements and convert nodelist to array
    let focusableElementsString = 'input:not([disable]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
    //remove hidden elements
    let focusableElements = [...modal.querySelectorAll(focusableElementsString)].filter(el=> !el.hidden);
    
    let firstTabStop = focusableElements[0],
        lastTabStop = focusableElements[focusableElements.length - 1];
    
    //show the modal and overlay
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';

    //focus first child
    firstTabStop.focus();

    function trapTabKey(event) {
        //check for tab key press
        if(event.key === 'Tab'){
            //shift + tab
            if(event.shiftkey){
                if(document.activeElement === firstTabStop){
                    event.preventDefault();
                    lastTabStop.focus();
                }
            }
            //tab
            else{
                if(document.activeElement === lastTabStop){
                    event.preventDefault();
                    firstTabStop.focus();
                }
            }
        }
        //escape
        if(event.key === 'Escape'){
            closeModal(modal);
        }
    }
}

// Take control of form submission
/*
 https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
*/

/*const postReview = ()=>{ 
  const formReview = new FormData(form);
  const info = document.querySelector('.no-reviews');

  // https://youtu.be/1nzCeB9sjWk?list=PLNYkxOF6rcIB1V2i_qfRtDMcY6YZK1lkt
  /*
    Content is being served from localhost, we actually do not 
    need to be online to get content. we only need the
    server to be up. Hence, no need to check the property navigator.onLine
  */
 /*
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
    // cannot find server
    // Network error
    
    info.style.color = "red";
    info.textContent = `Review will be submitted when server comes online`;
  });
}
*/
