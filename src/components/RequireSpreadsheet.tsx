import { Navigate } from 'react-router-dom';
import { storage } from '../services/storage';

export const RequireSpreadsheet = ({ children }: { children: React.ReactNode }) => {
    const spreadsheetId = storage.getSpreadsheetId();

    if (!spreadsheetId) {
        return <Navigate to="/configure" replace />;
    }

    return <>{children}</>;
};
