import { useForm, useFieldArray } from "react-hook-form"
import { ExerciseItem } from "./ExerciseItem";
import { defaultExercise, type Inputs } from "./interface";
import { useEffect } from "react";
import { getSpreadsheetData, writeSpreadsheetData } from "../../services/google/client"
import { useParams } from "react-router-dom";

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
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    })

    const loadFromSheets = async () => {
        try {
            const semaineAsInt = semaine && parseInt(semaine);
            const data = await getSpreadsheetData('1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY', `semaine ${semaineAsInt}!A2:D10`);
            console.log('Données du spreadsheet:', data);

            const precedentExercice: Record<string, any[]> = {};
            if (semaineAsInt && semaineAsInt > 1) {
                const dataBefore = await getSpreadsheetData('1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY', `semaine ${semaineAsInt - 1}!A2:H10`);
                console.log('Données du spreadsheet semaine précédente:', dataBefore);
                if (dataBefore && Array.isArray(dataBefore) && dataBefore.length > 0) {
                    dataBefore.forEach((row: string[]) => {
                        const [name] = row;
                        const setArray = [];

                        for (let i = 4; i <= 7; i++) {
                            if (row[i]) {
                                const match = row[i].match(/(\d+)\/(\d+)kg/);
                                if (match) {
                                    setArray.push({
                                        count: parseInt(match[1]),
                                        weight: parseInt(match[2])
                                    });
                                }
                            }
                        }

                        precedentExercice[name] = setArray;
                    });
                    console.log('Dictionnaire précédent:', precedentExercice)
                }
            }

            if (data && Array.isArray(data) && data.length > 0) {
                const exercises = data.map(([name, sets, repetitions, multiset]: [string, string, string, string]) => ({
                    exercise: name,
                    set: Array.from({ length: parseInt(sets) }, (_) => ({
                        count: undefined,
                        weight: undefined
                    })),
                    setPlaceHolder: Array.from({ length: parseInt(sets) }, (_, index) => ({
                        count: precedentExercice[name]?.[index]?.count || undefined,
                        weight: precedentExercice[name]?.[index]?.weight || undefined
                    })),
                    repetitions: repetitions,
                    multiset: multiset
                }));

                reset({ exercises });
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const saveToSheets = async (data: Inputs) => {
        try {
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

            await writeSpreadsheetData('1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY', 'exercice!D2', values);
            alert('Données sauvegardées dans Google Sheets !');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    useEffect(() => {
        loadFromSheets();
    }, [semaine]);

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

                <div className="pb-2">
                    <input type="submit" className="btn btn-success" value="Soumettre" />
                </div>
            </form>
        </div>
    )
}
