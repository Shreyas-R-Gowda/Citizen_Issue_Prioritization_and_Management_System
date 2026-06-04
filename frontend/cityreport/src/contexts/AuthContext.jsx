import React, { useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from './AuthContextCore';

const getStoredUser = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
};

const getStoredToken = () => localStorage.getItem('token');

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [token, setToken] = useState(getStoredToken);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            // Use URLSearchParams for OAuth2PasswordRequestForm
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': undefined
                },
            });

            const { access_token } = response.data;

            // Store token
            setToken(access_token);
            localStorage.setItem('token', access_token);

            // Set default authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Fetch user details from /auth/me
            const meResponse = await api.get('/auth/me');
            const userInfo = meResponse.data;

            setUser(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo));

            return userInfo;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            await api.post('/auth/register', {
                name,
                email,
                password,
                role
            });

            // After signup, automatically login
            return await login(email, password);
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        login,
        signup,
        logout,
        loading: false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
