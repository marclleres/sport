import { useState, useEffect } from 'react';

export const useSpreadsheetId = (): string | null => {
    const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
        localStorage.getItem('spreadsheet_id')
    );

    useEffect(() => {
        const handleStorageChange = () => {
            setSpreadsheetId(localStorage.getItem('spreadsheet_id'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return spreadsheetId;
};
