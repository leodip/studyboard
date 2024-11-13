import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    user: PropTypes.object,
    children: PropTypes.node.isRequired
};

export default ProtectedRoute;