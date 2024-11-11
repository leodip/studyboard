import PropTypes from 'prop-types';
import axios from 'axios';
import { apiUrl, endpoints } from '../../config';

const LoginStatus = ({ user = null, setUser, loading }) => {
    const getUserRole = (groups) => {
        if (!groups) return 'Guest';
        if (groups.includes('studyboard-admins')) return 'Administrador';
        if (groups.includes('studyboard-users')) return 'Utilizador';
        return 'Convidado';
    };

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
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-gray-300">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-transparent animate-spin" />
                <span>A carregar...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                        <span className="text-gray-300">
                            <span className="font-medium">{user.name || user.email}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                            {getUserRole(user.groups)}
                        </span>
                    </div>
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

LoginStatus.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        groups: PropTypes.arrayOf(PropTypes.string)
    }),
    setUser: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

export default LoginStatus;