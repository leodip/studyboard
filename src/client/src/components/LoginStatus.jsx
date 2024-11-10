import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';

const LoginStatus = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${apiUrl}${endpoints.user}`, {
                    withCredentials: true
                });
                console.log('User:', response.data.user);
                setUser(response.data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.get(`${apiUrl}${endpoints.login}`, {
                withCredentials: true
            });
            if (response.data.loginUrl) {
                window.location.href = response.data.loginUrl;
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${apiUrl}${endpoints.logout}`, {}, {
                withCredentials: true
            });
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-gray-300">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-transparent animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-gray-300">
                        Welcome, <span className="font-medium">{user.name || user.email}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 text-sm text-gray-300 transition-colors border border-gray-600 rounded-md hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Login
                </button>
            )}
        </div>
    );
};

export default LoginStatus;