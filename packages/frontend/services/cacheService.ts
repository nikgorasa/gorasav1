// Cache mechanism for speedy search result retrievals

interface CachedPayload<T> {
  timestamp: number;
  data: T;
}

const memoryCache = new Map<string, any>();

export function getFromCache<T>(key: string): T | null {
  // Check memory cache first
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key);
    if (Date.now() - item.timestamp < 15 * 60 * 1000) { // 15 mins validity
      console.log(`[Cache Memory Hit] key: ${key}`);
      return item.data as T;
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(`gorasa_search_v1_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw) as CachedPayload<T>;
      if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
        console.log(`[Cache LocalStorage Hit] key: ${key}`);
        // Populate memory cache
        memoryCache.set(key, parsed);
        return parsed.data;
      } else {
        localStorage.removeItem(`gorasa_search_v1_${key}`);
      }
    }
  } catch (e) {
    console.warn("Could not read from local storage cache:", e);
  }
  return null;
}

export function saveToCache<T>(key: string, data: T): void {
  const payload: CachedPayload<T> = {
    timestamp: Date.now(),
    data
  };

  // Add to memory cache
  memoryCache.set(key, payload);

  // Add to localStorage
  try {
    localStorage.setItem(`gorasa_search_v1_${key}`, JSON.stringify(payload));
  } catch (e) {
    console.warn("Could not save to local storage cache:", e);
  }
}

export function clearSearchCache(): void {
  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("gorasa_search_v1_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Could not clear cache:", e);
  }
}
