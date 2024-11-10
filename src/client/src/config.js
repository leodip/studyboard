// /client/src/config.js
export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const endpoints = {
    hello: '/api/hello',
    login: '/login',
    logout: 'logout',
    callback: '/callback',
    user: '/user-info'
};