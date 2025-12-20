import type { Control, UseFormRegister, UseFieldArrayRemove } from "react-hook-form";
import type { Inputs } from "./interface";

export interface ExerciseItemProps {
    exerciseIndex: number;
    register: UseFormRegister<Inputs>;
    control: Control<Inputs>;
    remove: UseFieldArrayRemove;
}
