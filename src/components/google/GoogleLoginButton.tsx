import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';

export const GoogleLoginButton = () => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            storage.setAccessToken(tokenResponse.access_token);

            // Récupérer les infos utilisateur
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });

            const userData = await userInfo.json();
            setUser(userData);

            navigate('/week/1');
        },
        scope: 'https://www.googleapis.com/auth/drive',
    });

    const logout = () => {
        setUser(null);
        storage.removeAccessToken();
    };

    return (
        <div>
            {!user ? (
                <button className="btn btn-primary" onClick={() => login()}>
                    Se connecter avec Google
                </button>
            ) : (
                <div>
                    <p>Connecté en tant que: {user.name} </p>
                    < button className="btn btn-secondary" onClick={logout} >
                        Se déconnecter
                    </button>
                </div>
            )}
        </div>
    );
};