import { auth } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

// Check login status
function loggedIn() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.replace("home.html");
        } else {
            window.location.replace("welcome.html");
        }
    });
}

// Login button
const loginButton = document.getElementById("login");

if (loginButton) {
    loginButton.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);

            console.log("Logged in:", result.user.displayName);

            window.location.replace("home.html");
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
        }
    });
}

export { loggedIn };