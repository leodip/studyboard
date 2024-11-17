import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { AuthContext, authService } from './authHooks';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            const userData = await authService.checkAuth();
            setUser(userData);
            setError(null);
        } catch (err) {
            setUser(null);
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle login
    const login = async () => {
        try {
            await authService.login();
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    // Function to handle logout
    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Logout failed');
            window.location.href = '/';
        }
    };

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};