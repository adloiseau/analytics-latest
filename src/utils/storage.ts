export const storage = {
  get: (key: string): string | null => localStorage.getItem(key),
  set: (key: string, value: string): void => localStorage.setItem(key, value),
  remove: (key: string): void => localStorage.removeItem(key)
};