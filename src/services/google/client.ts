import { storage } from '../storage';

const handleAuthError = (response: Response) => {
    if (response.status === 401 || response.status === 403) {
        storage.removeAccessToken();
        window.location.href = '/#/auth';
        throw new Error('Session expirée, redirection vers la connexion...');
    }
};

export async function getSpreadsheetNamedRanges(spreadsheetId: string) {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=namedRanges`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    handleAuthError(response);

    const data = await response.json();
    const namedRanges = data.namedRanges || [];

    return namedRanges.map((nr: any) => nr.name);
}

export async function getNamedRangeInfo(spreadsheetId: string, rangeName: string) {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=namedRanges`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    handleAuthError(response);

    const data = await response.json();
    const namedRange = data.namedRanges?.find((nr: any) => nr.name === rangeName);

    if (namedRange?.range) {
        return {
            startRow: namedRange.range.startRowIndex || 0,
            startColumn: namedRange.range.startColumnIndex || 0,
            endRow: namedRange.range.endRowIndex || 0,
            endColumn: namedRange.range.endColumnIndex || 0,
        };
    }

    return null;
}

export async function getSpreadsheetData(spreadsheetId: string, range: string) {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    handleAuthError(response);

    const data = await response.json();
    return data.values;
}

export async function writeSpreadsheetData(
    spreadsheetId: string,
    range: string,
    values: any[][]
) {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        }
    );

    handleAuthError(response);

    const data = await response.json();
    return data;
}

export async function appendSpreadsheetData(
    spreadsheetId: string,
    range: string,
    values: any[][]
) {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        }
    );

    handleAuthError(response);

    const data = await response.json();
    return data;
}


type SheetInfo = {
    sheets: { title: string; sheetId: number }[];
};

export async function getSpreadsheetInfo(spreadsheetId: string): Promise<SheetInfo> {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
        throw new Error('Non authentifié');
    }

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    handleAuthError(response);

    const data = await response.json();
    return {
        sheets: data.sheets?.map((sheet: any) => ({
            title: sheet.properties.title,
            sheetId: sheet.properties.sheetId
        })) || []
    };
}