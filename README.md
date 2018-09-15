# Mobile Web Specialist Certification Course - Restaurant Reviews
---
## About Project
Conversion of a static website to an offline mobile ready responsive web application.

## Project Overview: Stage 1

### Responsiveness
Responsive layouts across various screens was achieved using CSS grid and employment of media queries. The `Grunt` task runner 
was installed and used to generate images of different sizes. This ensures that the right image is downloaded for the right
screen width, thus helping to reduce latency. 

### Accessibility
The HTML structure and CSS styles were adjusted to ensure the web application maintains a logical tab-order, for easy navigation through the webpage. ARIA attributes were added to HTML elements to improve semantics, which is necessary for users of assistive technologies. 
Parts of the webpage that require interaction with users are focusable.**_Landmark elements do not have a tabindex attribute, since users will not be interacting with them._** Using the [WebAim color contrast checker as guide](https://webaim.org/resources/contrastchecker/), A high color contrast ratio was enforced throughout the webpage.

### Offline experience
A **service worker** was registered, and with the use of the **cache API**, the application's static assets and images were effectively cached, thus making the application usable even without a connection.


## Project Overview: Stage 2

### Application Data and Offline use
The source of the application data was changed from local storage to a development server. Using the fetch API, data received from the development server was converted to jSON, and used to render the appropriate sections of the web application UI. The jSON response was also cached using [indexDb promised API](https://github.com/jakearchibald/idb), for future offline use.


### Performance
To optimize the web application, a _manifest.json file_ was added to the webpage. This ensures the application can be added to the homescreen by users.

## Project Overview: Stage 3

### Toggle favourite restaurant
Use GET HTTP request to fetch the restaurant from server, and used the PUT request to alter the value. users can see their favourite 
restaurants with a **golden star** among the pack.

### Add a Form to submit reviews
A button was added to launch a **modal with form elements** when clicked. The form can be filled offline and submission deferred till 
connection comes back on. This was achieved through the use of service worker background sync, and indexedDb promised. 

The default behaviour of the form submission is hijacked, and the contents posted to indexDb, while a message is sent to the service worker sync event. The service worker performs a one time sync, and all reviews in database are sent to the server according to the 
time of entry. The service worker sync event handles all **POST** requests even when online, as this protects against navigation and tab closures during data send. Entries in the database are deleted after they have been posted to the server.

For browsers that do not support service workers or background sync, forms are submitted the default way.


