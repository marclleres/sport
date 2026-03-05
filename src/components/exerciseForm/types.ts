import type { Control, UseFormRegister } from "react-hook-form";
import type { Inputs } from "./interface";

export interface ExerciseItemProps {
    exerciseIndex: number;
    register: UseFormRegister<Inputs>;
    control: Control<Inputs>;
    clearSet: (setIndex: number) => void;
}
