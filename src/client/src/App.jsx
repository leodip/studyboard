import 'flowbite';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MotdList from './pages/MotdList';
import SubjectList from './pages/SubjectList';
import About from './pages/About';
import ActivitiesList from './pages/ActivitiesList';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>

          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <SubjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <ActivitiesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motd"
            element={
              <ProtectedRoute>
                <MotdList />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;