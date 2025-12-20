import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpreadsheetNamedRanges } from '../../services/google/client';
import { useSpreadsheetId } from '../../hooks/useSpreadsheetId';

export const GroupSelector = () => {
    const { semaine, groupe } = useParams();
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();
    const [namedRanges, setNamedRanges] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNamedRanges = async () => {
            if (!spreadsheetId || !semaine) return;

            try {
                setLoading(true);
                const allRanges = await getSpreadsheetNamedRanges(spreadsheetId);

                // Filtrer les plages pour la semaine actuelle (format: semaineX_Groupe)
                const prefix = `semaine${semaine}_`;
                const weekRanges = allRanges
                    .filter((name: string) => name.startsWith(prefix))
                    .map((name: string) => name.replace(prefix, '')) // Extraire juste le nom du groupe
                    .sort(); // Trier alphabétiquement pour un ordre cohérent

                setNamedRanges(weekRanges);

                // Si aucun groupe n'est sélectionné et qu'il y a des ranges, sélectionner le premier
                if (!groupe && weekRanges.length > 0 && semaine) {
                    navigate(`/week/${semaine}/${weekRanges[0]}`, { replace: true });
                }
            } catch (error) {
                console.error('Erreur lors du chargement des plages nommées:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNamedRanges();
    }, [spreadsheetId, semaine]);

    if (loading || namedRanges.length === 0) {
        return null;
    }

    return (
        <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
            {namedRanges.map((rangeName) => (
                <button
                    key={rangeName}
                    className={`btn btn-sm ${groupe === rangeName ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => navigate(`/week/${semaine}/${rangeName}`)}
                >
                    {rangeName}
                </button>
            ))}
        </div>
    );
};
