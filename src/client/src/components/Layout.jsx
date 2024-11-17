import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import { Outlet, Link } from 'react-router-dom';
import { layout, navigation } from '../translations.js';
import { AuthStatus } from '../auth/AuthStatus';
import DarkModeToggle from './DarkModeToggle';
import { initFlowbite } from 'flowbite';

export default function Layout({ user, setUser }) {
    const [randomMessage, setRandomMessage] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${apiUrl}${endpoints.motd}`);
                const messages = response.data.messages;
                if (messages && messages.length > 0) {
                    const randomIndex = Math.floor(Math.random() * messages.length);
                    setRandomMessage(messages[randomIndex]);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            initFlowbite();
        }, 100);
    }, []);

    return (
        <div className="flex flex-col min-h-screen antialiased bg-gray-50 dark:bg-gray-900">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 px-3 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
                <div className="flex items-center justify-between mx-auto">
                    {/* Left side - App name/logo */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            data-drawer-target="drawer-navigation"
                            data-drawer-toggle="drawer-navigation"
                            aria-controls="drawer-navigation"
                            className="p-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                            </svg>
                            <span className="sr-only">{layout.toggleSidebar}</span>
                        </button>
                        <Link to="/" className="flex items-center">
                            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                                {layout.appName}
                            </span>
                        </Link>
                    </div>

                    {/* Right side - Dark mode toggle */}
                    <DarkModeToggle />

                </div>
            </nav>

            {/* Wrapper div to handle the layout with sidebar */}
            <div className="flex pt-14">
                {/* Sidebar */}
                <aside
                    id="drawer-navigation"
                    className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 pt-14 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
                    aria-labelledby="drawer-navigation-label"
                >
                    <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800">
                        {/* Close button remains the same ... */}

                        <div className="mb-2 text-center">
                            <AuthStatus user={user} setUser={setUser} />
                        </div>

                        <div className="py-2 overflow-y-auto">
                            <ul className="space-y-2 text-gray-900 dark:text-white">
                                {user && (
                                    <>
                                        <li>
                                            <Link
                                                to="/"
                                                className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                data-drawer-hide="drawer-navigation"
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5" />
                                                </svg>
                                                <span className="ml-3">{navigation.home}</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/subjects"
                                                className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                data-drawer-hide="drawer-navigation"
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 19V4c0-.6.4-1 1-1h12c.6 0 1 .4 1 1v13H7a2 2 0 0 0-2 2Zm0 0c0 1.1.9 2 2 2h12M9 3v14m7-7h0" />
                                                </svg>
                                                <span className="ml-3">{navigation.subjects}</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/activities"
                                                className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                data-drawer-hide="drawer-navigation"
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                                                </svg>
                                                <span className="ml-3">{navigation.activities}</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/audit-logs"
                                                className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                data-drawer-hide="drawer-navigation"
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
                                                </svg>

                                                <span className="ml-3">{navigation.auditLogs}</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/motd"
                                                className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                data-drawer-hide="drawer-navigation"
                                            >
                                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 10.5h.01m-4.01 0h.01M8 10.5h.01M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.6a1 1 0 0 0-.69.275l-2.866 2.723A.5.5 0 0 1 8 18.635V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                                                </svg>
                                                <span className="ml-3">{navigation.messageOfTheDay}</span>
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {/* About link - always visible */}
                                <li>
                                    <Link
                                        to="/about"
                                        className="flex items-center p-2 text-base font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                        data-drawer-hide="drawer-navigation"
                                    >
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span className="ml-3">About</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 w-full min-h-screen p-3 transition-all duration-200 ease-in-out md:p-4 md:ml-64" data-drawer-hide="drawer-navigation">
                    <div className="max-w-screen-xl pb-40 mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:ml-64" data-drawer-hide="drawer-navigation">
                <div className="w-full p-3 mx-auto md:p-4">
                    <div className="text-sm text-center">
                        {randomMessage ? (
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                &quot;{randomMessage.message}&quot;
                                {randomMessage.author && (
                                    <span>
                                        {' - '}
                                        {randomMessage.link ? (
                                            <a
                                                href={randomMessage.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {randomMessage.author}
                                            </a>
                                        ) : (
                                            <span>{randomMessage.author}</span>
                                        )}
                                    </span>
                                )}
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                            </p>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

Layout.propTypes = {
    user: PropTypes.object,
    setUser: PropTypes.func.isRequired
};