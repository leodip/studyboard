import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import { activities, layout, home } from '../translations';
import { ActivityStatus } from '../components/ActivityStatus';

export default function Home() {
    const [activityList, setActivityList] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Fetch subjects first
                const subjectsResponse = await axios.get(`${apiUrl}${endpoints.subjects}`, {
                    withCredentials: true
                });

                // For each subject, fetch its activities
                const allActivities = [];
                for (const subject of subjectsResponse.data.subjects) {
                    const activitiesResponse = await axios.get(
                        `${apiUrl}${endpoints.subjects}/${subject.id}/activities`,
                        { withCredentials: true }
                    );
                    // Add subject name to each activity
                    const activitiesWithSubject = activitiesResponse.data.activities.map(activity => ({
                        ...activity,
                        subjectName: subject.name
                    }));
                    allActivities.push(...activitiesWithSubject);
                }

                setActivityList(allActivities);
                setError(null);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError(err.response?.data?.error || 'Failed to fetch activities');
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    // Filter activities based on status
    const filteredActivities = activityList.filter(activity => {
        if (selectedFilter === 'pending') {
            return activity.status === 'pending' || activity.status === 'partially_done' || activity.status === 'optional';
        } else {
            return activity.status === 'done';
        }
    });

    // Format date with day of the week
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(layout.locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Function to handle status change
    const handleStatusChange = async (activityId, newStatus) => {
        try {
            await axios.put(
                `${apiUrl}${endpoints.activities}/${activityId}`,
                { status: newStatus },
                { withCredentials: true }
            );

            // Update local state
            setActivityList(prevList =>
                prevList.map(activity =>
                    activity.id === activityId
                        ? { ...activity, status: newStatus }
                        : activity
                )
            );
        } catch (err) {
            console.error('Error updating activity status:', err);
            setError(err.response?.data?.error || 'Failed to update activity status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin dark:border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="container px-4 mx-auto mt-4">
            <div className="mb-6">
                <div className="inline-flex border border-gray-200 rounded-lg dark:border-gray-700">
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg ${selectedFilter === 'pending'
                            ? 'bg-blue-700 text-white dark:bg-blue-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                        onClick={() => setSelectedFilter('pending')}
                    >
                        {activities.pending}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${selectedFilter === 'done'
                            ? 'bg-blue-700 text-white dark:bg-blue-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                        onClick={() => setSelectedFilter('done')}
                    >
                        {activities.done}
                    </button>
                </div>
            </div>

            {filteredActivities.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                    {selectedFilter === 'pending' ? home.noPendingActivities : home.noCompletedActivities}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {activity.description}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {activity.subjectName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDate(activity.dueDate)}
                                    </p>
                                    {activity.comments && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            {activity.comments}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 md:mt-0 md:ml-4">
                                    <select
                                        value={activity.status}
                                        onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option value="pending">{activities.pending}</option>
                                        <option value="partially_done">{activities.partiallyDone}</option>
                                        <option value="optional">{activities.optional}</option>
                                        <option value="done">{activities.done}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <ActivityStatus status={activity.status} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}