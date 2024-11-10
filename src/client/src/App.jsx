import { useState } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from './config';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorPage from './components/ErrorPage';
import LoginStatus from './components/LoginStatus';

function App() {
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
    <Router>
      <Routes>
        <Route path="/error" element={<ErrorPage />} />
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-900">
              <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
                <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">
                      Studyflix
                    </h1>
                    <LoginStatus />
                  </div>
                </div>
              </header>

              <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="space-y-4">
                  <button
                    onClick={fetchMessage}
                    disabled={isLoading}
                    className="px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : 'Fetch Message'}
                  </button>

                  {message && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-white">{message}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-900 rounded-lg">
                      <p className="text-red-200">{error}</p>
                    </div>
                  )}
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;