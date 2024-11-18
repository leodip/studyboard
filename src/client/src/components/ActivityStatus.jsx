import PropTypes from 'prop-types';
import { getStatusText } from '../utils/activityUtils';

const statusStyles = {
    done: {
        base: 'bg-transparent border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
    },
    partially_done: {
        base: 'bg-transparent border border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400'
    },
    pending: {
        base: 'bg-transparent border border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
    },
    optional: {
        base: 'bg-transparent border border-gray-600 text-gray-600 dark:border-gray-400 dark:text-gray-400'
    }
};

const getStatusStyle = (status) => {
    return statusStyles[status]?.base || statusStyles.pending.base;
};

export const ActivityStatus = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
        {getStatusText(status)}
    </span>
);

ActivityStatus.propTypes = {
    status: PropTypes.oneOf(['pending', 'partially_done', 'done', 'optional']).isRequired
};