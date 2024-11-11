import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';

function Footer() {
    const [motd, setMotd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/motd`, {
                    withCredentials: true
                });

                if (response.data.messages && response.data.messages.length > 0) {
                    const randomIndex = Math.floor(Math.random() * response.data.messages.length);
                    setMotd(response.data.messages[randomIndex]);
                }
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                setError('Failed to load message of the day');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const renderMotd = () => {
        if (loading) {
            return <span className="text-gray-400">Loading...</span>;
        }

        if (error || !motd) {
            return <span className="text-gray-400">Your personal learning companion</span>;
        }

        return (
            <div className="flex flex-col items-center justify-center space-y-1">
                <p className="text-gray-300">
                    {motd.message}
                </p>
                {motd.link ? (
                    <p className="text-sm text-gray-400">
                        — <a
                            href={motd.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                        >
                            {motd.author || 'link'}
                        </a>
                    </p>
                ) : motd.author ? (
                    <p className="text-sm text-gray-400">
                        — {motd.author}
                    </p>
                ) : null}
            </div>
        );
    };

    return (
        <footer className="bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {renderMotd()}
            </div>
        </footer>
    );
}

export default Footer;