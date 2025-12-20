import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadExercisesFromSheets, saveExercisesToSheets } from './exerciseService';
import * as googleClient from '../google/client';

// Mock des fonctions du client Google
vi.mock('../google/client', () => ({
    getSpreadsheetData: vi.fn(),
    writeSpreadsheetData: vi.fn(),
    getNamedRangeInfo: vi.fn(),
}));

describe('exerciseService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loadExercisesFromSheets', () => {
        it('should load exercises with correct data', async () => {
            // Arrange
            const mockData = [
                ['', 'Ecarté poulie basse', '2', '', '10-15', '2', '12/7.5kg', '13/7.5kg', '', '', 'Superset', 'https://youtube.com'],
                ['', 'Pec / Deck machine', '2', '', '10-15', '2', '15/10kg', '12/10kg', '', '', '', '']
            ];

            vi.mocked(googleClient.getSpreadsheetData).mockResolvedValue(mockData);

            // Act
            const result = await loadExercisesFromSheets('spreadsheet-id', '1', 'HautDuCorps');

            // Assert
            expect(googleClient.getSpreadsheetData).toHaveBeenCalledWith('spreadsheet-id', 'semaine1_HautDuCorps');
            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                exercise: 'Ecarté poulie basse',
                repetitions: '10-15',
                rir: '2',
                multiset: 'Superset',
                youtubeLink: 'https://youtube.com'
            });
            expect(result[0].set).toHaveLength(2);
            expect(result[0].set[0]).toEqual({ count: 12, weight: 7.5 });
            expect(result[0].set[1]).toEqual({ count: 13, weight: 7.5 });
        });

        it('should load placeholders from previous week', async () => {
            // Arrange
            const currentWeekData = [
                ['', 'Exercice Test', '2', '', '10-12', '2', '', '', '', '', '', '']
            ];
            const previousWeekData = [
                ['', 'Exercice Test', '2', '', '10-12', '2', '10/5kg', '12/5kg', '', '', '', '']
            ];

            vi.mocked(googleClient.getSpreadsheetData)
                .mockResolvedValueOnce(currentWeekData)
                .mockResolvedValueOnce(previousWeekData);

            // Act
            const result = await loadExercisesFromSheets('spreadsheet-id', '2', 'HautDuCorps');

            // Assert
            expect(googleClient.getSpreadsheetData).toHaveBeenCalledTimes(2);
            expect(googleClient.getSpreadsheetData).toHaveBeenNthCalledWith(1, 'spreadsheet-id', 'semaine2_HautDuCorps');
            expect(googleClient.getSpreadsheetData).toHaveBeenNthCalledWith(2, 'spreadsheet-id', 'semaine1_HautDuCorps');

            expect(result[0].setPlaceHolder).toHaveLength(2);
            expect(result[0].setPlaceHolder[0]).toEqual({ count: 10, weight: 5 });
            expect(result[0].setPlaceHolder[1]).toEqual({ count: 12, weight: 5 });
        });

        it('should handle decimal weights', async () => {
            // Arrange
            const mockData = [
                ['', 'Exercice Test', '1', '', '10', '2', '12/7.5kg', '', '', '', '', '']
            ];

            vi.mocked(googleClient.getSpreadsheetData).mockResolvedValue(mockData);

            // Act
            const result = await loadExercisesFromSheets('spreadsheet-id', '1', 'HautDuCorps');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].set).toHaveLength(1);
            expect(result[0].set[0].weight).toBe(7.5);
        });

        it('should filter header rows', async () => {
            // Arrange
            const mockData = [
                ['', 'Exercice', 'Séries', '', 'Répétitions', 'Intensité (RIR)', 'Série 1', 'Série 2', '', '', '', ''],
                ['', 'Ecarté poulie basse', '2', '', '10-15', '2', '12/7.5kg', '13/7.5kg', '', '', '', '']
            ];

            vi.mocked(googleClient.getSpreadsheetData).mockResolvedValue(mockData);

            // Act
            const result = await loadExercisesFromSheets('spreadsheet-id', '1', 'HautDuCorps');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].exercise).toBe('Ecarté poulie basse');
        });

        it('should return empty array when no data', async () => {
            // Arrange
            vi.mocked(googleClient.getSpreadsheetData).mockResolvedValue([]);

            // Act
            const result = await loadExercisesFromSheets('spreadsheet-id', '1', 'HautDuCorps');

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('saveExercisesToSheets', () => {
        it('should save exercises at the correct location', async () => {
            // Arrange
            const exercises = [
                {
                    exercise: 'Exercice 1',
                    set: [
                        { count: 12, weight: 10 },
                        { count: 10, weight: 12.5 }
                    ],
                    setPlaceHolder: [],
                    repetitions: '10-12',
                    rir: '2'
                }
            ];

            const mockRangeInfo = {
                startRow: 1,
                startColumn: 2,
                endRow: 21,
                endColumn: 12
            };

            vi.mocked(googleClient.getNamedRangeInfo).mockResolvedValue(mockRangeInfo);
            vi.mocked(googleClient.writeSpreadsheetData).mockResolvedValue(undefined);

            // Act
            await saveExercisesToSheets('spreadsheet-id', '1', 'HautDuCorps', exercises);

            // Assert
            expect(googleClient.getNamedRangeInfo).toHaveBeenCalledWith('spreadsheet-id', 'semaine1_HautDuCorps');
            expect(googleClient.writeSpreadsheetData).toHaveBeenCalledWith(
                'spreadsheet-id',
                "'semaine 1'!I3",
                [['12/10kg', '10/12.5kg']]
            );
        });

        it('should handle empty sets', async () => {
            // Arrange
            const exercises = [
                {
                    exercise: 'Exercice 1',
                    set: [
                        { count: 12, weight: 10 },
                        { count: undefined, weight: undefined }
                    ],
                    setPlaceHolder: [],
                    repetitions: '10-12'
                }
            ];

            const mockRangeInfo = {
                startRow: 1,
                startColumn: 2,
                endRow: 21,
                endColumn: 12
            };

            vi.mocked(googleClient.getNamedRangeInfo).mockResolvedValue(mockRangeInfo);
            vi.mocked(googleClient.writeSpreadsheetData).mockResolvedValue(undefined);

            // Act
            await saveExercisesToSheets('spreadsheet-id', '1', 'HautDuCorps', exercises);

            // Assert
            expect(googleClient.writeSpreadsheetData).toHaveBeenCalledWith(
                'spreadsheet-id',
                "'semaine 1'!I3",
                [['12/10kg', '']]
            );
        });

        it('should not save if named range does not exist', async () => {
            // Arrange
            const exercises = [
                {
                    exercise: 'Exercice 1',
                    set: [{ count: 12, weight: 10 }],
                    setPlaceHolder: [],
                    repetitions: '10-12'
                }
            ];

            vi.mocked(googleClient.getNamedRangeInfo).mockResolvedValue(null);
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Act
            await saveExercisesToSheets('spreadsheet-id', '1', 'HautDuCorps', exercises);

            // Assert
            expect(googleClient.writeSpreadsheetData).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Plage nommée non trouvée:', 'semaine1_HautDuCorps');

            consoleErrorSpy.mockRestore();
        });

        it('should correctly calculate column for different range positions', async () => {
            // Arrange
            const exercises = [
                {
                    exercise: 'Exercice 1',
                    set: [{ count: 10, weight: 5 }],
                    setPlaceHolder: [],
                    repetitions: '10'
                }
            ];

            // Plage commençant à la colonne A (index 0)
            const mockRangeInfo = {
                startRow: 0,
                startColumn: 0,
                endRow: 20,
                endColumn: 10
            };

            vi.mocked(googleClient.getNamedRangeInfo).mockResolvedValue(mockRangeInfo);
            vi.mocked(googleClient.writeSpreadsheetData).mockResolvedValue(undefined);

            // Act
            await saveExercisesToSheets('spreadsheet-id', '1', 'HautDuCorps', exercises);

            // Assert
            // startColumn=0 + 6 = colonne 6 (G)
            expect(googleClient.writeSpreadsheetData).toHaveBeenCalledWith(
                'spreadsheet-id',
                "'semaine 1'!G2",
                [['10/5kg']]
            );
        });
    });
});
