import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ConfigurePage = () => {
    const navigate = useNavigate();
    const [spreadsheetId, setSpreadsheetId] = useState(
        localStorage.getItem('spreadsheet_id') || ''
    );

    const handleSave = () => {
        if (!spreadsheetId.trim()) {
            alert('Veuillez entrer un ID de spreadsheet');
            return;
        }
        localStorage.setItem('spreadsheet_id', spreadsheetId);
        alert('ID du spreadsheet sauvegardé !');
        navigate('/');
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Configuration</h1>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <label htmlFor="spreadsheetId" className="form-label">
                                ID du Google Spreadsheet
                            </label>
                            <input
                                type="text"
                                id="spreadsheetId"
                                className="form-control mb-3"
                                value={spreadsheetId}
                                onChange={(e) => setSpreadsheetId(e.target.value)}
                                placeholder="1HHKuHdkRi21bL2u_O1snVZiYnAzZKeFCXwZUkqeQ9DY"
                            />
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary" onClick={handleSave}>
                                    Enregistrer
                                </button>
                                {localStorage.getItem('spreadsheet_id') && (
                                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
