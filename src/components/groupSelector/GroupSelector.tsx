import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpreadsheetNamedRanges } from '../../services/google/client';
import { useSpreadsheetId } from '../../hooks/useSpreadsheetId';

interface GroupSelectorProps {
    onLoadingChange?: (loading: boolean) => void;
}

export const GroupSelector = ({ onLoadingChange }: GroupSelectorProps = {}) => {
    const { semaine, groupe } = useParams();
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();
    const [namedRanges, setNamedRanges] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    useEffect(() => {
        const loadNamedRanges = async () => {
            if (!spreadsheetId || !semaine) return;

            try {
                setLoading(true);
                const allRanges = await getSpreadsheetNamedRanges(spreadsheetId);

                const prefix = `semaine${semaine}_`;
                const weekRanges = allRanges
                    .filter((name: string) => name.startsWith(prefix))
                    .map((name: string) => name.replace(prefix, ''))
                    .sort();

                setNamedRanges(weekRanges);

                if (weekRanges.length > 0 && semaine) {
                    if (!groupe || !weekRanges.includes(groupe)) {
                        navigate(`/week/${semaine}/${weekRanges[0]}`, { replace: true });
                        return;
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des plages nommées:', error);
                setLoading(false);
            }
        };

        loadNamedRanges();
    }, [spreadsheetId, semaine, groupe]);

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

    if (namedRanges.length === 0) {
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
