import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import MessageOfTheDayManagement from './pages/MessageOfTheDayManagement';
import SubjectManagement from './pages/SubjectManagement';

function App() {
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
                            <MessageOfTheDayManagement />
                        </MainLayout>
                    }
                />
                <Route
                    path="/subject-management"
                    element={
                        <MainLayout>
                            <SubjectManagement />
                        </MainLayout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;