import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/subjects`, {
                withCredentials: true
            });
            setSubjects(response.data.subjects);
        } catch (err) {
            setError('Failed to load subjects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await axios.put(`${apiUrl}/api/subjects/${editingSubject.id}`, formData, {
                    withCredentials: true
                });
                setEditingSubject(null);
            } else {
                await axios.post(`${apiUrl}/api/subjects`, formData, {
                    withCredentials: true
                });
            }
            setFormData({ name: '' });
            fetchSubjects();
        } catch (err) {
            setError(editingSubject ? 'Failed to update subject' : 'Failed to create subject');
            console.error(err);
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({ name: subject.name });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/subjects/${id}`, {
                withCredentials: true
            });
            fetchSubjects();
        } catch (err) {
            setError('Failed to delete subject');
            console.error(err);
        }
    };

    const handleCancel = () => {
        setEditingSubject(null);
        setFormData({ name: '' });
    };

    if (loading) return <div className="text-gray-300">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">
                    {editingSubject ? 'Edit Subject' : 'New Subject'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                            required
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {editingSubject ? 'Update Subject' : 'Create Subject'}
                        </button>
                        {editingSubject && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-md hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">Subjects</h2>
                <div className="space-y-4">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-300">{subject.name}</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(subject)}
                                        className="px-3 py-1 text-sm text-blue-400 transition-colors border border-blue-400 rounded-md hover:bg-blue-400 hover:text-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject.id)}
                                        className="px-3 py-1 text-sm text-red-400 transition-colors border border-red-400 rounded-md hover:bg-red-400 hover:text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {subjects.length === 0 && (
                        <p className="text-center text-gray-400">No subjects found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectManagement;