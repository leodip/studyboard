export const apiUrl = import.meta.env.VITE_API_URL || 'https://studyboard.leodip.com';

export const endpoints = {
    hello: '/api/hello',
    login: '/login',
    logout: '/logout',
    callback: '/callback',
    user: '/user-info',
    motd: '/api/motd'
};