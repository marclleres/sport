import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '../component/google/GoogleLoginButton';

export const GoogleAuthPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('google_access_token');
        if (token) {
            navigate('/1');
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
