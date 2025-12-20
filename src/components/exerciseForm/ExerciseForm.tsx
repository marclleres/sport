import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { ExerciseItem } from "./ExerciseItem";
import { ExerciseFormSkeleton } from "./ExerciseFormSkeleton";
import { useEffect, useState, useRef } from "react";
import { getSpreadsheetData, writeSpreadsheetData } from "../../services/google/client"
import { useParams } from "react-router-dom";
import { defaultExercise, type Inputs } from "./interface";
import { useSpreadsheetId } from "../../hooks/useSpreadsheetId";

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

// Hook de debounce personnalisé
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export const ExerciseForm = () => {
    const {
        register,
        handleSubmit,
        control,
        reset
    } = useForm<Inputs>({
        defaultValues: {
            exercises: [defaultExercise]
        }
    })

    const { semaine } = useParams()
    const spreadsheetId = useSpreadsheetId()
    const [isLoaded, setIsLoaded] = useState(false)
    const justLoadedRef = useRef(false)
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    })

    const watchedExercises = useWatch({ control, name: "exercises" })
    const debouncedExercises = useDebounce(watchedExercises, 2000);

    const loadFromSheets = async () => {
        try {
            if (!spreadsheetId) return;
            const semaineAsInt = semaine && parseInt(semaine);
            const data = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!C12:M21`);

            const precedentExercice: Record<string, any[]> = {};
            if (semaineAsInt && semaineAsInt > 1) {
                const dataBefore = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt - 1}!C12:M21`);
                if (dataBefore && Array.isArray(dataBefore) && dataBefore.length > 0) {
                    dataBefore.forEach((row: string[]) => {
                        const [name] = row;
                        precedentExercice[name] = parseSetValuesFromRow(row);
                    });
                }
            }

            if (data && Array.isArray(data) && data.length > 0) {
                const exercises = data.map((row: string[]) => {
                    // Colonnes C12:M21 → index 0-10: Exercice, Séries, (vide), Répétitions, Intensité (RIR), Série 1-4, Méthode, Lien YouTube
                    const [name, sets, , repetitions, rir, ...rest] = row;
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

                reset({ exercises });
                setIsLoaded(true);
                justLoadedRef.current = true;
            } else {
                // Feuille vide : réinitialiser avec un message
                reset({ exercises: [] });
                setIsLoaded(true);
                justLoadedRef.current = true;
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const saveToSheets = async (data: Inputs) => {
        try {
            if (!spreadsheetId) return;
            const rows = data.exercises.map(ex => {
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
            const semaineAsInt = semaine && parseInt(semaine);
            // Écriture dans les colonnes H à K (Série 1 à 4) à partir de la ligne 12
            await writeSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!H12`, values);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    useEffect(() => {
        setIsLoaded(false);
        loadFromSheets();
    }, [semaine]);

    // Auto-save avec debounce (skip si on vient de charger)
    useEffect(() => {
        if (!isLoaded || !debouncedExercises) return;

        if (justLoadedRef.current) {
            justLoadedRef.current = false;
            return;
        }

        saveToSheets({ exercises: debouncedExercises });
    }, [debouncedExercises, isLoaded]);

    const onSubmit = async (data: Inputs) => saveToSheets(data);

    return (
        <div className="d-flex justify-content-center">
            {!isLoaded ? (
                <ExerciseFormSkeleton />
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    {fields.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-muted mb-3">Cette semaine ne contient pas encore d'exercices</p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => append(defaultExercise)}
                            >
                                Ajouter un exercice
                            </button>
                        </div>
                    ) : (
                        <>
                            {fields.map((field, exerciseIndex) => (
                                <ExerciseItem
                                    key={field.id}
                                    exerciseIndex={exerciseIndex}
                                    register={register}
                                    control={control}
                                    remove={remove}
                                />
                            ))}

                            <button
                                type="button"
                                className="btn btn-primary mb-3"
                                onClick={() => append(defaultExercise)}
                            >
                                Ajouter un exercice
                            </button>
                        </>
                    )}
                </form>
            )}
        </div>
    )
}
