import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = { 
    apiKey: "AIzaSyC9-uK5LoUDBrLrCtYXn35H14w5n6mI780",
    authDomain: "test-30323.firebaseapp.com",
    databaseURL: "https://test-30323-default-rtdb.firebaseio.com",
    projectId: "test-30323",
    storageBucket: "test-30323.appspot.com",
    messagingSenderId: "523076581955",
    appId: "1:523076581955:web:6f214a901141244ca832f6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
// restaurant UIDs
let uids = []; // Declare uids array globally

const restaurantsRef = ref(db, 'restaurants'); // Reference to the 'restaurants' node in the Realtime Database

function fetchUidsFromDatabase() {
  return new Promise((resolve, reject) => {
    get(restaurantsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const uid = childSnapshot.key; // Get the UID
            uids.push(uid); // Store the UID in the array
            console.log(uid); // Log the UID to the console
          });
          resolve(uids);
        } else {
          console.log("No data available");
          reject("No data available");
        }
      })
      .catch((error) => {
        console.error("Error getting data:", error);
        reject(error);
      });
  });
}

// Call the function that fetches the UIDs and use them when it's resolved
fetchUidsFromDatabase()
  .then((uids) => {
    console.log("UIDs from another function:", uids);
    // You can use 'uids' here or pass them to other functions as needed
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Function to display the list of restaurants
let restaurantsData = [];

// Function to fetch and display the list of restaurants when the page loads
async function loadRestaurants() {
    const restaurantsRef = ref(db, "restaurants");
    const snapshot = await get(restaurantsRef);

    if (snapshot.exists()) {
        restaurantsData = Object.values(snapshot.val());
        // Store restaurant data in the array
        displayRestaurants(restaurantsData);
    } else {
        // Handle the case where no restaurants are found
        document.getElementById("restaurantsList").innerHTML = "<p>No restaurants found.</p>";
    }
}

// Function to display the list of restaurants
function displayRestaurants(restaurants) {
    const restaurantsList = document.getElementById("restaurantsList");
    restaurantsList.innerHTML = ""; // Clear previous content
    console.log(restaurants)
    restaurants.forEach((restaurant) => {
        const restaurantCard = document.createElement("div");
        restaurantCard.className = "card";
        restaurantCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${restaurant.name}</h5>
                <button class="btn btn-warning" id="viewDishesBtn_${restaurant.id}">View Dishes</button>
            </div>
        `;

        // Add an event listener to view dishes for this restaurant
        const viewDishesBtn = restaurantCard.querySelector(`#viewDishesBtn_${restaurant.id}`);
        viewDishesBtn.dataset.restaurant = JSON.stringify(restaurant); // Store the restaurant object as a data attribute
        viewDishesBtn.addEventListener("click", () => {
            displayRestaurantDishes(restaurant);
        });     

        restaurantsList.appendChild(restaurantCard);
    });
}

// Function to display dishes for a specific restaurant
function displayRestaurantDishes(restaurant) {
   { console.log("Displaying dishes for restaurant:", restaurant);

    // Access restaurant's dishes property to display the dishes
        const dishes = Object.values(restaurant.dishes);
        
    console.log(dishes);
   
    const dishesModal = document.getElementById("dishesModal");
    const dishesContainerModal = document.getElementById("dishesContainerModal");
    dishesContainerModal.innerHTML = "";

    // Track selected dishes
    let selectedDishes = {};

    dishes.forEach((dish) => {
        // Create a new dish element
        const dishElement = document.createElement("div");
        dishElement.classList.add("dish-item");

        // Initially, set the background color to white (unselected)
        dishElement.style.backgroundColor = 'white';

        // Add a click event to toggle the dish's selection
        dishElement.addEventListener("click", (event) => {
            const dishId = dish.id;
            console.log(dishId)
            // Toggle the background color to indicate selection
            if (selectedDishes[dishId]) {
                // If already selected, unselect it
                delete selectedDishes[dishId];
                dishElement.style.backgroundColor = 'white';
            } else {
                // If not selected, select it
                selectedDishes[dishId] = dish;
                dishElement.style.backgroundColor = ' #d9c28dc4'; // Change to your preferred color
            }
        });

        // Populate the dish element with data
        dishElement.innerHTML = `
            <h3>${dish.name}</h3>
            <p>Price: $${dish.price.toFixed(2)}</p>
            <p>Category: ${dish.category}</p>
            <p>Delivery Type: ${dish.deliveryType}</p>
            <img src="${dish.image}" class="image" alt="${dish.name}" width="200">

        `;

        // Append the dish element to the container
        dishesContainerModal.appendChild(dishElement);
    });

    // ...
    // Add a "Place Order" button
    const placeOrderButton = document.getElementById("placeOrderBtn");
    placeOrderButton.addEventListener("click", async () => {
        // Handle placing the order with the selected dishes
        const selectedDishesArray = Object.values(selectedDishes);
        console.log("Selected Dishes:", selectedDishesArray);

        // Ensure that the restaurant name is defined       
        const restaurantName = restaurant.name;
        console.log(restaurantName);

        try {
            // Find the restaurant UID by matching the restaurant name
            const restaurantUID = uids.find((uid, index) => {
                return restaurantsData[index].name === restaurantName;
            });

            if (restaurantUID) {
                // Create an order object with the selected dishes and restaurant UID
                const order = {
                    restaurantName: restaurantName,
                    dishes: selectedDishesArray,
                    restaurantUID: restaurantUID,
                };

                // Send the order to the restaurant's "Pending" orders in the database
                const pendingOrdersRef = ref(db, `orders/pending`);
                const newOrderRef = push(pendingOrdersRef); // Use push to generate a unique key
                await set(newOrderRef, order);

                // Clear the selected dishes
                selectedDishes = {};

                // Close the modal
                setTimeout(() => {
                    new bootstrap.Modal(dishesModal).hide();
                }, 2000);

                // You can display a success message or perform other actions here
                console.log("Order placed successfully!");
                alert("Order placed successfully!");
                const modal = new bootstrap.Modal(dishesModal);
                modal.hide();
            } else {
                console.error("Restaurant UID not found for:", restaurantName);
            }
        } catch (error) {
            console.error("Error placing order:", error);
        }
    });
}
    // dishesContainerModal.appendChild(placeOrderButton);

    // Show the modal
    new bootstrap.Modal(dishesModal).show();
}

// Call the function to load restaurants when the page loads
loadRestaurants();

const signOutButton = document.getElementById("logoutbtn");
signOutButton.addEventListener("click", () => {
    // Sign out the user
    signOut(auth)
        .then(() => {
            // Redirect to sign-in page after signing out
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Error signing out:", error);
        });
});
