import { createContext, useContext } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';

// Create Authentication Context
export const AuthContext = createContext(null);

// Custom hook to use authentication context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Authentication helper functions
export const authService = {
    async checkAuth() {
        const response = await axios.get(`${apiUrl}${endpoints.user}`, {
            withCredentials: true
        });
        return response.data.user;
    },

    async login() {
        const response = await axios.get(`${apiUrl}${endpoints.login}`, {
            withCredentials: true
        });
        if (response.data.loginUrl) {
            window.location.href = response.data.loginUrl;
        }
    },

    async logout() {
        const response = await axios.post(`${apiUrl}${endpoints.logout}`, {}, {
            withCredentials: true
        });
        if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
        } else {
            window.location.href = '/';
        }
    }
};