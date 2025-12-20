import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { ExerciseItem } from "./ExerciseItem";
import { useEffect, useState } from "react";
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

    const loadFromSheets = async () => {
        try {
            if (!spreadsheetId) return;
            const semaineAsInt = semaine && parseInt(semaine);
            const data = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!A2:H10`);
            console.log('Données du spreadsheet:', data);

            const precedentExercice: Record<string, any[]> = {};
            if (semaineAsInt && semaineAsInt > 1) {
                const dataBefore = await getSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt - 1}!A2:H10`);
                console.log('Données du spreadsheet semaine précédente:', dataBefore);
                if (dataBefore && Array.isArray(dataBefore) && dataBefore.length > 0) {
                    dataBefore.forEach((row: string[]) => {
                        const [name] = row;
                        precedentExercice[name] = parseSetValuesFromRow(row);
                    });
                    console.log('Dictionnaire précédent:', precedentExercice)
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
            } else {
                // Feuille vide : réinitialiser avec un message
                reset({ exercises: [] });
                setIsLoaded(true);
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
                        const setValue = `${s.count || ''}/${s.weight || ''}kg`;
                        row.push(setValue);
                    }
                });

                return row;
            });

            const values = [...rows];
            console.log(values);
            const semaineAsInt = semaine && parseInt(semaine);
            await writeSpreadsheetData(spreadsheetId, `semaine ${semaineAsInt}!E2`, values);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    useEffect(() => {
        setIsLoaded(false);
        loadFromSheets();
    }, [semaine]);

    // Auto-save avec debounce
    useEffect(() => {
        if (!isLoaded || !debouncedExercises) return;

        saveToSheets({ exercises: debouncedExercises });
    }, [debouncedExercises, isLoaded]);

    const onSubmit = async (data: Inputs) => saveToSheets(data);

    return (
        <div className="d-flex justify-content-center">
            {!isLoaded ? (
                <div className="w-100" style={{ maxWidth: '600px' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card mb-3">
                            <div className="card-header">
                                <div className="placeholder-glow">
                                    <span className="placeholder col-6"></span>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="placeholder-glow">
                                    <span className="placeholder col-4 mb-2"></span>
                                    <span className="placeholder col-8 mb-2"></span>
                                    <span className="placeholder col-6"></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
