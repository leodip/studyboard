import 'flowbite';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { apiUrl, endpoints } from './config';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MotdList from './pages/MotdList';
import SubjectList from './pages/SubjectList';
import About from './pages/About';
import ActivitiesList from './pages/ActivitiesList';
import AuditLogs from './pages/AuditLogs';
import { layout } from './translations.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <div>{layout.loading}</div>;
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/subjects" element={
            <ProtectedRoute user={user}>
              <SubjectList />
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute user={user}>
              <ActivitiesList />
            </ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute user={user}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="/motd" element={
            <ProtectedRoute user={user}>
              <MotdList />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;