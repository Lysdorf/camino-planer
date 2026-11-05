const STORAGE_KEY = "completedStages";
const ROUTE_KEY = "selectedRoute";
const STORAGE_EVENT = "caminoStorageChanged";
const BUDGET_KEY = "budgetSettings";
const BACKPACK_KEY = "backpackItems";
const DEFAULT_BACKPACK_ITEMS = [];
const CUSTOM_BACKPACK_KEY = "customBackpackItems";
const BACKPACK_DETAILS_KEY = "backpackDetails";
const DEFAULT_BACKPACK_DETAILS = {};

const DEFAULT_BUDGET_SETTINGS = {
  accommodation: 20,
  food: 15,
  extras: 5,
  reservePercent: 15,
  nights: null
};

function getSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function saveCompletedStages(stages, routeName) {
  const progress = parseProgress(localStorage.getItem(STORAGE_KEY));

  progress[routeName] = stages;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  window.dispatchEvent(new Event(STORAGE_EVENT));
}
function saveSelectedRoute(routeName) {
    localStorage.setItem(ROUTE_KEY, routeName);
    
    window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseBudgetSettings(savedSettings) {
  try {
    const parsed = savedSettings
      ? JSON.parse(savedSettings)
      : DEFAULT_BUDGET_SETTINGS;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return DEFAULT_BUDGET_SETTINGS;
    }

    return {
      accommodation: Number.isFinite(parsed.accommodation)
        ? Math.max(0, parsed.accommodation)
        : DEFAULT_BUDGET_SETTINGS.accommodation,

      food: Number.isFinite(parsed.food)
        ? Math.max(0, parsed.food)
        : DEFAULT_BUDGET_SETTINGS.food,

      extras: Number.isFinite(parsed.extras)
        ? Math.max(0, parsed.extras)
        : DEFAULT_BUDGET_SETTINGS.extras,

      reservePercent: Number.isFinite(parsed.reservePercent)
        ? Math.min(100, Math.max(0, parsed.reservePercent))
        : DEFAULT_BUDGET_SETTINGS.reservePercent,
      
      nights: Number.isFinite(parsed.nights)
        ? Math.max(0, Math.floor(parsed.nights))
        : null
    };
  } catch {
    return DEFAULT_BUDGET_SETTINGS;
  }
}

let cachedBudgetString = null;
let cachedBudget = DEFAULT_BUDGET_SETTINGS;

function getBudgetSnapshot() {
  const currentString = localStorage.getItem(BUDGET_KEY);

  if (currentString === cachedBudgetString) {
    return cachedBudget;
  }

  cachedBudgetString = currentString;
  cachedBudget = parseBudgetSettings(currentString);

  return cachedBudget;
}

function getBudgetServerSnapshot() {
  return DEFAULT_BUDGET_SETTINGS;
}

function saveBudgetSettings(settings) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(settings));

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeBudget(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function resetBudgetSettings() {
  localStorage.setItem(
    BUDGET_KEY,
    JSON.stringify(DEFAULT_BUDGET_SETTINGS)
  );

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseBackpackItems(savedItems) {
  try {
    const parsed = savedItems ? JSON.parse(savedItems) : [];

    if (!Array.isArray(parsed)) {
      return DEFAULT_BACKPACK_ITEMS;
    }

    return parsed.filter(item => typeof item === "string");
  } catch {
    return DEFAULT_BACKPACK_ITEMS;
  }
}

let cachedBackpackString = null;
let cachedBackpackItems = DEFAULT_BACKPACK_ITEMS;

function getBackpackSnapshot() {
  const currentString = localStorage.getItem(BACKPACK_KEY);

  if (currentString === cachedBackpackString) {
    return cachedBackpackItems;
  }

  cachedBackpackString = currentString;
  cachedBackpackItems = parseBackpackItems(currentString);

  return cachedBackpackItems;
}

function getBackpackServerSnapshot() {
  return DEFAULT_BACKPACK_ITEMS;
}

function saveBackpackItems(items) {
  localStorage.setItem(BACKPACK_KEY, JSON.stringify(items));

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeBackpack(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function parseCustomBackpackItems(savedItems) {
  try {
    const parsed = savedItems ? JSON.parse(savedItems) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.categoryId === "string" &&
      typeof item.name === "string"
    );
  } catch {
    return [];
  }
}

let cachedCustomBackpackString = null;
let cachedCustomBackpackItems = [];

function getCustomBackpackSnapshot() {
  const currentString = localStorage.getItem(CUSTOM_BACKPACK_KEY);

  if (currentString === cachedCustomBackpackString) {
    return cachedCustomBackpackItems;
  }

  cachedCustomBackpackString = currentString;
  cachedCustomBackpackItems = parseCustomBackpackItems(currentString);

  return cachedCustomBackpackItems;
}

function getCustomBackpackServerSnapshot() {
  return [];
}

function saveCustomBackpackItems(items) {
  localStorage.setItem(CUSTOM_BACKPACK_KEY, JSON.stringify(items));

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeCustomBackpack(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function parseBackpackDetails(savedDetails) {
  try {
    const parsed = savedDetails ? JSON.parse(savedDetails) : {};

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

let cachedBackpackDetailsString = null;
let cachedBackpackDetails = {};

function getBackpackDetailsSnapshot() {
  const currentString = localStorage.getItem(BACKPACK_DETAILS_KEY);

  if (currentString === cachedBackpackDetailsString) {
    return cachedBackpackDetails;
  }

  cachedBackpackDetailsString = currentString;
  cachedBackpackDetails = parseBackpackDetails(currentString);

  return DEFAULT_BACKPACK_DETAILS;
}

function getBackpackDetailsServerSnapshot() {
  return {};
}

function saveBackpackDetails(details) {
  localStorage.setItem(BACKPACK_DETAILS_KEY, JSON.stringify(details));

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function subscribeBackpackDetails(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getSelectedRouteSnapshot() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(ROUTE_KEY);
}

function subscribeSelectedRoute(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function parseProgress(savedProgress) {
  try {
    const parsed = savedProgress ? JSON.parse(savedProgress) : {};

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

let cachedProgressString = null;
let cachedProgress = {};

function getProgressSnapshot() {
  const currentProgressString = getSnapshot();

  if (currentProgressString === cachedProgressString) {
    return cachedProgress;
  }

  cachedProgressString = currentProgressString;
  cachedProgress = parseProgress(currentProgressString);

  return cachedProgress;
}

export {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    saveCompletedStages,
    saveSelectedRoute,
    getSelectedRouteSnapshot,
    subscribeSelectedRoute,
    getProgressSnapshot,
    getBudgetSnapshot,
    getBudgetServerSnapshot,
    saveBudgetSettings,
    subscribeBudget,
    resetBudgetSettings,
    getBackpackSnapshot,
    getBackpackServerSnapshot,
    saveBackpackItems,
    subscribeBackpack,
    getCustomBackpackSnapshot,
    getCustomBackpackServerSnapshot,
    saveCustomBackpackItems,
    subscribeCustomBackpack,
    getBackpackDetailsSnapshot,
    getBackpackDetailsServerSnapshot,
    saveBackpackDetails,
    subscribeBackpackDetails
};