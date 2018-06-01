let restaurant;
let reviews;
var map;

//let cached_reviews;


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
        var transaction = db.transaction("reviews", "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function(event) {
        };

        transaction.onerror = function(event) {
        };

        // create an object store on the transaction
        var objectStore = transaction.objectStore("reviews");

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


    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("favorite-db", 1);

    // Create the schema
    open.onupgradeneeded = function() {
        var db = open.result;
        var store = db.createObjectStore("favorite", {keyPath: "id"});
        var index = store.createIndex("NameIndex", "id");
    };

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("favorite", "readwrite");
        var store = tx.objectStore("favorite");
        var index = store.index("NameIndex");

        if (flag)
            flag = 1;
        else flag = 0;
        // Add some data
        store.put({id: getParameterByName('id'), flag: flag});
        //store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});


        //sprawdzic czy istnieje
        var getJohn = store.get(2);
        getJohn.onsuccess = function() {
            console.log(getJohn.result.flag);  // => "John"
        };

        /*// Query the data
        var getJohn = store.get(67890);
        //var getBob = index.get(["Smith", "Bob"]);

        getJohn.onsuccess = function() {
            console.log(getJohn.result.name.first);  // => "John"
        };

        getBob.onsuccess = function() {
            console.log(getBob.result.name.first);   // => "Bob"
        };*/

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };
    }



    if (flag)
        fetch(`http://localhost:1337/restaurants/${getParameterByName('id')}/?is_favorite=true`, {method: 'PUT'});
    else
        fetch(`http://localhost:1337/restaurants/${getParameterByName('id')}/?is_favorite=false`, {method: 'PUT'})
}


function addReview(name, rating, comment) {
    console.log("asdsa")
    if (name != null & rating != null & comment != null) {

        var data = {
            'restaurant_id': getParameterByName('id'),
            'name': name,
            'rating': rating,
            'comments': comment
        };

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
        .then(() => {
            document.getElementById("reviews-form").style.display = "none";
            document.getElementById("reviews-header").innerText = "Review added!"
        })
        .then(() => clearDatabase())
        .catch(function(){
            document.getElementById("reviews-form").style.display = "none";
            document.getElementById("reviews-header").innerText = "Review will be added if you are online!";
            saveReview(name, rating, comment, 58)
        });

    }
}

/**
 * Save review to IndexedDb.
 */
function saveReview(name, rating, comment, id) {

    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    var open = indexedDB.open("reviews-db", 1);

    // Create the schema
    open.onupgradeneeded = function() {
        var db = open.result;
        var store = db.createObjectStore("reviews", {keyPath: "id"});
        var index = store.createIndex("NameIndex", "name");
    };

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("reviews", "readwrite");
        var store = tx.objectStore("reviews");
        var index = store.index("NameIndex");

        // Add some data
        store.put({id: id, name: name, rating: rating, comment: comment});
        //store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});

        /*// Query the data
        var getJohn = store.get(67890);
        //var getBob = index.get(["Smith", "Bob"]);

        getJohn.onsuccess = function() {
            console.log(getJohn.result.name.first);  // => "John"
        };

        getBob.onsuccess = function() {
            console.log(getBob.result.name.first);   // => "Bob"
        };*/

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };
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
