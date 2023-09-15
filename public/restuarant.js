const dashboardbtn = document.getElementById("dashboardbtn"); 
const adddishesbtn = document.getElementById("adddishesbtn");
const mydishesbtn = document.getElementById("mydishesbtn");
const adddishes = document.getElementById("adddishes");
const dashboard = document.getElementById("dashboard");
const heading = document.getElementById("heading");
const mydishes = document.getElementById("mydishes");
 
dashboard.style.display = "none";
adddishes.style.display = "none";
mydishes.style.display = "none";
mydishesbtn.addEventListener("click", () => {
    adddishes.style.display = "none";
    dashboard.style.display = "none";
    mydishes.style.display = "block";
    heading.style.display = "none";
    displayMyDishes();
});

// mydishes.style.display = "none";
adddishesbtn.addEventListener("click", () => {
    adddishes.style.display = "block";
    dashboard.style.display = "none";
    mydishes.style.display = "none";
    heading.style.display = "none";
});

dashboardbtn.addEventListener("click", () => {
    adddishes.style.display = "none";
    dashboard.style.display = "block";
    heading.style.display = "none";
    mydishes.style.display = "none";

    listenForPendingOrders();
         listenForAcceptedOrders();
         listenForDeliveredOrders();
 // Call the function to listen for accepted orders

    // Refresh the order lists when opening the dashboard
})

// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getDatabase, ref, push, set, get, onChildAdded, onChildRemoved} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9-uK5LoUDBrLrCtYXn35H14w5n6mI780",
    authDomain: "test-30323.firebaseapp.com",
    databaseURL: "https://test-30323-default-rtdb.firebaseio.com",
    projectId: "test-30323",
    storageBucket: "test-30323.appspot.com",
    messagingSenderId: "523076581955",
    appId: "1:523076581955:web:6f214a901141244ca832f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const signOutButton = document.getElementById("logoutbtn");

signOutButton.addEventListener("click", () => {
    // Sign out the user
    signOut(auth)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Error signing out:", error);
        });
});

let restaurantUID = null; // Initialize UID as null

setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Continue with other Firebase setup and authentication code
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, you can access the UID
        restaurantUID = user.uid;
        console.log(`Restaurant User is logged in with UID: ${restaurantUID}`);
    } else {
        // User is signed out, reset UID to null
        restaurantUID = null;

        console.log("Restaurant User is signed out.");
    }
}, (error) => {
    console.error("Authentication Error:", error);
});

const addDishBtn = document.getElementById("adddishbtn");
const myDishesList = document.getElementById("myDishesList");

function displayMyDishes() {
    if (!restaurantUID) {
        // If the restaurant is not logged in, return or handle the case accordingly
        console.log("Restaurant user is not logged in.");
        return;
    }

    const restaurantDishesRef = ref(db, `restaurants/${restaurantUID}/dishes`);

    // Listen for changes in the restaurant's dishes
    onChildAdded(restaurantDishesRef, (snapshot) => {
        const dishData = snapshot.val();

        // Create HTML content for each dish and add it to the myDishesList
        const dishElement = createDishElement(snapshot.key, dishData);
        myDishesList.appendChild(dishElement);
    });
}

function createDishElement(dishId, dishData) {
    const dishElement = document.createElement("div");
    dishElement.classList.add("dish");

    // Create HTML content for each dish based on dishData
    dishElement.innerHTML = `
    <img src="${dishData.image}" class="image" alt="${dishData.name}" width="200">
        <h3>${dishData.name}</h3>
        <p>Price: $${dishData.price}</p>
        <p>Category: ${dishData.category}</p>
        <p>Delivery Type: ${dishData.deliveryType}</p> 
       
    `;

    return dishElement;
}

// Call the function to display the restaurant's dishes
displayMyDishes();

addDishBtn.addEventListener("click", async () => {
    try {
        if (!restaurantUID) {
            console.error("Restaurant user is not logged in.");
            return;
        }

        // Get input values (itemName, price, category, etc.)
        const itemName = document.getElementById("itemName").value;
        const price = document.getElementById("price").value;
        const category = document.getElementById("category").value;
        const deliveryType = document.getElementById("deliveryType").value;
        const imageInput = document.getElementById("foodImage").files[0];

        const imageFileName = `${Date.now()}_${imageInput.name}`;

        // Reference to the Firebase Storage location for uploading the image
        const imageRef = storageRef(storage, `restaurant_images/${imageFileName}`);
        
        // Upload the image to Firebase Storage
        await uploadBytes(imageRef, imageInput);

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(imageRef);
        console.log("Image URL:", imageUrl); // Log the URL for debugging

        // Create a new dish object
        const newDish = {
            name: itemName,
            price: parseFloat(price),
            category: category,
            deliveryType: deliveryType,
           image: imageUrl 
        };
        console.log(newDish)
        // Push the new dish to the restaurant's dishes in the database
        const restaurantDishesRef = ref(db, `restaurants/${restaurantUID}/dishes`);
        const newDishRef = push(restaurantDishesRef);
        await set(newDishRef, newDish);
 
        // Clear input fields after successfully adding the dish
        document.getElementById("itemName").value = "";
        document.getElementById("price").value = "";
        document.getElementById("category").value = "";
        document.getElementById("deliveryType").value = "";
        document.getElementById("foodImage").value = "";

        alert("Dish added successfully!")
    } catch (error) {
        console.error("Error adding dish:", error);
    }
});

const pendingOrdersContainer = document.getElementById("pendingOrders");
const acceptedOrdersContainer = document.getElementById("acceptedOrders");
const deliveredOrdersContainer = document.getElementById("deliveredOrders");
 // Container for accepted orders
let currentOrderId;

function listenForPendingOrders() {
    if (!restaurantUID) {
        // If the restaurant is not logged in, return or handle the case accordingly
        console.log("Restaurant user is not logged in.");
        return;
    }

    // Create a reference to the "orders/pending" section
    const pendingOrdersRef = ref(db, "orders/pending");

    // Listen for changes in the "orders/pending" section
    onChildAdded(pendingOrdersRef, (snapshot) => {
        const orderData = snapshot.val();
        const orderId = snapshot.key;

        // Check if the order belongs to the restaurant
        if (orderData.restaurantUID === restaurantUID) {
            const card = document.createElement("div");
            card.classList.add("card");

            currentOrderId = orderId;

            // Check if 'dishes' array exists and is not empty
            if (Array.isArray(orderData.dishes) && orderData.dishes.length > 0) {
                const firstDish = orderData.dishes[0];

                // Create HTML content for the card
                card.innerHTML = `
                    <div class="card-body" >
                        <h5 class="card-title">Order ID: ${orderId}</h5>
                        <p class="card-text">Product Name: ${firstDish.name}</p>
                        <p class="card-text">Total Price: ${firstDish.price}</p>

                        <div class="card" data-order-id=${orderId}>
                            <button class="btn btn-primary" id="test">Accept Order</button>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">Order ID: ${orderId}</h5>
                        <p class="card-text">No dishes in this order.</p>
                    </div>
                `;
            }

            pendingOrdersContainer.appendChild(card);
        }
    });
}
function listenForAcceptedOrders() {
    if (!restaurantUID) {
        // If the restaurant is not logged in, return or handle the case accordingly
        console.log("Restaurant user is not logged in.");
        return;
    }

    const acceptedOrdersRef = ref(db, `orders/accepted`);

    // Listen for changes in the "Accepted" section
    onChildAdded(acceptedOrdersRef, (snapshot) => {
        const orderData = snapshot.val();
        const orderId = snapshot.key;

        // Create a card for the accepted order and add it to the acceptedOrdersContainer
        // const card = createOrderCard(orderId, orderData);
        // acceptedOrdersContainer.appendChild(card);

        if (orderData.restaurantUID === restaurantUID) {
            const card = createOrderCard(orderId, orderData);
            acceptedOrdersContainer.appendChild(card);}

    });

    // Listen for changes when orders are removed (optional)
    onChildRemoved(acceptedOrdersRef, (snapshot) => {
        const orderId = snapshot.key;
        // Remove the corresponding order card from the UI
        removeOrderCard(orderId);
    });
}
function listenForDeliveredOrders() {
    if (!restaurantUID) {
        console.log("Restaurant user is not logged in.");
        return;
    }

    const deliveredOrdersRef = ref(db, `orders/delivered`);

    // Listen for changes in the "Delivered" section
    onChildAdded(deliveredOrdersRef, (snapshot) => {
        const orderData = snapshot.val();
        const orderId = snapshot.key;

        // Create a card for the delivered order and add it to the deliveredOrdersContainer
        const card = createDeliveredOrderCard(orderId, orderData);
        deliveredOrdersContainer.appendChild(card);
    });

    // Listen for changes when orders are removed (optional)
    onChildRemoved(deliveredOrdersRef, (snapshot) => {
        const orderId = snapshot.key;
        // Remove the corresponding order card from the UI
        removeOrderCard(deliveredOrdersContainer, orderId);
    });
}

function createDeliveredOrderCard(orderId, orderData) {
    const card = document.createElement("div");
    card.classList.add("card");

    // Create HTML content for the card based on the orderData
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Order ID: ${orderId}</h5>
            <!-- Add additional order details here if needed -->
        </div>
    `;

    return card;
}

// Function to handle accepting an order
function acceptOrder(orderId) {
    if (!restaurantUID || !orderId) {
        console.error("Restaurant user is not logged in or no order ID provided.");
        return;
    }
    // Update the order status in the database and move it to "orders/accepted"
    const currentOrderRef = ref(db, `orders/pending/${currentOrderId}`);

    // Create a reference to the specific order in "orders/pending" that we want to move
    get(currentOrderRef)
        .then((snapshot) => {
            const orderData = snapshot.val();

            // Update the order status in the database and move it to "orders/accepted"
            if (orderData) {
                const acceptedOrdersRef = ref(db, `orders/accepted/${orderId}`);

                set(acceptedOrdersRef, orderData)
                    .then(() => {
                        set(currentOrderRef, null);

                        console.log(`Order ID ${orderId} has been accepted and moved to the "Accepted" section.`);
                    })
                    .catch((error) => {
                        console.error("Error moving order to 'Accepted' section:", error);
                    }); 
            } else {        
                console.error(`Order ID ${orderId} not found in 'Pending' section.`);
            }
        })
        .catch((error) => {
            console.error("Error accepting order:", error);
        });
}

function deliverOrder(orderId) {
    if (!restaurantUID || !orderId) {
        console.error("Restaurant user is not logged in or no order ID provided.");
        return;
    }
    
    const acceptedOrderRef = ref(db, `orders/accepted/${orderId}`);
    const deliveredOrderRef = ref(db, `orders/delivered/${orderId}`);

    // Get the order data from the "Accepted" section
    get(acceptedOrderRef)
        .then((snapshot) => {
            const orderData = snapshot.val();

            // Move the order to the "Delivered" section
            set(deliveredOrderRef, orderData)
                .then(() => {
                    // Remove the order from the "Accepted" section
                    set(acceptedOrderRef, null)
                        .then(() => {
                            console.log(`Order ID ${orderId} has been marked as delivered.`);
                        })
                        .catch((error) => {
                            console.error("Error removing order from 'Accepted' section:", error);
                        });
                })
                .catch((error) => {
                    console.error("Error moving order to 'Delivered' section:", error);
                });
        })
        .catch((error) => {
            console.error("Error getting order from 'Accepted' section:", error);
        });
}
function createOrderCard(orderId, orderData) {
    const card = document.createElement("div");
    card.classList.add("card");

    // Create HTML content for the card based on the orderData
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Order ID: ${orderId}</h5>
            <p class="card-text">Product Name: ${orderData.dishes[0].name}</p>
            <p class="card-text">Total Price: ${orderData.dishes[0].price}</p>
            
            <div class="card" data-order-id="${orderId}">
                <button class="btn btn-success" id="deliver-${orderId}">Delivered</button>
            </div>
        </div>
    `;

    // Add an event listener for the "Delivered" button
    const deliverButton = card.querySelector(`#deliver-${orderId}`);
    
    deliverButton.addEventListener("click", () => {
        deliverOrder(orderId);
    });

    return card;
}


function removeOrderCard(orderId) {
    const cardToRemove = document.querySelector(`#acceptedOrders .card[data-order-id="${orderId}"]`);
    if (cardToRemove) {
        cardToRemove.remove();
    }
}
pendingOrdersContainer.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'test') {
        alert('order accepted!');
        const cardElement = event.target.closest('.card');

        const orderId = getOrderIdFromCard(cardElement);

        if (orderId) {
            acceptOrder(orderId);
        } else {
            console.error("Order ID not found.");
        }
    }
});

function getOrderIdFromCard(cardElement) {
    // Assuming you have a data attribute named 'data-order-id' on the card element
    const orderId = cardElement.getAttribute('data-order-id');

    return orderId;
}
