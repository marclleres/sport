
import { useNavigate } from "react-router-dom";
import { SwitchTheme } from '../component/theme';
import { ExerciseForm } from '../component/exerciceForm';
import { useSpreadsheetId } from '../hooks/useSpreadsheetId';

export const Home = () => {
    const navigate = useNavigate();
    const spreadsheetId = useSpreadsheetId();

    const handleLogout = () => {
        localStorage.removeItem('google_access_token');
        navigate('/auth');
    };


    // const loadSheetInfo = async () => {
    //     const info = await getSpreadsheetInfo('1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY');
    //     setSheetInfo(info);
    // }


    // useEffect(() => {
    //     loadSheetInfo();
    // }, []);

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

            <h1 className="text-center mt-5">
                <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank" rel="noopener noreferrer">
                    Program
                </a>
            </h1>
            {/* {sheetInfo.map((sheet: any) => {
                <p key={sheet.sheetId} className="text-center">Feuille: {sheet.title}</p>
                <button className="text-center btn btn-primary me-2" onClick={() => navigate('/1')}>
                    Semaine 1
                </button>

            })} */}
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

