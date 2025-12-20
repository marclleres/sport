import { STORAGE_KEYS } from './constants';

export const storage = {
    // Token d'accès Google
    getAccessToken: () => localStorage.getItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),
    setAccessToken: (token: string) => localStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, token),
    removeAccessToken: () => localStorage.removeItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),

    // ID du spreadsheet
    getSpreadsheetId: () => localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID),
    setSpreadsheetId: (id: string) => localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, id),
    removeSpreadsheetId: () => localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_ID),

    // Utilitaire pour tout nettoyer
    clearAll: () => localStorage.clear(),
};
