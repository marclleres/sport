import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';

export const GoogleLoginButton = () => {
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            storage.setAccessToken(tokenResponse.access_token);
            navigate('/week/1');
        },
        scope: 'https://www.googleapis.com/auth/drive',
    });

    return (
        <button className="btn btn-primary" onClick={() => login()}>
            Se connecter avec Google
        </button>
    );
};
