import { atom, selector } from 'recoil';

export const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';
export interface User {
  token: string;
  id: string;
  name: string;
}

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, timeoutMs = 5000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      if (i === retries - 1) throw e;
      console.warn(`Auth check attempt ${i + 1} failed, retrying...`);
    }
  }
  throw new Error('All retries failed');
};

export const userAtom = atom<User>({
  key: 'user',
  default: selector({
    key: 'user/default',
    get: async () => {
      try {
        const response = await fetchWithRetry(`${BACKEND_URL}/auth/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (e) {
        console.error(e);
      }

      return null;
    },
  }),
});
