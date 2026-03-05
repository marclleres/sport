import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadExercisesFromJson, saveExercisesToJson } from './exerciseJsonService';
import * as driveClient from '../google/driveClient';

vi.mock('../google/driveClient');

const mockGetJson = vi.mocked(driveClient.getJsonFileFromWeek);
const mockSaveJson = vi.mocked(driveClient.saveJsonFileToWeek);

const makeSession = (sets: { count: number; weight: string; position: number }[]) => ({
    seance: 'HautDuCorps',
    exercises: [
        {
            exercice: 'Développé couché',
            setCount: 3,
            repetitionCount: '8-10',
            rir: 2,
            set: sets,
            mouvement: 'https://youtube.com/exemple',
        },
    ],
});

beforeEach(() => {
    vi.clearAllMocks();
    mockSaveJson.mockResolvedValue(undefined);
});

// ────────────────────────────────────────────────────────────
// loadExercisesFromJson
// ────────────────────────────────────────────────────────────

describe('loadExercisesFromJson', () => {
    it('charge les sets par position', async () => {
        mockGetJson
            .mockResolvedValueOnce(makeSession([
                { count: 10, weight: '50kg', position: 0 },
                { count: 8, weight: '55kg', position: 2 },
            ]))
            .mockRejectedValueOnce(new Error('pas de semaine précédente'));

        const result = await loadExercisesFromJson('2', 'HautDuCorps');

        expect(result[0].set).toEqual([
            { count: 10, weight: 50 },
            { count: undefined, weight: undefined }, // position 1 absent → vide
            { count: 8, weight: 55 },
        ]);
    });

    it('renvoie des sets vides pour les positions absentes du JSON', async () => {
        mockGetJson
            .mockResolvedValueOnce(makeSession([
                { count: 5, weight: '40kg', position: 2 },
            ]))
            .mockRejectedValueOnce(new Error('pas de semaine précédente'));

        const result = await loadExercisesFromJson('2', 'HautDuCorps');

        expect(result[0].set[0]).toEqual({ count: undefined, weight: undefined });
        expect(result[0].set[1]).toEqual({ count: undefined, weight: undefined });
        expect(result[0].set[2]).toEqual({ count: 5, weight: 40 });
    });

    it('charge les placeholders depuis la semaine précédente', async () => {
        mockGetJson
            .mockResolvedValueOnce(makeSession([
                { count: 10, weight: '50kg', position: 0 },
            ]))
            .mockResolvedValueOnce(makeSession([
                { count: 8, weight: '45kg', position: 0 },
            ]));

        const result = await loadExercisesFromJson('2', 'HautDuCorps');

        expect(result[0].setPlaceHolder[0]).toEqual({ count: 8, weight: 45 });
        expect(result[0].setPlaceHolder[1]).toEqual({ count: undefined, weight: undefined });
    });

    it('pas de placeholders pour la semaine 1', async () => {
        mockGetJson.mockResolvedValueOnce(makeSession([
            { count: 10, weight: '50kg', position: 0 },
        ]));

        const result = await loadExercisesFromJson('1', 'HautDuCorps');

        expect(mockGetJson).toHaveBeenCalledTimes(1);
        expect(result[0].setPlaceHolder).toEqual([
            { count: undefined, weight: undefined },
            { count: undefined, weight: undefined },
            { count: undefined, weight: undefined },
        ]);
    });

    it('retourne [] si le groupe est inconnu', async () => {
        const result = await loadExercisesFromJson('1', 'Inconnu');
        expect(result).toEqual([]);
        expect(mockGetJson).not.toHaveBeenCalled();
    });

    it('retourne [] si Drive échoue', async () => {
        mockGetJson.mockRejectedValueOnce(new Error('Drive KO'));
        const result = await loadExercisesFromJson('1', 'HautDuCorps');
        expect(result).toEqual([]);
    });

    it('mappe les métadonnées de l\'exercice correctement', async () => {
        mockGetJson
            .mockResolvedValueOnce(makeSession([]))
            .mockRejectedValueOnce(new Error());

        const result = await loadExercisesFromJson('2', 'HautDuCorps');

        expect(result[0].exercise).toBe('Développé couché');
        expect(result[0].repetitions).toBe('8-10');
        expect(result[0].rir).toBe('2');
        expect(result[0].youtubeLink).toBe('https://youtube.com/exemple');
    });
});

// ────────────────────────────────────────────────────────────
// saveExercisesToJson
// ────────────────────────────────────────────────────────────

describe('saveExercisesToJson', () => {
    it('sauvegarde les sets avec leur position', async () => {
        mockGetJson.mockResolvedValue(makeSession([]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [
                    { count: 10, weight: 50 },
                    { count: 8, weight: 55 },
                    { count: 6, weight: 60 },
                ],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        expect(saved.exercises[0].set).toEqual([
            { count: 10, weight: '50kg', position: 0 },
            { count: 8, weight: '55kg', position: 1 },
            { count: 6, weight: '60kg', position: 2 },
        ]);
    });

    it('exclut les sets avec count ou weight à 0', async () => {
        mockGetJson.mockResolvedValue(makeSession([]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [
                    { count: 10, weight: 50 },
                    { count: 0, weight: 55 },  // count vide → exclu
                    { count: 8, weight: 0 },   // weight vide → exclu
                ],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        expect(saved.exercises[0].set).toEqual([
            { count: 10, weight: '50kg', position: 0 },
        ]);
    });

    it('exclut les sets avec valeurs undefined/NaN', async () => {
        mockGetJson.mockResolvedValue(makeSession([]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [
                    { count: undefined, weight: undefined },
                    { count: NaN, weight: NaN },
                    { count: 10, weight: 50 },
                ],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        expect(saved.exercises[0].set).toEqual([
            { count: 10, weight: '50kg', position: 2 },
        ]);
    });

    it('conserve la position originale même si les sets précédents sont vides', async () => {
        mockGetJson.mockResolvedValue(makeSession([]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [
                    { count: undefined, weight: undefined }, // position 0 vide
                    { count: 8, weight: 55 },                // position 1
                    { count: undefined, weight: undefined }, // position 2 vide
                ],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        expect(saved.exercises[0].set).toEqual([
            { count: 8, weight: '55kg', position: 1 },
        ]);
    });

    it('sauvegarde un tableau vide si tous les sets sont vidés', async () => {
        mockGetJson.mockResolvedValue(makeSession([
            { count: 10, weight: '50kg', position: 0 },
        ]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [
                    { count: 0, weight: 0 },
                    { count: 0, weight: 0 },
                    { count: 0, weight: 0 },
                ],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        expect(saved.exercises[0].set).toEqual([]);
    });

    it('ne fait rien si le groupe est inconnu', async () => {
        await saveExercisesToJson('1', 'Inconnu', []);
        expect(mockGetJson).not.toHaveBeenCalled();
        expect(mockSaveJson).not.toHaveBeenCalled();
    });

    it('préserve les autres champs de l\'exercice (setCount, rir, etc.)', async () => {
        mockGetJson.mockResolvedValue(makeSession([]));

        await saveExercisesToJson('1', 'HautDuCorps', [
            {
                exercise: 'Développé couché',
                set: [{ count: 10, weight: 50 }],
                setPlaceHolder: [],
            },
        ]);

        const saved = mockSaveJson.mock.calls[0][2] as any;
        const ex = saved.exercises[0];
        expect(ex.setCount).toBe(3);
        expect(ex.rir).toBe(2);
        expect(ex.mouvement).toBe('https://youtube.com/exemple');
    });
});
