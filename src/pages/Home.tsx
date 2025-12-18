
import { useNavigate } from "react-router-dom";
import { ExerciseForm } from "../component/mainPage/ExerciseForm";

export const Home = () => {
    const navigate = useNavigate();
    // const [sheetInfo, setSheetInfo] = useState<any>(null); 
    
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
            <div className="text-center p-2">
                <button className="btn btn-danger my-3 me-2" onClick={handleLogout}>
                    Déconnexion 
                </button>
            </div>

            <h1 className="text-center mt-5">

                <a href="https://docs.google.com/spreadsheets/d/1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY" target="_blank" rel="noopener noreferrer">
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

