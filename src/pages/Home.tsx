
import { useNavigate } from "react-router-dom";
import { SwitchTheme } from '../components/theme';
import { ExerciseForm } from '../components/exerciseForm';
import { useSpreadsheetId } from '../hooks/useSpreadsheetId';
import { storage } from '../services/storage';
import { WeekSelector } from '../components/weekSelector';

export const Home = () => {
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();

    const handleLogout = () => {
        storage.removeAccessToken();
        navigate('/auth');
    };

    return (
        <div className="container px-3">
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
            <WeekSelector />
            <ExerciseForm />
        </div>
    )
}

