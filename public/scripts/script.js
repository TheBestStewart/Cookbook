import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

import { db, auth } from "./firebase.js";

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
            window.location.replace("cookbook.html");
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

            window.location.replace("cookbook.html");
        } catch (error) {
            console.error("Login failed:", error.code, error.message);
        }
    });
}

export { loggedIn };
const form = document.querySelector("#form");
const itemsList = document.querySelector("#items-list");
onAuthStateChanged(auth, (user) => {
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!user) {
        alert("Please sign in before creating a recipe.");
        return;
      }

      const recipe = {
        name: document.querySelector("#recipe-name").value.trim(),
        prepTime: document.querySelector("#prep-time").value.trim(),
        cookTime: document.querySelector("#cook-time").value.trim(),
        totalTime: document.querySelector("#total-time").value.trim(),
        portionSize: document.querySelector("#portion-size").value.trim(),
        date: document.querySelector("#date").value,
        ingredients: document.querySelector("#ingredients").value.trim(),
        source: document.querySelector("#source").value.trim(),
        instructions: document.querySelector("#instructions").value.trim(),
        notes: document.querySelector("#notes").value.trim(),
        ownerId: user.uid,
        createdAt: serverTimestamp()
      };

function renderCalendarItems() {
  document.querySelectorAll(".day").forEach((day) => {
    day.querySelectorAll(".calendar-item").forEach((item) => {
      item.remove();
    });

    const matchingItems = savedItems.filter(
      (item) => item.date === day.dataset.date
    );

    matchingItems.forEach((item) => {
      const box = document.createElement("div");
      box.className = "calendar-item";
      box.textContent = item.name;
      day.appendChild(box);
    });
  });
}

window.addEventListener("calendar-rendered", renderCalendarItems);

      try {
        await addDoc(collection(db, "items"), recipe);
        form.reset();
        alert("Recipe created.");
      } catch (error) {
        console.error("Error creating recipe:", error);
        alert("Could not create the recipe.");
      }
    });
  }
});

if (itemsList) {
  const itemsQuery = query(
    collection(db, "items"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(itemsQuery, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    renderItems(items);
  });
}

function renderItems(items) {
  itemsList.innerHTML = items
    .map(
      (item) => `
        <article>
          <h2>${escapeHtml(item.name)}</h2>
          <p>Cook time: ${escapeHtml(item.cookTime || "")}</p>
          <p>${escapeHtml(item.instructions || "")}</p>
          <p>${escapeHtml(item.notes || "")}</p>
        </article>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let savedItems = [];

onAuthStateChanged(auth, (user) => {
  console.log("Firebase user:", user);

  if (!user) {
    console.log("No Firebase user is signed in.");
    return;
  }

  const itemsQuery = query(
    collection(db, "items"),
    where("ownerId", "==", user.uid)
  );

  onSnapshot(
    itemsQuery,
    (snapshot) => {
      savedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Items pulled from Firebase:", savedItems);

      renderCalendarItems();
    },
    (error) => {
      console.error("Firebase read failed:", error);
    }
  );
});

function renderCalendarItems() {
  const days = document.querySelectorAll(".day");

  console.log(
    "Calendar dates:",
    [...days].map((day) => day.dataset.date)
  );

  days.forEach((day) => {
    day.querySelectorAll(".calendar-item").forEach((element) => {
      element.remove();
    });

    const matchingItems = savedItems.filter((item) => {
      console.log("Comparing:", item.date, day.dataset.date);
      return item.date === day.dataset.date;
    });

    matchingItems.forEach((item) => {
      const box = document.createElement("div");
      box.className = "calendar-item";
      box.textContent = item.name;
      day.appendChild(box);
    });
  });
}

window.addEventListener("calendar-rendered", renderCalendarItems);

renderCalendarItems();