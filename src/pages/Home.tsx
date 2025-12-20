
import { useNavigate } from "react-router-dom";
import { SwitchTheme } from '../components/theme';
import { ExerciseForm } from '../components/exerciseForm';
import { useSpreadsheetId } from '../hooks/useSpreadsheetId';
import { storage } from '../services/storage';

export const Home = () => {
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();

    const handleLogout = () => {
        storage.removeAccessToken();
        navigate('/auth');
    };

    return (
        <div className="container">
            <div className="d-flex align-items-center justify-content-center gap-3 py-3">
                <button className="btn btn-danger" onClick={handleLogout}>
                    Déconnexion
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/configure')}>
                    ⚙️
                </button>
                <SwitchTheme />
            </div>

            <h3 className="text-center">
                <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank" rel="noopener noreferrer">
                    Program
                </a>
            </h3>
            <div className="text-center p-2">
                <button className="text-center btn btn-primary me-2" onClick={() => navigate('/1')}>
                    Semaine 1
                </button>
                <button className="text-center btn btn-primary me-2" onClick={() => navigate('/2')}>
                    Semaine 2
                </button>
            </div>
            <ExerciseForm />
        </div>
    )
}

