import { useEffect, useState } from "react";

export const SwitchTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(
        (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    );

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (<div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" role="switch" id="themeSwitch" checked={theme === 'dark'} onChange={toggleTheme} style={{
            cursor: 'pointer',
            width: '3rem',
            height: '1.5rem'
        }} />
        <label className="form-check-label ms-2" htmlFor="themeSwitch" style={{
            cursor: 'pointer'
        }}>
            {theme === 'dark' ? '🌙' : '☀️'}
        </label>
    </div>);
}