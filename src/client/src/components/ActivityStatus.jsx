// src/components/ActivityStatus.jsx
import PropTypes from 'prop-types';
import { activities } from '../translations';

const statusStyles = {
    done: {
        base: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    partially_done: {
        base: 'bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
    },
    pending: {
        base: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
};

const getStatusStyle = (status) => {
    return statusStyles[status]?.base || statusStyles.pending.base;
};

const getStatusText = (status) => {
    switch (status) {
        case 'done':
            return activities.done;
        case 'partially_done':
            return activities.partiallyDone;
        case 'pending':
            return activities.pending;
        default:
            return activities.pending;
    }
};

export const ActivityStatus = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
        {getStatusText(status)}
    </span>
);

ActivityStatus.propTypes = {
    status: PropTypes.oneOf(['pending', 'partially_done', 'done']).isRequired
};