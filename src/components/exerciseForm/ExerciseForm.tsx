import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { ExerciseItem } from "./ExerciseItem";
import { useEffect, useState, useCallback } from "react";
import { getSpreadsheetData, writeSpreadsheetData } from "../../services/google/client"
import { useParams } from "react-router-dom";
import { defaultExercise, type Inputs } from "./interface";
import { useSpreadsheetId } from "../../hooks/useSpreadsheetId";

const parseSetValuesFromRow = (row: string[], startIndex: number = 4, endIndex: number = 7): Array<{ count: number, weight: number }> => {
    const setValues = [];
    for (let i = startIndex; i <= endIndex; i++) {
        if (row[i]) {
            const match = row[i].match(/(\d+)\/(\d+)kg/);
            if (match) {
                setValues.push({
                    count: parseInt(match[1]),
                    weight: parseInt(match[2])
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
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    })

    const watchedExercises = useWatch({ control, name: "exercises" })
    const debouncedExercises = useDebounce(watchedExercises, 2000);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const loadFromSheets = useCallback(async () => {
        try {
            if (!spreadsheetId) return;
            const semaineAsInt = semaine && parseInt(semaine);
            const data = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!A2:H10`);

            const precedentExercice: Record<string, Array<{ count: number, weight: number }>> = {};
            if (semaineAsInt && semaineAsInt > 1) {
                const dataBefore = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt - 1}!A2:H10`);
                if (dataBefore && Array.isArray(dataBefore) && dataBefore.length > 0) {
                    dataBefore.forEach((row: string[]) => {
                        const [name] = row;
                        precedentExercice[name] = parseSetValuesFromRow(row);
                    });
                }
            }

            if (data && Array.isArray(data) && data.length > 0) {
                const exercises = data.map((row: string[]) => {
                    const [name, sets, repetitions, multiset] = row;
                    const currentSetValues = parseSetValuesFromRow(row);
                    return {
                        exercise: name,
                        set: Array.from({ length: parseInt(sets) }, (_, index) => ({
                            count: currentSetValues[index]?.count || undefined,
                            weight: currentSetValues[index]?.weight || undefined
                        })),
                        setPlaceHolder: Array.from({ length: parseInt(sets) }, (_, index) => ({
                            count: precedentExercice[name]?.[index]?.count || undefined,
                            weight: precedentExercice[name]?.[index]?.weight || undefined
                        })),
                        repetitions: repetitions,
                        multiset: multiset
                    };
                });

                reset({ exercises });
                setIsLoaded(true);
                setHasLoadedOnce(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [spreadsheetId, semaine, reset]);

    const saveToSheets = useCallback(async (data: Inputs) => {
        try {
            if (!spreadsheetId) return;
            const rows = data.exercises.map(ex => {
                const row: string[] = [];
                ex.set.forEach(s => {
                    if (s?.count && s?.weight) {
                        const setValue = `${s.count}/${s.weight}kg`;
                        row.push(setValue);
                    }
                });

                return row;
            });

            const values = [...rows];
            const semaineAsInt = semaine && parseInt(semaine);
            await writeSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!E2`, values);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [spreadsheetId, semaine]);

    useEffect(() => {
        loadFromSheets();
    }, [loadFromSheets]);

    // Auto-save avec debounce (skip premier chargement)
    useEffect(() => {
        if (!isLoaded || !hasLoadedOnce || !debouncedExercises) return;

        saveToSheets({ exercises: debouncedExercises });
    }, [debouncedExercises, isLoaded, hasLoadedOnce, saveToSheets]);

    const onSubmit = async (data: Inputs) => saveToSheets(data);

    return (
        <div className="d-flex justify-content-center">
            <form onSubmit={handleSubmit(onSubmit)}>
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
            </form>
        </div>
    )
}
