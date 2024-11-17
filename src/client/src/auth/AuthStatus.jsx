import { useAuth } from './authHooks';
import { auth } from '../translations';

export function AuthStatus() {
    const { user, loading, error, login, logout } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-transparent animate-spin" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{auth.loading}</span>
            </div>
        );
    }

    if (error) {
        console.error('Auth error:', error);
    }

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