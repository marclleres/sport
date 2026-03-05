import { STORAGE_KEYS } from './constants';

export const storage = {
    getAccessToken: () => localStorage.getItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),
    setAccessToken: (token: string) => localStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, token),
    removeAccessToken: () => localStorage.removeItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),

    clearAll: () => localStorage.clear(),
};
