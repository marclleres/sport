import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../components/google';
import { storage } from '../services/storage';

export const GoogleAuthPage = () => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAndRedirect = async () => {
            const token = storage.getAccessToken();
            if (token) {
                try {
                    // Vérifier si le token est valide
                    const response = await fetch(
                        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
                    );

                    if (response.ok) {
                        // Token valide, rediriger
                        navigate('/week/1', { replace: true });
                    } else {
                        // Token invalide, le supprimer
                        storage.removeAccessToken();
                        setIsChecking(false);
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification du token:', error);
                    storage.removeAccessToken();
                    setIsChecking(false);
                }
            } else {
                setIsChecking(false);
            }
        };

        verifyAndRedirect();
    }, [navigate]);

    if (isChecking) {
        return (
            <div className="container">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Vérification...</span>
                    </div>
                </div>
            </div>
        );
    }

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
