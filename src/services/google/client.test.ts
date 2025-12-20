import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getSpreadsheetNamedRanges,
    getNamedRangeInfo,
    getSpreadsheetData,
    writeSpreadsheetData,
    appendSpreadsheetData,
    getSpreadsheetInfo,
} from './client';
import * as storage from '../storage';

// Mock du module storage
vi.mock('../storage', () => ({
    storage: {
        getAccessToken: vi.fn(),
        removeAccessToken: vi.fn(),
    },
}));

// Mock de window.location
const mockLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

// Mock de fetch
vi.stubGlobal('fetch', vi.fn());

describe('google client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocation.href = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getSpreadsheetNamedRanges', () => {
        it('should fetch named ranges', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockNamedRanges = {
                namedRanges: [
                    { name: 'semaine1_HautDuCorps' },
                    { name: 'semaine1_BasDuCorps' },
                    { name: 'semaine2_HautDuCorps' },
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockNamedRanges,
            } as Response);

            // Act
            const result = await getSpreadsheetNamedRanges('spreadsheet-id');

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id?fields=namedRanges',
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                    },
                }
            );
            expect(result).toEqual(['semaine1_HautDuCorps', 'semaine1_BasDuCorps', 'semaine2_HautDuCorps']);
        });

        it('should return empty array when no named ranges', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => ({}),
            } as Response);

            // Act
            const result = await getSpreadsheetNamedRanges('spreadsheet-id');

            // Assert
            expect(result).toEqual([]);
        });

        it('should throw error when not authenticated', async () => {
            // Arrange
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(null);

            // Act & Assert
            await expect(getSpreadsheetNamedRanges('spreadsheet-id')).rejects.toThrow('Non authentifié');
        });

        it('should handle 401 error and redirect', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 401,
                json: async () => ({}),
            } as Response);

            // Act & Assert
            await expect(getSpreadsheetNamedRanges('spreadsheet-id')).rejects.toThrow('Session expirée');
            expect(storage.storage.removeAccessToken).toHaveBeenCalled();
            expect(mockLocation.href).toBe('/#/auth');
        });
    });

    describe('getNamedRangeInfo', () => {
        it('should fetch named range information', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockData = {
                namedRanges: [
                    {
                        name: 'semaine1_HautDuCorps',
                        range: {
                            startRowIndex: 1,
                            startColumnIndex: 2,
                            endRowIndex: 21,
                            endColumnIndex: 12,
                        },
                    },
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockData,
            } as Response);

            // Act
            const result = await getNamedRangeInfo('spreadsheet-id', 'semaine1_HautDuCorps');

            // Assert
            expect(result).toEqual({
                startRow: 1,
                startColumn: 2,
                endRow: 21,
                endColumn: 12,
            });
        });

        it('should return null when named range does not exist', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockData = {
                namedRanges: [
                    {
                        name: 'autre_plage',
                        range: { startRowIndex: 0 },
                    },
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockData,
            } as Response);

            // Act
            const result = await getNamedRangeInfo('spreadsheet-id', 'semaine1_HautDuCorps');

            // Assert
            expect(result).toBeNull();
        });

        it('should handle default index values', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockData = {
                namedRanges: [
                    {
                        name: 'test',
                        range: {},
                    },
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockData,
            } as Response);

            // Act
            const result = await getNamedRangeInfo('spreadsheet-id', 'test');

            // Assert
            expect(result).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
            });
        });
    });

    describe('getSpreadsheetData', () => {
        it('should fetch range data', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockData = {
                values: [
                    ['', 'Exercice', 'Séries'],
                    ['', 'Ecarté poulie', '2'],
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockData,
            } as Response);

            // Act
            const result = await getSpreadsheetData('spreadsheet-id', 'semaine1_HautDuCorps');

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/semaine1_HautDuCorps',
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                    },
                }
            );
            expect(result).toEqual([
                ['', 'Exercice', 'Séries'],
                ['', 'Ecarté poulie', '2'],
            ]);
        });

        it('should throw error when not authenticated', async () => {
            // Arrange
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(null);

            // Act & Assert
            await expect(getSpreadsheetData('spreadsheet-id', 'range')).rejects.toThrow('Non authentifié');
        });

        it('should handle 403 error and redirect', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 403,
                json: async () => ({}),
            } as Response);

            // Act & Assert
            await expect(getSpreadsheetData('spreadsheet-id', 'range')).rejects.toThrow('Session expirée');
            expect(storage.storage.removeAccessToken).toHaveBeenCalled();
            expect(mockLocation.href).toBe('/#/auth');
        });
    });

    describe('writeSpreadsheetData', () => {
        it('should write data to range', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockResponse = { updatedCells: 2 };
            const values = [['12/10kg', '10/12.5kg']];

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockResponse,
            } as Response);

            // Act
            const result = await writeSpreadsheetData('spreadsheet-id', 'Sheet1!A1', values);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/Sheet1!A1?valueInputOption=RAW',
                {
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ values }),
                }
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw error when not authenticated', async () => {
            // Arrange
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(null);

            // Act & Assert
            await expect(writeSpreadsheetData('spreadsheet-id', 'range', [[]])).rejects.toThrow('Non authentifié');
        });
    });

    describe('appendSpreadsheetData', () => {
        it('should append data to range', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockResponse = { updates: { updatedCells: 2 } };
            const values = [['Nouvelle ligne']];

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockResponse,
            } as Response);

            // Act
            const result = await appendSpreadsheetData('spreadsheet-id', 'Sheet1!A1', values);

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id/values/Sheet1!A1:append?valueInputOption=RAW',
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ values }),
                }
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw error when not authenticated', async () => {
            // Arrange
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(null);

            // Act & Assert
            await expect(appendSpreadsheetData('spreadsheet-id', 'range', [[]])).rejects.toThrow('Non authentifié');
        });
    });

    describe('getSpreadsheetInfo', () => {
        it('should fetch spreadsheet info', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            const mockData = {
                sheets: [
                    {
                        properties: {
                            title: 'semaine 1',
                            sheetId: 0,
                        },
                    },
                    {
                        properties: {
                            title: 'semaine 2',
                            sheetId: 1,
                        },
                    },
                ],
            };

            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => mockData,
            } as Response);

            // Act
            const result = await getSpreadsheetInfo('spreadsheet-id');

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                'https://sheets.googleapis.com/v4/spreadsheets/spreadsheet-id',
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                    },
                }
            );
            expect(result).toEqual({
                sheets: [
                    { title: 'semaine 1', sheetId: 0 },
                    { title: 'semaine 2', sheetId: 1 },
                ],
            });
        });

        it('should return empty array when no sheets', async () => {
            // Arrange
            const mockToken = 'mock-access-token';
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(mockToken);
            vi.mocked(fetch).mockResolvedValue({
                status: 200,
                json: async () => ({}),
            } as Response);

            // Act
            const result = await getSpreadsheetInfo('spreadsheet-id');

            // Assert
            expect(result).toEqual({ sheets: [] });
        });

        it('should throw error when not authenticated', async () => {
            // Arrange
            vi.mocked(storage.storage.getAccessToken).mockReturnValue(null);

            // Act & Assert
            await expect(getSpreadsheetInfo('spreadsheet-id')).rejects.toThrow('Non authentifié');
        });
    });
});
