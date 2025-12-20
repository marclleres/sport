import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpreadsheetInfo } from '../../services/google/client';
import { useSpreadsheetId } from '../../hooks/useSpreadsheetId';

type SheetInfo = {
    title: string;
    sheetId: number;
    weekNumber: number;
};

export const WeekSelector = () => {
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();
    const [sheets, setSheets] = useState<SheetInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!spreadsheetId) return;

        getSpreadsheetInfo(spreadsheetId)
            .then(data => {
                const weekSheets = data.sheets
                    .map(sheet => {
                        const match = sheet.title.match(/semaine\s*(\d+)/i);
                        return match ? { ...sheet, weekNumber: parseInt(match[1]) } : null;
                    })
                    .filter((sheet): sheet is SheetInfo & { weekNumber: number } => sheet !== null)
                    .sort((a, b) => a.weekNumber - b.weekNumber);

                setSheets(weekSheets);
            })
            .catch(error => console.error('Erreur chargement sheets:', error))
            .finally(() => setIsLoading(false));
    }, [spreadsheetId]);

    if (isLoading) {
        return (
            <div className="text-center p-2">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (sheets.length === 0) {
        return (
            <div className="text-center p-2">
                <p className="text-muted">Aucune semaine trouvée dans le spreadsheet</p>
            </div>
        );
    }

    return (
        <div className="text-center p-2">
            {sheets.map(sheet => (
                <button
                    key={sheet.sheetId}
                    className="btn btn-primary me-2 mb-2"
                    onClick={() => navigate(`/${sheet.weekNumber}`)}
                >
                    Semaine {sheet.weekNumber}
                </button>
            ))}
        </div>
    );
};
