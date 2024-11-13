import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { ChevronDown, CheckCircle, Circle, CircleDot } from 'lucide-react';

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

    useEffect(() => {
        fetchActivities();
    }, []);

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

                // Add subject name to each activity
                const activitiesWithSubject = activitiesResponse.data.activities.map(
                    activity => ({
                        ...activity,
                        subjectName: subject.name
                    })
                );

                allActivities = [...allActivities, ...activitiesWithSubject];
            }

            // Filter for pending and partially_done activities
            allActivities = allActivities.filter(
                activity => ['pending', 'partially_done'].includes(activity.status)
            );

            // Sort by dueDate ASC, then dateCreated DESC
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
            fetchActivities(); // Refresh the list
        } catch (err) {
            console.error('Error updating activity status:', err);
            setError('Failed to update activity status');
        }
    };

    if (loading) {
        return <div className="p-4 text-gray-300">Loading activities...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 bg-gray-800 rounded-lg">
                No pending activities found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Pending Activities</h2>
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
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-gray-400">
                                        Due: {new Date(activity.dueDate).toLocaleDateString()}
                                    </span>
                                    {activity.comments && (
                                        <span className="text-gray-400">{activity.comments}</span>
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
                                    <span>Status</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {dropdownOpen === activity.id && (
                                    <div className="absolute right-0 z-10 w-40 mt-2 bg-gray-700 rounded-md shadow-lg">
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
                                                    {status.replace('_', ' ')}
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