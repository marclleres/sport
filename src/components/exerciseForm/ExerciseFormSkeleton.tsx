export const ExerciseFormSkeleton = () => {
    return (
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
    );
};
