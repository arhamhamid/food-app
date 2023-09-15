import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
 
// Initialize Firebase 
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
const auth = getAuth(app);
const db = getDatabase(app);


const signup = document.getElementById("signup");
const login = document.getElementById("login");
const signupbtns = document.getElementById("signupbtns");
const loginbtns = document.getElementById("loginbtns");

signupbtns.style.display = "none";
loginbtns.style.display = "none";

signup.addEventListener('click', () => {
    signupbtns.style.display = "block";
    loginbtns.style.display = "none";
});
        
login.addEventListener('click', () => {
    signupbtns.style.display = "none";
    loginbtns.style.display = "block";
});

// Sign up as a restaurant
const signupbtnrestuarant = document.getElementById("signupbtnrestuarant");
signupbtnrestuarant.addEventListener('click', async () => {
    try {
        const restuarantName = document.getElementById('restuarantname').value;
        const restuarantEmail = document.getElementById('signrestuarantemail').value;
        const restuarantPassword = document.getElementById('signrestuarantpass').value;
        const restuarantCountry = document.getElementById('restuarantcountry').value;
        const restuarantCity = document.getElementById('restuarantcity').value;

        const restuarantCredential = await createUserWithEmailAndPassword(auth, restuarantEmail, restuarantPassword);

        // Store restaurant data in the Realtime Database
        const restaurantData = {
            name: restuarantName,
            email: restuarantEmail,
            country: restuarantCountry,
            city: restuarantCity
        };
 
        // Use the user's UID as the key to store data in the database
        const uid = restuarantCredential.user.uid;
        await set(ref(db, `restaurants/${uid}`), restaurantData);

        window.location.href = "index.html";
        // You can perform additional actions after successful registration
        console.log("Restaurant registered successfully!");
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            alert('invalid Email')
        }
        if (error.code === 'auth/email-already-in-use') {
            alert('Email already in use')
        }
        console.error("Error registering restaurant:", error);
    }
});
// sign up user 
const signupbtnuser = document.getElementById("signupbtnuser");
signupbtnuser.addEventListener('click', async () => {
    try {
        const username = document.getElementById("username").value;
        const useremail = document.getElementById("signuseremail").value;
        const userpassword = document.getElementById("signuserpass").value;
        const usercountry = document.getElementById("usercountry").value;
        const usercity = document.getElementById("usercity").value;
        const usercontact = document.getElementById("usersontact").value;

        // Create user with email and password using Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, useremail, userpassword);

        // Get the user's unique ID from the userCredential
        const userId = userCredential.user.uid;

        // Store user data in the Realtime Database
        const userData = {
            name: username,
            email: useremail,
            country: usercountry,
            city: usercity,
            contact: usercontact
        };

        // Set user data at a specific location in the Realtime Database
        await set(ref(db, `users/${userId}`), userData);
        window.location.href = "index.html";

        // You can perform additional actions after successful registration
        console.log("User registered successfully!");

    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            alert('invalid Email')
        }
        if (error.code === 'auth/email-already-in-use') {
            alert('Email already in use')
        }
        if (error.code === 'auth/weak-password') {
            alert('Weak password')
        }

        console.error("Error registering user:", error);
    }
});

// Log in as a restaurant
const loginbtnrestuarant = document.getElementById("loginbtnrestuarant");
loginbtnrestuarant.addEventListener('click', async () => {
    try {
        const restuarantEmail = document.getElementById("logrestuarantemail").value;
        const restuarantPassword = document.getElementById("logrestuarantpass").value;

        // Sign in with email and password
        await signInWithEmailAndPassword(auth, restuarantEmail, restuarantPassword);

        window.location.href = "restuarant.html";
        // You can perform actions after successful login, such as redirecting to a dashboard.
        console.log("Restaurant logged in successfully!");

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            alert('user-not-found')
            console.error("Error logging in as a restaurant:", error);
        }
        if (error.code === 'auth/invalid-email') {
            alert('invalid Email')
        }
        if (error.code === 'auth/wrong-passwor') {
            alert('wrong-password')
        }
        console.error("Error registering user:", error);

    }
});

// Log in as a user
const loginbtnuser = document.getElementById("loginbtnuser");
loginbtnuser.addEventListener('click', async () => {
    try {
        const useremail = document.getElementById("loguseremail").value;
        const userpassword = document.getElementById("loguserpass").value;

        // Sign in with email and password
        await signInWithEmailAndPassword(auth, useremail, userpassword);
        window.location.href = "user.html";
        // You can perform actions after successful login, such as redirecting to a user dashboard.
        console.log("User logged in successfully!");
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            alert('user-not-found')
            console.error("Error logging in as a restaurant:", error);
        }
        if (error.code === 'auth/invalid-email') {
            alert('invalid Email')
        }
        if (error.code === 'auth/wrong-passwor') {
            alert('wrong-password')
        }
        console.error("Error logging in as a user:", error);
    }
});


