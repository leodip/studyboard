import PropTypes from 'prop-types';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiUrl, endpoints } from '../config';
import { layout } from '../translations';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${apiUrl}${endpoints.user}`, {
                    withCredentials: true
                });
                setUser(response.data.user);
            } catch (error) {
                console.error('Auth error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>{layout.loading}</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default ProtectedRoute;