# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

## Responsiveness
The static web page provided was made responsive, through the use of media queries for the layout. Images for various screens
display were created using grunt.
## the images directory contains all the images and remember to add .jpg to access through the webpage

##Accessibility
The webpage maintains a logical tab-order, for easy navigation through the webpage. ARIA attributes were added to improve semantics,
necessary for screen readers. 
Parts of the webpage that require interaction with users are focusable. Landmark elements do not have a tabindex attribute, since
users will not be interacting with them.
A high color contrast ratio was enforced throughout the webpage.

##Offline experience
The webpage is available offline through the use of a service worker and the cache API.


## Project Overview: Stage 2

##Application Data and Offline use
Using the fetch API, data received from the development server was used to render the appropriate sections of the webpage UI. The jSON response was cached using indexDb promised API, for offline use.


##Performance
To achieve the required ratings from lighthouse, a manifest.json file was added to the webpage. This ensures the app can be added to the homescreen by users.




