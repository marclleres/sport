import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvailableWeeks } from '../../services/exercise';
import { createNextWeek } from '../../services/google/driveClient';

export const WeekSelector = () => {
    const navigate = useNavigate();
    const { semaine, groupe } = useParams();
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([1]); // Par défaut Week1
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const loadWeeks = async () => {
        setIsLoading(true);
        try {
            const weeks = await getAvailableWeeks();
            if (weeks.length > 0) {
                setAvailableWeeks(weeks);
            }
        } catch (error) {
            console.warn('Erreur lors du chargement des semaines, utilisation de Week1 par défaut:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWeeks();
    }, []);

    useEffect(() => {
        // Rediriger vers la première semaine si aucune n'est sélectionnée
        if (!semaine && availableWeeks.length > 0) {
            navigate(`/week/${availableWeeks[0]}${groupe ? `/${groupe}` : ''}`, { replace: true });
        }
    }, [semaine, groupe, navigate, availableWeeks]);

    const handleCreateNextWeek = async () => {
        setIsCreating(true);
        try {
            const newWeek = await createNextWeek();
            await loadWeeks();
            navigate(`/week/${newWeek}${groupe ? `/${groupe}` : ''}`);
        } catch (error) {
            console.error('Erreur lors de la création de la semaine:', error);
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center p-2">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center justify-content-center gap-2 p-2">
            <select
                className="form-select form-select-sm w-auto"
                value={semaine || ''}
                onChange={(e) => navigate(`/week/${e.target.value}${groupe ? `/${groupe}` : ''}`)}
            >
                <option value="">Sélectionner une semaine</option>
                {availableWeeks.map(weekNumber => (
                    <option key={weekNumber} value={weekNumber}>
                        Semaine {weekNumber}
                    </option>
                ))}
            </select>
            <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleCreateNextWeek}
                disabled={isCreating}
                title="Créer la semaine suivante"
            >
                {isCreating
                    ? <span className="spinner-border spinner-border-sm" role="status" />
                    : '+'
                }
            </button>
        </div>
    );
};
