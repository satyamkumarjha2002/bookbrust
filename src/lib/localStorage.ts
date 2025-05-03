// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

class LocalStorageService {
  // Save data to localStorage with type safety
  static save<T>(key: string, value: T): void {
    if (isBrowser) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  // Retrieve data from localStorage with proper type handling
  static get<T>(key: string): T | null {
    if (isBrowser) {
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue && storedValue !== 'undefined') {
          return JSON.parse(storedValue) as T;
        }
      } catch (error) {
        console.error('Error parsing JSON from localStorage:', error);
      }
    }
    return null;
  }

  // Remove an item from localStorage
  static remove(key: string): void {
    if (isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }

  // Clear all items in localStorage
  static clear(): void {
    if (isBrowser) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }

  // Check if an item exists in localStorage
  static exists(key: string): boolean {
    return this.get<unknown>(key) !== null;
  }
}

export default LocalStorageService;