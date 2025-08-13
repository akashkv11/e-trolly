// Import Firebase modules from npm
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  databaseURL:
    "https://shopping-cart-79c9b-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const shoppingListRef = ref(database, "shoppingList");

// ---------------- DOM Elements ----------------
const inputFieldEl = document.getElementById("input-field") as HTMLInputElement;
const addButtonEl = document.getElementById("add-button") as HTMLButtonElement;
const shoppingListEl = document.getElementById("shopping-list") as HTMLElement;

// ---------------- Add Item ----------------
addButtonEl?.addEventListener("click", () => {
  const inputValue = inputFieldEl.value.trim();
  if (inputValue) {
    push(shoppingListRef, inputValue);
    inputFieldEl.value = "";
  }
});

// ---------------- Listen to Database ----------------
onValue(shoppingListRef, (snapshot) => {
  clearShoppingListEl();

  if (snapshot.exists()) {
    const itemsArray = Object.entries(snapshot.val() as Record<string, string>);
    itemsArray.forEach((item) => appendItemToShoppingListEl(item));
  } else {
    shoppingListEl.textContent = "No items here... yet";
  }
});

// ---------------- Helper Functions ----------------
function clearShoppingListEl() {
  shoppingListEl.innerHTML = "";
}

function appendItemToShoppingListEl([itemID, itemValue]: [string, string]) {
  const newEl = document.createElement("li");
  newEl.textContent = itemValue;

  // Remove item on click
  newEl.addEventListener("click", () => {
    const exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
    remove(exactLocationOfItemInDB);
  });

  shoppingListEl.append(newEl);
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((reg) => console.log("Service Worker registered:", reg))
    .catch((err) => console.error("SW registration failed:", err));
}
