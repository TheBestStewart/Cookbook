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
        image: document.querySelector("#image").value.trim(),
        tags: document.querySelector("#tags").value.split(",").map((tag) => tag.trim()).filter(Boolean),
        prepTime: document.querySelector("#prep-time").value.trim(),
        cookTime: document.querySelector("#cook-time").value.trim(),
        totalTime: document.querySelector("#total-time").value.trim(),
        description: document.querySelector("#description").value.trim(),
        servings: document.querySelector("#servings").value.trim(),
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


onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const itemsQuery = query(
    collection(db, "items"),
    where("ownerId", "==", user.uid)
  );

  onSnapshot(
    itemsQuery,
    (snapshot) => {
      const recipes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      window.dispatchEvent(
        new CustomEvent("firebase-recipes-loaded", {
          detail: recipes
        })
      );
    },
    (error) => {
      console.error("ITEMS listener failed:", error);
    }
  );

  const plansQuery = query(
    collection(db, "mealPlans"),
    where("ownerId", "==", user.uid)
  );

  onSnapshot(
    plansQuery,
    (snapshot) => {
      savedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      renderCalendarItems();
    },
    (error) => {
      console.error("MEAL PLANS listener failed:", error);
    }
  );
});

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
  if (!user) return;

  const itemsQuery = query(
    collection(db, "items"),
    where("ownerId", "==", user.uid)
  );

  const plansQuery = query(
    collection(db, "mealPlans"),
    where("ownerId", "==", user.uid)
  );

  onSnapshot(
    itemsQuery,
    (snapshot) => {
      const firebaseRecipes = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.name || "Untitled recipe",
          name: data.name || "Untitled recipe",
          image: data.image || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          description: data.description || "",
          prepTime: data.prepTime || "",
          cookTime: data.cookTime || "",
          totalTime: data.totalTime || "",
          servings: data.servings || "",
          ingredients: data.ingredients || "",
          instructions: data.instructions || "",
          notes: data.notes || "",
          ownerId: data.ownerId
        };
      });

      window.dispatchEvent(
        new CustomEvent("firebase-recipes-loaded", {
          detail: firebaseRecipes
        })
      );
    },
    (error) => {
      console.error("Items listener failed:", error);
    }
  );

  onSnapshot(
    plansQuery,
    (snapshot) => {
      savedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      renderCalendarItems();
    },
    (error) => {
      console.error("Meal plans listener failed:", error);
    }
  );
});

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

const confirmButton = document.querySelector("#confirm-button");

confirmButton?.addEventListener("click", async (event) => {
  event.preventDefault();

  const recipe = window.selectedRecipe;
  const date = document.querySelector("#meal-plan-date").value;
  const user = auth.currentUser;

  if (!recipe?.id) {
    alert("No recipe was selected.");
    return;
  }

  if (!date) {
    alert("Choose a date first.");
    return;
  }

  if (!user) {
    alert("Please sign in first.");
    return;
  }

  try {
    await addDoc(collection(db, "mealPlans"), {
      recipeId: recipe.id,
      name: recipe.name || recipe.title,
      image: recipe.image || "",
      description: recipe.description || "",
      cookTime: recipe.cookTime || "",
      ingredients: recipe.ingredients || "",
      instructions: recipe.instructions || "",
      notes: recipe.notes || "",
      date,
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });

    console.log("Saved recipe ID:", recipe.id);
    alert("Recipe added to the calendar.");

    document.querySelector("#meal-plan-date").value = "";
    document.querySelector("#meal-planner-popover").hidden = true;
  } catch (error) {
    console.error("Could not save meal plan:", error);
  }
});

window.addEventListener("calendar-rendered", renderCalendarItems);