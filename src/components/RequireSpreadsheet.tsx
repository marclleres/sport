import { Navigate } from 'react-router-dom';

export const RequireSpreadsheet = ({ children }: { children: React.ReactNode }) => {
    const spreadsheetId = localStorage.getItem('spreadsheet_id');

    if (!spreadsheetId) {
        return <Navigate to="/configure" replace />;
    }

    return <>{children}</>;
};
