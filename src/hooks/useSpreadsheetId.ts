import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export const useSpreadsheetId = (): string | null => {
    const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
        storage.getSpreadsheetId()
    );

    useEffect(() => {
        const handleStorageChange = () => {
            setSpreadsheetId(storage.getSpreadsheetId());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return spreadsheetId;
};
