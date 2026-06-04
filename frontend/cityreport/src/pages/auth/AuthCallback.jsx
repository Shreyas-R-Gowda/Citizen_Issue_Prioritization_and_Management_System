import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (token && email) {
            // Manually set auth state
            localStorage.setItem('token', token);
            const user = { email, role, name };
            localStorage.setItem('user', JSON.stringify(user));

            // Force a reload to pick up the new state in AuthContext
            // Or better, expose a method in AuthContext to set user
            window.location.href = role === 'officer' ? '/officer/dashboard' : '/citizen/dashboard';
        } else {
            navigate('/login?error=auth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Completing sign in...</h2>
            </div>
        </div>
    );
};

export default AuthCallback;
