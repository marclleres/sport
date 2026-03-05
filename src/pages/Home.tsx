
import { useNavigate, useParams } from "react-router-dom";
import { SwitchTheme } from '../components/theme';
import { ExerciseForm } from '../components/exerciseForm';
import { storage } from '../services/storage';
import { WeekSelector } from '../components/weekSelector';
import { GroupSelector } from '../components/groupSelector';
import { ExerciseFormSkeleton } from '../components/exerciseForm/ExerciseFormSkeleton';

export const Home = () => {
    const navigate = useNavigate();
    const { groupe } = useParams();
    const handleLogout = () => {
        storage.removeAccessToken();
        navigate('/auth');
    };

    return (
        <div className="container px-3">
            <div className="d-flex align-items-center justify-content-center gap-3 py-3">
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                    Déconnexion
                </button>
                <SwitchTheme />
            </div>

            <h3 className="text-center">Program</h3>
            <WeekSelector />
            <GroupSelector />
            <div className="d-flex justify-content-center">
                {groupe ? <ExerciseForm /> : <ExerciseFormSkeleton />}
            </div>
        </div>
    )
}

