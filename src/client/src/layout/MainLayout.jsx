import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import LoginStatus from '../components/auth/LoginStatus';
import NavigationMenu from '../components/NavigationMenu';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-white">
                studyboard
              </h1>
              <NavigationMenu user={user} />
            </div>
            <LoginStatus user={user} setUser={setUser} loading={loading} />
          </div>
        </div>
      </header>

      <main className="flex-grow w-full px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;