import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const availableGroups = ['HautDuCorps', 'Jambes', 'FullBody'];

export const GroupSelector = () => {
    const { semaine, groupe } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (semaine && (!groupe || !availableGroups.includes(groupe))) {
            navigate(`/week/${semaine}/${availableGroups[0]}`, { replace: true });
        }
    }, [semaine, groupe, navigate]);

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
