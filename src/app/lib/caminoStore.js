const STORAGE_KEY = "completedStages";
const ROUTE_KEY = "selectedRoute";
const STORAGE_EVENT = "caminoStorageChanged";

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
    getProgressSnapshot
};