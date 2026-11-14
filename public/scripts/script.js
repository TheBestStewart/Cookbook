import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  or,
  query,
  where,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

import { db, auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";


let editingRecipeId = null;
const editButton = document.querySelector("#edit-recipe");

editButton?.addEventListener("click", () => {
  const recipe = window.selectedRecipe;
  const user = auth.currentUser;

  if (!recipe || !user) return;

  if (recipe.ownerId === "all") {
    alert("Shared recipes cannot be edited.");
    return;
  }

  if (recipe.ownerId !== user.uid) {
    alert("You can only edit recipes you created.");
    return;
  }

  editingRecipeId = recipe.id;

  document.querySelector("#recipe-name").value =
    recipe.name || recipe.title || "";

  document.querySelector("#image").value =
    recipe.image || "";

  document.querySelector("#tags").value =
    Array.isArray(recipe.tags)
      ? recipe.tags.join(", ")
      : recipe.tags || "";

  document.querySelector("#description").value =
    recipe.description || "";

  document.querySelector("#prep-time").value =
    recipe.prepTime || "";

  document.querySelector("#cook-time").value =
    recipe.cookTime || "";

  document.querySelector("#total-time").value =
    recipe.totalTime || "";

  document.querySelector("#servings").value =
    recipe.servings || "";

  document.querySelector("#ingredients").value =
    recipe.ingredients || "";
  document.querySelector("#source").value =
    recipe.source || "";

  document.querySelector("#instructions").value =
    recipe.instructions || "";

  document.querySelector("#notes").value =
    recipe.notes || "";

  document.querySelector("#recipe-overlay").hidden = true;

  document.querySelector("#add-recipe-toggle")?.click();

  document
    .querySelector("#form")
    .scrollIntoView({ behavior: "smooth" });
});
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in before creating a recipe.");
    return;
  }

  const recipe = {
    name: document.querySelector("#recipe-name").value.trim(),
    image: document.querySelector("#image").value.trim(),
    tags: document.querySelector("#tags").value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    prepTime: document.querySelector("#prep-time").value.trim(),
    cookTime: document.querySelector("#cook-time").value.trim(),
    totalTime: document.querySelector("#total-time").value.trim(),
    description: document.querySelector("#description").value.trim(),
    servings: document.querySelector("#servings").value.trim(),
    ingredients: document.querySelector("#ingredients").value.trim(),
    source: document.querySelector("#source").value.trim(),
    instructions: document.querySelector("#instructions").value.trim(),
    notes: document.querySelector("#notes").value.trim(),
    ownerId: user.uid
  };

  try {
    if (editingRecipeId) {
      await updateDoc(doc(db, "items", editingRecipeId), {
        ...recipe,
        updatedAt: serverTimestamp()
      });

      alert("Recipe updated.");
      editingRecipeId = null;
    } else {
      await addDoc(collection(db, "items"), {
        ...recipe,
        createdAt: serverTimestamp()
      });

      alert("Recipe created.");
    }

    form.reset();
  } catch (error) {
    console.error("Error saving recipe:", error);
    alert("Could not save recipe.");
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

function renderCalendarItems() {
  document.querySelectorAll(".day").forEach((day) => {
    day.querySelectorAll(".calendar-item").forEach((item) => {
      item.remove();
    });

    const matchingItems = savedItems.filter(
      (item) => String(item.date) === String(day.dataset.date)
    );

    matchingItems.forEach((item) => {
      const box = document.createElement("button");

      box.type = "button";
      box.className = "calendar-item";
      box.textContent = item.name || "Recipe";

      box.addEventListener("click", () => {
        if (!item.recipeId) {
          console.error("Missing recipeId:", item);
          return;
        }

        window.location.href =
          `cookbook.html?recipeId=${encodeURIComponent(item.recipeId)}`;
      });

      day.appendChild(box);
    });
  });
}
const shoppingList = document.querySelector("#shopping-list");

if (shoppingList) {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const plansQuery = query(
      collection(db, "mealPlans"),
      where("ownerId", "==", user.uid)
    );

    onSnapshot(plansQuery, (snapshot) => {
      const ingredients = [];

snapshot.forEach((doc) => {
  const mealPlan = doc.data();
  const recipeName = mealPlan.name || "Unknown recipe";

  String(mealPlan.ingredients || "")
    .split("\n")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .forEach((ingredient) => {
      ingredients.push({
        text: ingredient,
        recipeName
      });
    });
});

renderShoppingList(ingredients);
    });
  });
}

function renderShoppingList(ingredients) {
  shoppingList.replaceChildren();

  const uniqueIngredients = [
    ...new Map(
      ingredients.map((item) => [
        `${item.recipeName}|${item.text}`,
        item
      ])
    ).values()
  ];

  uniqueIngredients.forEach((item) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <label>
        <input type="checkbox">
        <span>
          <strong>${escapeHtml(item.text)}</strong> from
          <strong>${escapeHtml(item.recipeName)}</strong>
        </span>
      </label>
    `;

    shoppingList.appendChild(listItem);
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const itemsQuery = query(
    collection(db, "items"),
    or(
    where("ownerId", "==", user.uid), where("ownerId", "==", "all"))
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

function renderShoppingList(ingredients) {
  shoppingList.replaceChildren();

  ingredients.forEach((item) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <label>
        <input type="checkbox">
        <span>
          <strong>${item.quantity} ${item.unit}</strong>
          <strong>${escapeHtml(item.name)}</strong>
        </span>
      </label>
    `;

    shoppingList.appendChild(listItem);
  });
}
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
    });

    console.log("Saved recipe ID:", recipe.id);
    alert("Recipe added to the calendar.");

    document.querySelector("#meal-plan-date").value = "";
    document.querySelector("#meal-planner-popover").hidden = true;
  } catch (error) {
    console.error("Could not save meal plan:", error);
  }
});

const deleteButton = document.querySelector("#delete-recipe");

deleteButton?.addEventListener("click", async () => {
  const recipe = window.selectedRecipe;
  const user = auth.currentUser;

  if (!recipe?.id || !user) {
    alert("No recipe is selected or you are not signed in.");
    return;
  }

  if (recipe.ownerId === "all") {
    alert("Shared recipes cannot be deleted.");
    return;
  }

  if (recipe.ownerId !== user.uid) {
    alert("You can only delete recipes you created.");
    return;
  }

  if (!confirm(`Delete "${recipe.title || recipe.name}"?`)) {
    return;
  }

  try {
    const plansQuery = query(
      collection(db, "mealPlans"),
      where("recipeId", "==", recipe.id),
      where("ownerId", "==", user.uid)
    );

    const plansSnapshot = await getDocs(plansQuery);
    const batch = writeBatch(db);

    plansSnapshot.forEach((plan) => {
      batch.delete(plan.ref);
    });

    batch.delete(doc(db, "items", recipe.id));

    await batch.commit();

    alert("Recipe and all calendar entries were deleted.");

    document.querySelector("#recipe-overlay").hidden = true;
    window.selectedRecipe = null;
  } catch (error) {
    console.error("Could not delete recipe and meal plans:", error);
    alert("The recipe could not be deleted.");
  }
});

window.addEventListener("calendar-rendered", renderCalendarItems);
