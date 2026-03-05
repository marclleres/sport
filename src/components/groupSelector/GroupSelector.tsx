import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface GroupSelectorProps {
    onLoadingChange?: (loading: boolean) => void;
}

const availableGroups = ['HautDuCorps', 'Jambes', 'FullBody'];

export const GroupSelector = ({ onLoadingChange }: GroupSelectorProps = {}) => {
    const { semaine, groupe } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    useEffect(() => {
        // Rediriger vers le premier groupe si aucun n'est sélectionné ou si le groupe est invalide
        if (semaine && (!groupe || !availableGroups.includes(groupe))) {
            navigate(`/week/${semaine}/${availableGroups[0]}`, { replace: true });
        }
    }, [semaine, groupe, navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                <div className="btn btn-sm btn-outline-primary placeholder-glow">
                    <span className="placeholder col-12" style={{ width: '80px' }}></span>
                </div>
                <div className="btn btn-sm btn-outline-primary placeholder-glow">
                    <span className="placeholder col-12" style={{ width: '80px' }}></span>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
            {availableGroups.map((groupName) => (
                <button
                    key={groupName}
                    className={`btn btn-sm ${groupe === groupName ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => navigate(`/week/${semaine}/${groupName}`)}
                >
                    {groupName === 'HautDuCorps' ? 'Haut du corps' : groupName === 'FullBody' ? 'Full Body' : groupName}
                </button>
            ))}
        </div>
    );
};
