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
const refreshButtonEl = document.getElementById(
  "refresh-button"
) as HTMLButtonElement;
const shoppingListEl = document.getElementById("shopping-list") as HTMLElement;
const clearedList = new Set<string>();

// ---------------- Add Item ----------------
addButtonEl?.addEventListener("click", () => {
  const inputValue = inputFieldEl.value.trim();
  if (inputValue) {
    push(shoppingListRef, inputValue);
    inputFieldEl.value = "";
  }
});

// ---------------- Refresh ----------------
refreshButtonEl?.addEventListener("click", clearDB);

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

function clearDB() {
  if (clearedList.size === 0) {
    return;
  }
  const itemsToClear = clearedList;
  itemsToClear.forEach((itemID) =>
    remove(ref(database, `shoppingList/${itemID}`))
  );
  clearedList.clear();
}

function appendItemToShoppingListEl([itemID, itemValue]: [string, string]) {
  const newEl = document.createElement("li");
  newEl.textContent = itemValue;
  if (clearedList.has(itemID)) {
    newEl.style.textDecoration = "line-through";
  }
  // Remove item on click
  newEl.addEventListener("click", () => {
    strikeItem(itemID, newEl);
  });

  shoppingListEl.append(newEl);
}

function strikeItem(itemID: string, listItem: HTMLLIElement) {
  if (clearedList.has(itemID)) {
    listItem.style.textDecoration = "none";
    clearedList.delete(itemID);
    return;
  }
  clearedList.add(itemID);
  listItem.style.textDecoration = "line-through";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((reg) => console.log("Service Worker registered:", reg))
    .catch((err) => console.error("SW registration failed:", err));
}
