export const getStorage = <T = unknown>(key: string): T | null => {
  const value = localStorage.getItem(key);
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
};

export function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

