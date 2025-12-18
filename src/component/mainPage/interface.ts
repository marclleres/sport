export type Exercise = {
    exercise: string
    set: Set[],
    setPlaceHolder: Set[]
    repetitions?: string
    multiset?: string
};

export type Set = {
    count?: number,
    weight?: number
};

export type Inputs = {
    exercises: Exercise[]
}

export const defaultExercise: Exercise = {
    exercise: "",
    set: [{ count: undefined, weight: undefined }, { count: undefined, weight: undefined }],
    setPlaceHolder: [{ count: undefined, weight: undefined }, { count: undefined, weight: undefined }]
}