import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { ChevronDown, CheckCircle, Circle, CircleDot, Calendar } from 'lucide-react';
import { home, activities as activitiesTranslations } from '../translations.js';

const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const statusIcons = {
        pending: <Circle className="w-5 h-5 text-red-400" />,
        partially_done: <CircleDot className="w-5 h-5 text-yellow-400" />,
        completed: <CheckCircle className="w-5 h-5 text-green-400" />
    };

    const statusTranslations = {
        pending: activitiesTranslations.pending,
        partially_done: activitiesTranslations.partiallyDone,
        done: activitiesTranslations.done
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // Use locale from translations
        const weekDay = date.toLocaleDateString(home.locale, { weekday: 'long' });
        const formattedDate = date.toLocaleDateString(home.locale, {
            day: 'numeric',
            month: 'long'
        });

        // Capitalize the first letter of the weekday
        const capitalizedWeekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);

        return {
            weekDay: capitalizedWeekDay,
            date: formattedDate
        };
    };

    // Calculate if a date is today, tomorrow, or this week
    const getDateContext = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'past';
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'tomorrow';
        if (diffDays <= 7) return 'thisWeek';
        return 'future';
    };

    // Get the style class based on date context
    const getDateStyles = (dateString) => {
        const context = getDateContext(dateString);
        const baseStyles = "flex items-center space-x-2 px-3 py-1.5 rounded-full font-medium";

        switch (context) {
            case 'past':
                return `${baseStyles} bg-red-900/50 text-red-200`;
            case 'today':
                return `${baseStyles} bg-yellow-500/20 text-yellow-200`;
            case 'tomorrow':
                return `${baseStyles} bg-blue-500/20 text-blue-200`;
            case 'thisWeek':
                return `${baseStyles} bg-purple-500/20 text-purple-200`;
            default:
                return `${baseStyles} bg-gray-700 text-gray-300`;
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/subjects`, {
                withCredentials: true
            });

            const subjects = response.data.subjects;
            let allActivities = [];

            for (const subject of subjects) {
                const activitiesResponse = await axios.get(
                    `${apiUrl}/api/subjects/${subject.id}/activities`,
                    { withCredentials: true }
                );

                const activitiesWithSubject = activitiesResponse.data.activities.map(
                    activity => ({
                        ...activity,
                        subjectName: subject.name
                    })
                );

                allActivities = [...allActivities, ...activitiesWithSubject];
            }

            allActivities = allActivities.filter(
                activity => ['pending', 'partially_done'].includes(activity.status)
            );

            allActivities.sort((a, b) => {
                if (a.dueDate === b.dueDate) {
                    return new Date(b.dateCreated) - new Date(a.dateCreated);
                }
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            setActivities(allActivities);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activities');
            setLoading(false);
        }
    };

    const handleStatusChange = async (activityId, newStatus) => {
        try {
            await axios.put(
                `${apiUrl}/api/activities/${activityId}`,
                { status: newStatus },
                { withCredentials: true }
            );
            setDropdownOpen(null);
            fetchActivities();
        } catch (err) {
            console.error('Error updating activity status:', err);
            setError('Failed to update activity status');
        }
    };

    const getStatusDisplay = (status) => {
        return statusTranslations[status] || status;
    };

    if (loading) {
        return <div className="p-4 text-gray-300">{home.loadingActivities}</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 bg-gray-800 rounded-lg">
                {home.noActivities}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{home.pendingActivities}</h2>
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="p-4 bg-gray-800 rounded-lg shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    {statusIcons[activity.status]}
                                    <span className="font-medium text-gray-200">
                                        {activity.subjectName}
                                    </span>
                                </div>
                                <p className="text-gray-300">{activity.description}</p>
                                <div className="flex items-center space-x-4">
                                    <div className={getDateStyles(activity.dueDate)}>
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                            {formatDate(activity.dueDate).weekDay}, {formatDate(activity.dueDate).date}
                                        </span>
                                    </div>
                                    {activity.comments && (
                                        <span className="text-sm text-gray-400">{activity.comments}</span>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(
                                        dropdownOpen === activity.id ? null : activity.id
                                    )}
                                    className="flex items-center px-3 py-1 space-x-1 text-gray-300 transition-colors border border-gray-600 rounded-md hover:bg-gray-700"
                                >
                                    <span>{activitiesTranslations.status}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {dropdownOpen === activity.id && (
                                    <div className="absolute right-0 z-10 w-56 mt-2 bg-gray-700 rounded-md shadow-lg">
                                        <div className="py-1">
                                            {['pending', 'partially_done', 'done'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(activity.id, status)}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600"
                                                >
                                                    <span className="mr-2">
                                                        {statusIcons[status === 'done' ? 'completed' : status]}
                                                    </span>
                                                    {getStatusDisplay(status)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;