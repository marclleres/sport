import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../components/google';
import { storage } from '../services/storage';

export const GoogleAuthPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = storage.getAccessToken();
        if (token) {
            navigate('/week/1');
        }
    }, [navigate]);

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <h1 className="mb-4">Connexion requise</h1>
                <p className="mb-4">Veuillez vous connecter avec Google pour accéder à l'application</p>
                <GoogleLoginButton />
            </div>
        </div>
    );
};
