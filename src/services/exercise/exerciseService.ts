import { getSpreadsheetData, writeSpreadsheetData, getNamedRangeInfo } from "../google/client";

const parseSetValuesFromRow = (row: string[], startIndex: number = 5, endIndex: number = 8): Array<{ count: number, weight: number }> => {
    const setValues = [];
    for (let i = startIndex; i <= endIndex; i++) {
        if (row[i]) {
            const match = row[i].match(/(\d+)\/(\d+(?:\.\d+)?)kg/);
            if (match) {
                setValues.push({
                    count: parseInt(match[1]),
                    weight: parseFloat(match[2])
                });
            }
        }
    }
    return setValues;
};

export interface ExerciseData {
    exercise: string;
    set: Array<{ count?: number; weight?: number }>;
    setPlaceHolder: Array<{ count?: number; weight?: number }>;
    repetitions?: string;
    rir?: string;
    multiset?: string;
    youtubeLink?: string;
}

export const loadExercisesFromSheets = async (
    spreadsheetId: string,
    semaine: string,
    groupe: string
): Promise<ExerciseData[]> => {
    const semaineAsInt = parseInt(semaine);
    const rangeName = `semaine${semaineAsInt}_${groupe}`;

    const rawData = await getSpreadsheetData(spreadsheetId, rangeName);
    // Ignorer la première colonne et filtrer les lignes vides ou d'en-tête
    const data = rawData?.map((row: string[]) => row.slice(1)).filter((row: string[]) => row[0] && row[0] !== 'Exercice');

    const precedentExercice: Record<string, any[]> = {};
    if (semaineAsInt > 1) {
        const prevRangeName = `semaine${semaineAsInt - 1}_${groupe}`;
        const rawDataBefore = await getSpreadsheetData(spreadsheetId, prevRangeName);
        const dataBefore = rawDataBefore?.map((row: string[]) => row.slice(1)).filter((row: string[]) => row[0] && row[0] !== 'Exercice');
        if (dataBefore && Array.isArray(dataBefore) && dataBefore.length > 0) {
            dataBefore.forEach((row: string[]) => {
                const [name] = row;
                precedentExercice[name] = parseSetValuesFromRow(row);
            });
        }
    }

    if (data && Array.isArray(data) && data.length > 0) {
        return data.map((row: string[]) => {
            const [name, sets, , repetitions, rir] = row;
            const multiset = row[9] || ''; // Méthode d'intensification en colonne L (index 9)
            const youtubeLink = row[10] || ''; // Lien YouTube en colonne M (index 10)

            const currentSetValues = parseSetValuesFromRow(row);
            return {
                exercise: name,
                set: Array.from({ length: parseInt(sets) || 0 }, (_, index) => {
                    const current = currentSetValues[index];
                    return {
                        count: current?.count,
                        weight: current?.weight
                    };
                }),
                setPlaceHolder: Array.from({ length: parseInt(sets) || 0 }, (_, index) => ({
                    count: precedentExercice[name]?.[index]?.count || undefined,
                    weight: precedentExercice[name]?.[index]?.weight || undefined
                })),
                repetitions: repetitions,
                rir: rir,
                multiset: multiset,
                youtubeLink: youtubeLink
            };
        });
    }

    return [];
};

export const saveExercisesToSheets = async (
    spreadsheetId: string,
    semaine: string,
    groupe: string,
    exercises: ExerciseData[]
): Promise<void> => {
    const semaine_Int = parseInt(semaine);
    const rangeName = `semaine${semaine_Int}_${groupe}`;
    const rangeInfo = await getNamedRangeInfo(spreadsheetId, rangeName);

    if (!rangeInfo) {
        console.error('Plage nommée non trouvée:', rangeName);
        return;
    }

    const rows = exercises.map(ex => {
        const row: any[] = [];
        ex.set.forEach(s => {
            if (s?.count !== undefined && s?.weight !== undefined && s?.count !== 0 && s?.weight !== 0) {
                const setValue = `${s.count}/${s.weight}kg`;
                row.push(setValue);
            } else {
                row.push('');
            }
        });
        return row;
    });

    const values = [...rows];
    const seriesColumnIndex = rangeInfo.startColumn + 6; // +6 car: 0=ignoré, 1=Exercice, 2=Séries, 3=vide, 4=Répétitions, 5=RIR, 6=Série1
    const seriesColumnLetter = String.fromCharCode(65 + seriesColumnIndex); // Convertir index en lettre (A=65)
    const startRow = rangeInfo.startRow + 2; // +2 pour passer l'en-tête et commencer aux données (0-indexed + 1 pour l'en-tête + 1 pour passer à la ligne suivante)

    await writeSpreadsheetData(spreadsheetId, `'semaine ${semaine_Int}'!${seriesColumnLetter}${startRow}`, values);
};
