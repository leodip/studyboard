import { useState } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';

function HomePage() {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMessage = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${apiUrl}${endpoints.hello}`, {
                withCredentials: true
            });
            setMessage(response.data.message);
        } catch (err) {
            setError('Failed to fetch message from server');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <section className="text-center">
                <h1 className="mb-4 text-4xl font-bold text-white">
                    Welcome to Studyflix
                </h1>
                <p className="text-xl text-gray-300">
                    Your personal learning companion
                </p>
            </section>

            {/* Demo Section */}
            <section className="p-6 space-y-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-semibold text-white">
                    API Connection Demo
                </h2>

                <div className="space-y-4">
                    <button
                        onClick={fetchMessage}
                        disabled={isLoading}
                        className="px-4 py-2 font-bold text-white transition-colors bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Loading...' : 'Fetch Message'}
                    </button>

                    {message && (
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <p className="text-white">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-900 rounded-lg">
                            <p className="text-red-200">{error}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature Card 1 */}
                <div className="p-6 space-y-3 bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">
                        Personalized Learning
                    </h3>
                    <p className="text-gray-300">
                        Customize your learning experience to match your pace and style.
                    </p>
                </div>

                {/* Feature Card 2 */}
                <div className="p-6 space-y-3 bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">
                        Track Progress
                    </h3>
                    <p className="text-gray-300">
                        Monitor your learning journey with detailed progress tracking.
                    </p>
                </div>

                {/* Feature Card 3 */}
                <div className="p-6 space-y-3 bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">
                        Study Groups
                    </h3>
                    <p className="text-gray-300">
                        Connect with fellow learners and share knowledge.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default HomePage;