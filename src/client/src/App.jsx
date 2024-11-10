import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';

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
            </Routes>
        </Router>
    );
}

export default App;