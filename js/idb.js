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

    // Create an objectStore to hold information about our customers. We're
    // going to use "id" as our key path because it's guaranteed to be unique
    var objectStore = db.createObjectStore("restaurants", { keyPath: "id" });

    // Create an index to search customers by name. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex("name", "name", { unique: false });

    // Create an index to search customers by email. We want to ensure that
    // no two customers have the same email, so use a unique index.
    //objectStore.createIndex("email", "email", { unique: true });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = function(event) {
        // Store values in the newly created objectStore.
        var customerObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
        customerData.forEach(function(restaurant) {
            customerObjectStore.add(restaurant);
        });
    };
};