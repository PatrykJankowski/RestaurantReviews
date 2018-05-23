let restaurant;
let reviews;
var map;

let cached_reviews;


function clearDatabase() {
    var DBOpenRequest = window.indexedDB.open("reviews-db", 1);

    DBOpenRequest.onsuccess = function(event) {
        // store the result of opening the database in the db variable.
        // This is used a lot below
        db = DBOpenRequest.result;

        // Clear all the data form the object store
        clearData();
    };

    function clearData() {
        // open a read/write db transaction, ready for clearing the data
        var transaction = db.transaction(["Reviews"], "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
        };

        transaction.onerror = function(event) {
        };

        // create an object store on the transaction
        var objectStore = transaction.objectStore("Reviews");

        // Make a request to clear all the data out of the object store
        var objectStoreRequest = objectStore.clear();

        objectStoreRequest.onsuccess = function(event) {
            // report the success of our request
        };
    };
}


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {

    function check() {
        fetch('http://localhost:1337/restaurants/?is_favorite=true')
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                for (let key in myJson) {
                    //console.log(myJson[key].is_favorite);
                    if (myJson[key].id == getParameterByName('id')) {
                        document.getElementById('fav').checked = true;
                        return true;
                    }
                    else {
                        document.getElementById('fav').checked = false;
                    }
                }
            });
    }

    check();








    // Let us open our database
    var DBOpenRequest = window.indexedDB.open("reviews-db", 1);

    DBOpenRequest.onsuccess = function(event) {
        console.log('Database initialised');

        // store the result of opening the database in the db variable.
        // This is used a lot below
        db = DBOpenRequest.result;

        // Run the getData() function to get the data from the database
        getData();
    };

    function getData() {
        // open a read/write db transaction, ready for retrieving the data
        var transaction = db.transaction('Reviews', 'readwrite');

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
            console.log('Transaction completed');
        };

        transaction.onerror = function(event) {
            console.log('Transaction not opened due to error:');
        };

        // create an object store on the transaction
        var objectStore = transaction.objectStore("Reviews");

        // Make a request to get a record by key from the object store
        var objectStoreRequest = objectStore.getAll();

        objectStoreRequest.onsuccess = function(event) {
            // report the success of our request

            var myRecord = objectStoreRequest.result;

            for (record of myRecord) {
                addReview(record.name, record.rating, record.comment, 66)
            }


        };

    };








    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL';
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
};

/*fetchReviews = (callback) => {
    DBHelper.fetchReviews((error, reviews) => {
        self.reviews = reviews;
        if (!reviews) {
            console.error(error);
            return;
        }
        //fillRestaurantHTML();
        callback(null, reviews)
    });
};*/

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = 'An image of ' + restaurant.name + ' Restaurant in ' + restaurant.neighborhood;
    image.src = DBHelper.imageUrlForRestaurant(restaurant);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML2();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};




/*fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = DBHelper.fetchReviews(reviews);
    console.log(DBHelper.fetchReviews(reviews));
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}*/



function fillReviewsHTML2() {
    fetch('http://localhost:1337/reviews/?restaurant_id=' + getParameterByName('id'))
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }

                // Examine the text in the response
                response.json().then(function(reviews) {
                    //console.log(restaurant_id);
                    console.log(reviews);
                    const container = document.getElementById('reviews-container');
                    const title = document.createElement('h2');
                    title.innerHTML = 'Reviews';
                    container.appendChild(title);

                    if (!reviews) {
                        const noReviews = document.createElement('p');
                        noReviews.innerHTML = 'No reviews yet!';
                        container.appendChild(noReviews);
                        return;
                    }
                    const ul = document.getElementById('reviews-list');
                    reviews.forEach(review => {
                        ul.appendChild(createReviewHTML(review));
                    });
                    container.appendChild(ul);
                    //return restaurants;
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}

function addToFavourites(flag) {

    if (flag)
        fetch(`http://localhost:1337/restaurants/${getParameterByName('id')}/?is_favorite=true`, {method: 'PUT'});
    else
        fetch(`http://localhost:1337/restaurants/${getParameterByName('id')}/?is_favorite=false`, {method: 'PUT'})
}


function addReview(name, rating, comment) {

    if (name != null & rating != null & comment != null)
        var data = {
            'restaurant_id': getParameterByName('id'),
            'name': name,
            'rating': rating,
            'comments': comment
        };

    //saveReview(name, rating, comment, 58);

    return fetch('http://localhost:1337/reviews/', {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    })
        .then(response => console.log(response.json()))
        .then(() => clearDatabase())
        .catch(function(){
            saveReview(name, rating, comment, 58)
        }); /*.then(() => saveReview(name, rating, comment, 56))*/ // parses response to JSON
}

/**
 * Save review to IndexedDb.
 */
function saveReview(name, rating, comment, id) {

    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    let open = indexedDB.open('reviews-db', 1);

    // Create the schema
    open.onupgradeneeded = function() {
        let db = open.result;
        let store = db.createObjectStore('Reviews', {keyPath: 'name'});
        let index = store.createIndex('NameIndex', 'name');
/*
        alert('upgrrrradeeee');
*/
    };

    /*open.onupgradeneeded = function(event) {
        console.log('Performing upgrade');
        var db = event.target.result;
        console.log('Creating object store');
        db.createObjectStore('mystore');
    };
*/
    open.onsuccess = function() {
        // Start a new transaction
        let db = open.result;
        let tx = db.transaction('Reviews', 'readwrite');
        let store = tx.objectStore('Reviews');
        let index = store.index('NameIndex');

        // Add some data
        store.add({id: id, name: name, rating: rating, comment: comment});
/*
        alert('aaaaaaaaaadddeeeddddddddddddddd');
*/
        // Query the data
        //var getJohn = store.get(22);
        //var getBob = index.get(['Smith', 'Bob']);

        //getJohn.onsuccess = function () {
        //    console.log(getJohn.result.name);  // => 'John'
        //};

        //getBob.onsuccess = function () {
        //    console.log(getBob.result.name.first);   // => 'Bob'
        //};

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function () {
    }

}


/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = fillReviewsHTML2()) => {
    console.log(fillReviewsHTML2());
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const nameAndDate = document.createElement('p');
    let date = new Date(review.createdAt);
    nameAndDate.innerHTML = `${review.name}, ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
    li.appendChild(nameAndDate);

    /*const date = document.createElement('p');
    date.innerHTML = review.date;
    li.appendChild(date);*/

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
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
};
