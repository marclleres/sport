import { useFieldArray, useWatch } from "react-hook-form";
import { useState } from "react";
import type { ExerciseItemProps } from "./types";

export const ExerciseItem = ({ exerciseIndex, register, control, remove }: ExerciseItemProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const setsFieldArray = useFieldArray({
        control,
        name: `exercises.${exerciseIndex}.set`
    });
    const multiset = useWatch({ control, name: `exercises.${exerciseIndex}.multiset` });
    const setPlaceHolder = useWatch({ control, name: `exercises.${exerciseIndex}.setPlaceHolder` }) || [];

    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="me-2" style={{ fontSize: '12px' }}>
                        {isOpen ? '▼' : '▶'}
                    </span>
                    <input
                        {...register(`exercises.${exerciseIndex}.exercise`)}
                        className="form-control"
                        placeholder="Nom de l'exercice"
                        onClick={(e) => e.stopPropagation()}
                        readOnly={true}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() => remove(exerciseIndex)}
                >
                    X
                </button>
            </div>

            {isOpen && (
                <div className="card-body">
                    <div className="d-flex gap-3 align-items-baseline">
                        <div className="form-check mb-3">
                            <input
                                {...register(`exercises.${exerciseIndex}.multiset`)}
                                type="checkbox"
                                className="form-check-input"
                                id={`multiset-${exerciseIndex}`}
                            />
                            <label className="form-check-label text-capitalize" htmlFor={`multiset-${exerciseIndex}`}>
                                {multiset || "Multiset"}
                            </label>
                        </div>
                        <input
                            {...register(`exercises.${exerciseIndex}.repetitions`)}
                            className="form-control"
                            placeholder="expected repetitions (e.g., 10-12)"
                            onClick={(e) => e.stopPropagation()}
                            readOnly={true}
                        />
                    </div>
                    <div className="">
                        <div className="d-flex gap-2 mb-2 align-items-center text-muted">
                            <span style={{ minWidth: '50px' }}></span>
                            <span className="form-control border-0 bg-transparent">Répétitions</span>
                            <span className="form-control border-0 bg-transparent">Poids (kg)</span>
                            <span style={{ width: '38px' }}></span>
                        </div>
                        {setsFieldArray.fields.map((setField: any, setIndex) => (
                            <div key={setField.id} className="d-flex gap-2 mb-2 align-items-center">
                                <span>{setIndex + 1}</span>
                                <input
                                    className="form-control placeholder-opacity-25 fw-semibold"
                                    type="number"
                                    placeholder={setPlaceHolder[setIndex]?.count?.toString() || ''}
                                    {...register(`exercises.${exerciseIndex}.set.${setIndex}.count`, {
                                        setValueAs: (v: string) => v === '' ? 0 : Number(v)
                                    })} />
                                <input
                                    className="form-control placeholder-opacity-25 fw-semibold"
                                    type="number"
                                    placeholder={setPlaceHolder[setIndex]?.weight?.toString() || ''}
                                    {...register(`exercises.${exerciseIndex}.set.${setIndex}.weight`, {
                                        setValueAs: (v: string) => v === '' ? 0 : Number(v)
                                    })} />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setsFieldArray.remove(setIndex)}
                                >
                                    X
                                </button>
                            </div>
                        ))}

                        <span title={setsFieldArray.fields.length >= 4 ? "Maximum 4 sets" : ""}>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary mt-2"
                                onClick={() => setsFieldArray.append({ count: undefined, weight: undefined })}
                                disabled={setsFieldArray.fields.length >= 4}
                                style={setsFieldArray.fields.length >= 4 ? { pointerEvents: 'none' } : {}}
                            >
                                + Ajouter un set
                            </button>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
