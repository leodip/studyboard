import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';

function HomePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${apiUrl}${endpoints.user}`, {
                    withCredentials: true
                });
                setUser(response.data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <section className="text-center">
                    <div className="h-10 mb-4 bg-gray-800 rounded animate-pulse"></div>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="text-center">
                {user && (
                    <h1 className="mb-4 text-4xl font-bold text-white">
                        Seja bem vindo(a)
                    </h1>
                )}
            </section>
        </div>
    );
}

export default HomePage;