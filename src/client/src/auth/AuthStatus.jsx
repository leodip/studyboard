// src/client/src/auth/AuthStatus.jsx
import PropTypes from 'prop-types';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import { auth } from '../translations';

export function AuthStatus({ user, setUser }) {
    const login = async () => {
        try {
            const response = await axios.get(`${apiUrl}${endpoints.login}`, {
                withCredentials: true
            });
            if (response.data.loginUrl) {
                window.location.href = response.data.loginUrl;
            }
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post(`${apiUrl}${endpoints.logout}`, {}, {
                withCredentials: true
            });
            setUser(null);
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else {
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Logout failed:', err);
            window.location.href = '/';
        }
    };

    return (
        <div className="text-center text-gray-500 dark:text-gray-400">
            {user ? (
                <>
                    <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                        {user.name || user.email}
                    </h3>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        {user.email}
                    </p>
                    <button
                        onClick={logout}
                        className="inline-flex items-center justify-center w-full py-2.5 px-5 my-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        {auth.logout}
                    </button>
                </>
            ) : (
                <button
                    onClick={login}
                    className="inline-flex items-center justify-center w-full py-2.5 px-5 my-5 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-transparent hover:bg-blue-700 focus:z-10 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-700"
                >
                    {auth.login}
                </button>
            )}
        </div>
    );
}

AuthStatus.propTypes = {
    user: PropTypes.object,
    setUser: PropTypes.func.isRequired
};