import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { activities as t } from '../translations';

const ActivityManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        comments: ''
    });
    const [editingActivity, setEditingActivity] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchActivities(selectedSubject.id);
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/subjects`, {
                withCredentials: true
            });
            setSubjects(response.data.subjects);
            if (response.data.subjects.length > 0) {
                setSelectedSubject(response.data.subjects[0]);
            }
        } catch (err) {
            setError(t.error.fetch);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async (subjectId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/subjects/${subjectId}/activities`, {
                withCredentials: true
            });
            setActivities(response.data.activities);
        } catch (err) {
            setError(t.error.fetch);
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingActivity) {
                await axios.put(
                    `${apiUrl}/api/activities/${editingActivity.id}`,
                    { ...formData, subjectId: selectedSubject.id },
                    { withCredentials: true }
                );
                setEditingActivity(null);
            } else {
                await axios.post(
                    `${apiUrl}/api/activities`,
                    { ...formData, subjectId: selectedSubject.id },
                    { withCredentials: true }
                );
            }
            setFormData({
                description: '',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'pending',
                comments: ''
            });
            fetchActivities(selectedSubject.id);
        } catch (err) {
            setError(editingActivity ? t.error.update : t.error.create);
            console.error(err);
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setFormData({
            description: activity.description,
            dueDate: activity.dueDate.split('T')[0],
            status: activity.status,
            comments: activity.comments || ''
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/activities/${id}`, {
                withCredentials: true
            });
            fetchActivities(selectedSubject.id);
        } catch (err) {
            setError(t.error.delete);
            console.error(err);
        }
    };

    const handleCancel = () => {
        setEditingActivity(null);
        setFormData({
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            comments: ''
        });
    };

    if (loading) return <div className="text-gray-300">{t.loading}</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const getStatusTranslation = (status) => {
        switch (status) {
            case 'pending':
                return t.pending;
            case 'partially_done':
                return t.partiallyDone;
            case 'done':
                return t.done;
            default:
                return status;
        }
    };

    return (
        <div className="space-y-8">
            {/* Subject Pills */}
            <div className="flex flex-wrap gap-2 p-4 bg-gray-800 rounded-lg">
                {subjects.map((subject) => (
                    <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-2 rounded-full transition-colors ${selectedSubject?.id === subject.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {subject.name}
                    </button>
                ))}
            </div>

            {selectedSubject && (
                <>
                    {/* Activity Form */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold text-white">
                            {editingActivity
                                ? `${t.edit} ${selectedSubject.name}`
                                : `${t.new} ${selectedSubject.name}`}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    {t.form.description}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    {t.form.dueDate}
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    {t.form.status}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                                >
                                    <option value="pending">{t.pending}</option>
                                    <option value="partially_done">{t.partiallyDone}</option>
                                    <option value="done">{t.done}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">
                                    {t.form.comments}
                                </label>
                                <textarea
                                    value={formData.comments}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, comments: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    {editingActivity ? t.form.updateButton : t.form.createButton}
                                </button>
                                {editingActivity && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-md hover:bg-gray-700"
                                    >
                                        {t.form.cancelButton}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Activities List */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold text-white">
                            {t.list.title} {selectedSubject.name}
                        </h2>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="p-4 bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-gray-300">{activity.description}</p>
                                            <div className="flex space-x-4">
                                                <span className="text-sm text-gray-400">
                                                    {t.list.due}: {new Date(activity.dueDate).toLocaleDateString()}
                                                </span>
                                                <span
                                                    className={`text-sm ${activity.status === 'done'
                                                            ? 'text-green-400'
                                                            : activity.status === 'partially_done'
                                                                ? 'text-yellow-400'
                                                                : 'text-red-400'
                                                        }`}
                                                >
                                                    {getStatusTranslation(activity.status)}
                                                </span>
                                            </div>
                                            {activity.comments && (
                                                <p className="text-sm text-gray-400">
                                                    {activity.comments}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(activity)}
                                                className="px-3 py-1 text-sm text-blue-400 transition-colors border border-blue-400 rounded-md hover:bg-blue-400 hover:text-white"
                                            >
                                                {t.list.editButton}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(activity.id)}
                                                className="px-3 py-1 text-sm text-red-400 transition-colors border border-red-400 rounded-md hover:bg-red-400 hover:text-white"
                                            >
                                                {t.list.deleteButton}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-center text-gray-400">{t.list.noActivities}</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityManagement;