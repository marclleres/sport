export interface Exercise {
    exercise: string
    set: Set[],
    setPlaceHolder: Set[]
    repetitions?: string
    multiset?: string
};

export interface Set {
    count?: number,
    weight?: number
};

export interface Inputs {
    exercises: Exercise[]
}

export const defaultExercise: Exercise = {
    exercise: "",
    set: [{ count: undefined, weight: undefined }, { count: undefined, weight: undefined }],
    setPlaceHolder: [{ count: undefined, weight: undefined }, { count: undefined, weight: undefined }]
}