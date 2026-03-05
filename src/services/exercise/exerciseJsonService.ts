import { getJsonFileFromWeek, listWeekFolders, saveJsonFileToWeek } from '../google/driveClient';

export interface ExerciseSet {
    count: number;
    weight: string;
    position?: number;
}

export interface Exercise {
    exercice: string;
    setCount: number;
    repetitionCount: string;
    rir: number;
    set: ExerciseSet[];
    instensification?: string;
    mouvement: string;
    commentaires?: string;
}

export interface WorkoutSession {
    seance: string;
    exercises: Exercise[];
}

export interface ExerciseData {
    exercise: string;
    set: Array<{ count?: number; weight?: number }>;
    setPlaceHolder: Array<{ count?: number; weight?: number }>;
    repetitions?: string;
    rir?: string;
    multiset?: string;
    youtubeLink?: string;
}

const groupeFileMap: Record<string, string> = {
    'HautDuCorps': 'HautDuCorps.json',
    'Jambes': 'Jambes.json',
    'FullBody': 'FullBody.json'
};

const parseWeight = (weight: string): number => parseFloat(weight.replace('kg', ''));

const mapSets = (sets: ExerciseSet[], count: number) =>
    Array.from({ length: count }, (_, index) => {
        const set = sets.find(s => s.position === index);
        return { count: set?.count, weight: set ? parseWeight(set.weight) : undefined };
    });

/**
 * Récupère la liste des semaines disponibles depuis Google Drive
 */
export const getAvailableWeeks = async (): Promise<number[]> => {
    try {
        return await listWeekFolders();
    } catch (error) {
        console.error('Erreur lors de la récupération des semaines:', error);
        return [];
    }
};

export const loadExercisesFromJson = async (
    semaine: string,
    groupe: string
): Promise<ExerciseData[]> => {
    const weekNumber = parseInt(semaine);
    const fileName = groupeFileMap[groupe];

    if (!fileName) {
        console.warn(`Groupe '${groupe}' non reconnu`);
        return [];
    }

    try {
        const workoutData: WorkoutSession = await getJsonFileFromWeek(weekNumber, fileName);

        let previousExercises: Record<string, ExerciseSet[]> = {};
        if (weekNumber > 1) {
            try {
                const prev = await getJsonFileFromWeek(weekNumber - 1, fileName);
                previousExercises = Object.fromEntries(prev.exercises.map((ex: Exercise) => [ex.exercice, ex.set]));
            } catch {
                // pas de données pour la semaine précédente
            }
        }

        return workoutData.exercises.map(exercise => ({
            exercise: exercise.exercice,
            set: mapSets(exercise.set, exercise.setCount),
            setPlaceHolder: mapSets(previousExercises[exercise.exercice] ?? [], exercise.setCount),
            repetitions: exercise.repetitionCount,
            rir: exercise.rir.toString(),
            multiset: exercise.instensification || '',
            youtubeLink: exercise.mouvement
        }));
    } catch (error) {
        console.error(`Erreur lors du chargement des exercices depuis JSON:`, error);
        return [];
    }
};

export const migrateAllWeeksPositions = async (): Promise<void> => {
    const weeks = await listWeekFolders();
    const fileNames = ['HautDuCorps.json', 'Jambes.json', 'FullBody.json'];

    for (const weekNumber of weeks) {
        for (const fileName of fileNames) {
            try {
                const data: WorkoutSession = await getJsonFileFromWeek(weekNumber, fileName);
                const needsMigration = data.exercises.some(ex => ex.set.some(s => s.position === undefined));
                if (!needsMigration) continue;

                const migratedExercises = data.exercises.map(exercise => ({
                    ...exercise,
                    set: exercise.set.map((s, index) => ({ ...s, position: index })),
                }));

                await saveJsonFileToWeek(weekNumber, fileName, { ...data, exercises: migratedExercises });
                console.log(`Migré: Week${weekNumber}/${fileName}`);
            } catch (e) {
                console.warn(`Migration ignorée pour Week${weekNumber}/${fileName}:`, e);
            }
        }
    }
};

export const saveExercisesToJson = async (
    semaine: string,
    groupe: string,
    exercises: ExerciseData[]
): Promise<void> => {
    const weekNumber = parseInt(semaine);
    const fileName = groupeFileMap[groupe];
    if (!fileName) return;

    const currentData: WorkoutSession = await getJsonFileFromWeek(weekNumber, fileName);

    const updatedExercises = currentData.exercises.map(exercise => {
        const formExercise = exercises.find(e => e.exercise === exercise.exercice);
        if (!formExercise) return exercise;

        const updatedSets: ExerciseSet[] = formExercise.set
            .map((s, index) => ({ s, index }))
            .filter(({ s }) => Number.isFinite(s.count) && Number.isFinite(s.weight) && s.count! > 0 && s.weight! > 0)
            .map(({ s, index }) => ({
                count: s.count!,
                weight: `${s.weight}kg`,
                position: index,
            }));

        return { ...exercise, set: updatedSets };
    });

    await saveJsonFileToWeek(weekNumber, fileName, { ...currentData, exercises: updatedExercises });
};
