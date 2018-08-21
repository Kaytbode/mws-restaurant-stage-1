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




