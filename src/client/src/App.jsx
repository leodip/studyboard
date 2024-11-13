import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from './config';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import MessageOfTheDayManagement from './pages/MessageOfTheDayManagement';
import SubjectManagement from './pages/SubjectManagement';
import ActivityManagement from './pages/ActivityManagement';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
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
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/error" element={<ErrorPage />} />
                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <HomePage />
                        </MainLayout>
                    }
                />
                <Route
                    path="/motd-management"
                    element={
                        <MainLayout>
                            <ProtectedRoute user={user}>
                                <MessageOfTheDayManagement />
                            </ProtectedRoute>
                        </MainLayout>
                    }
                />
                <Route
                    path="/subject-management"
                    element={
                        <MainLayout>
                            <ProtectedRoute user={user}>
                                <SubjectManagement />
                            </ProtectedRoute>
                        </MainLayout>
                    }
                />
                <Route
                    path="/activities"
                    element={
                        <MainLayout>
                            <ProtectedRoute user={user}>
                                <ActivityManagement />
                            </ProtectedRoute>
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;