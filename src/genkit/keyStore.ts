const KEY = 'smetapro:genkit:key';

type KeyChangeListener = (key: string | null) => void;

const listeners = new Set<KeyChangeListener>();

function notify(key: string | null) {
  listeners.forEach((listener) => listener(key));
}

export const genkitKeyStore = {
  get(): string | null {
    if (typeof window === 'undefined') return process.env.GENKIT_API_KEY ?? null;
    return window.localStorage.getItem(KEY);
  },
  set(key: string) {
    if (typeof window === 'undefined') {
      process.env.GENKIT_API_KEY = key;
    } else {
      window.localStorage.setItem(KEY, key);
    }
    notify(key);
  },
  clear() {
    if (typeof window === 'undefined') {
      delete process.env.GENKIT_API_KEY;
    } else {
      window.localStorage.removeItem(KEY);
    }
    notify(null);
  },
  subscribe(listener: KeyChangeListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
