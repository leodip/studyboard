// src/utils/activityUtils.js
import { activities } from '../translations';

export const getStatusText = (status) => {
    switch (status) {
        case 'done':
            return activities.done;
        case 'partially_done':
            return activities.partiallyDone;
        case 'pending':
            return activities.pending;
        case 'optional':
            return activities.optional;
        default:
            return activities.pending;
    }
};