import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavigationMenu = ({ user = { groups: [] } }) => {
    const location = useLocation();
    const isAdmin = user?.groups?.includes('studyboard-admins');

    const menuItems = [
        { label: 'Home', path: '/', roles: ['*'] },
        { label: 'Message of the Day', path: '/motd-management', roles: ['admin'] }
    ];

    const filteredItems = menuItems.filter(item => {
        if (item.roles.includes('*')) return true;
        if (item.roles.includes('admin') && isAdmin) return true;
        return false;
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
    user: PropTypes.shape({
        groups: PropTypes.arrayOf(PropTypes.string)
    })
};

export default NavigationMenu;