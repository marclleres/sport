import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { ExerciseItem } from "./ExerciseItem";
import { ExerciseFormSkeleton } from "./ExerciseFormSkeleton";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { defaultExercise, type Inputs } from "./interface";
import { loadExercisesFromJson, saveExercisesToJson } from "../../services/exercise";

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

    const { semaine, groupe } = useParams()
    const [isLoaded, setIsLoaded] = useState(false)
    const justLoadedRef = useRef(false)
    const lastLoadedGroupRef = useRef<string | null>(null)
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    })

    const watchedExercises = useWatch({ control, name: "exercises" })
    const debouncedExercises = useDebounce(watchedExercises, 2000);

    const loadFromJson = async () => {
        try {
            if (!groupe || !semaine) return;

            const exercises = await loadExercisesFromJson(semaine, groupe);

            if (exercises.length > 0) {
                reset({ exercises });
                lastLoadedGroupRef.current = groupe;
                setIsLoaded(true);
                justLoadedRef.current = true;
            } else {
                reset({ exercises: [] });
                lastLoadedGroupRef.current = groupe;
                setIsLoaded(true);
                justLoadedRef.current = true;
            }
        } catch (error) {
            console.error('Erreur:', error);
            setIsLoaded(true);
        }
    };

    const saveToJson = async (data: Inputs) => {
        try {
            if (!groupe || !semaine) return;
            await saveExercisesToJson(semaine, groupe, data.exercises);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    useEffect(() => {
        if (lastLoadedGroupRef.current !== groupe) {
            setIsLoaded(false);
        }
        loadFromJson();
    }, [semaine, groupe]);

    useEffect(() => {
        if (!isLoaded || !debouncedExercises) return;

        if (justLoadedRef.current) {
            justLoadedRef.current = false;
            return;
        }

        saveToJson({ exercises: debouncedExercises });
    }, [debouncedExercises, isLoaded]);

    const onSubmit = async (data: Inputs) => saveToJson(data);

    return (
        <>
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
                                disabled={true}
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
                                disabled={true}
                            >
                                Ajouter un exercice
                            </button>
                        </>
                    )}
                </form>
            )}
        </>
    )
}
