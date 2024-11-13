import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavigationMenu = ({ user }) => {
    const location = useLocation();

    const menuItems = [
        { label: 'Home', path: '/', requiresAuth: false },
        { label: 'Message of the Day', path: '/motd-management', requiresAuth: true }
    ];

    const filteredItems = menuItems.filter(item => {
        if (!item.requiresAuth) return true;
        return !!user;
    });

    return (
        <nav className="flex items-center space-x-4">
            {filteredItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.path
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
};

NavigationMenu.propTypes = {
    user: PropTypes.object
};

export default NavigationMenu;