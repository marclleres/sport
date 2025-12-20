import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storage } from '../services/storage';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const token = storage.getAccessToken();

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                // Vérifier si le token est valide en faisant un appel à Google
                const response = await fetch(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
                );

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    // Token invalide ou expiré
                    storage.removeAccessToken();
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Erreur de vérification du token:', error);
                storage.removeAccessToken();
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, [token]);

    // Afficher un loader pendant la vérification
    if (isAuthenticated === null) {
        return <div>Vérification de l'authentification...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};
