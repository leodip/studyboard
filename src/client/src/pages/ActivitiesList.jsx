import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import { activities, layout } from '../translations';
import { initFlowbite } from 'flowbite';
import FlowbiteDatepicker from '../components/FlowbiteDatepicker';
import { ActivityStatus } from '../components/ActivityStatus';
import { getStatusText } from '../utils/activityUtils';


export default function ActivitiesList() {
    const getEmptyFormData = () => ({
        description: '',
        dueDate: new Date().toISOString(),
        status: 'pending',
        comments: ''
    });


    const [activityList, setActivityList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [error, setError] = useState(null);
    const [activityToDelete, setActivityToDelete] = useState(null);
    const [activityToEdit, setActivityToEdit] = useState(null);
    const [formData, setFormData] = useState(getEmptyFormData());

    const createInputRef = useRef(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            initFlowbite();
        }, 100);
    }, [activityList]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get(`${apiUrl}${endpoints.subjects}`, {
                    withCredentials: true
                });
                setSubjectList(response.data.subjects);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch subjects');
            }
        };

        fetchSubjects();
    }, []); // Only run once on mount

    // Handle initial subject selection
    useEffect(() => {
        if (!selectedSubject && subjectList.length > 0) {
            setSelectedSubject(subjectList[0]);
        }
    }, [subjectList, selectedSubject]);


    // Fetch activities whenever selected subject changes
    useEffect(() => {
        const fetchActivities = async () => {
            if (!selectedSubject) return;

            try {
                const response = await axios.get(`${apiUrl}${endpoints.subjects}/${selectedSubject.id}/activities`, {
                    withCredentials: true
                });
                setActivityList(response.data.activities);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.error || activities.error.fetch);
            }
        };

        fetchActivities();
    }, [selectedSubject]); // Run whenever selectedSubject changes   

    // Reset form data
    const resetFormData = () => {
        setFormData(getEmptyFormData());
    };

    const handleCreateModal = () => {
        resetFormData();

        setTimeout(() => {
            createInputRef.current?.focus();
        }, 100);
    };

    // Handle subject selection
    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
    };

    // Create activity
    // Let's modify these functions:

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (!selectedSubject) {
                setError('Please select a subject first');
                return;
            }

            if (!formData.status) {
                setError('Please select a status');
                return;
            }

            const activityData = {
                ...formData,
                subjectId: selectedSubject.id
            };

            await axios.post(
                `${apiUrl}${endpoints.activities}`,
                activityData,
                { withCredentials: true }
            );

            // Modal is hidden first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'createModal');
            modal.hide();

            // Then reset form (potentially the issue?)
            resetFormData();

            const response = await axios.get(
                `${apiUrl}${endpoints.subjects}/${selectedSubject.id}/activities`,
                { withCredentials: true }
            );

            setActivityList(response.data.activities);

        } catch (err) {
            setError(err.response?.data?.error || activities.error.create);
        }
    };


    // Update activity
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${apiUrl}${endpoints.activities}/${activityToEdit.id}`,
                formData,
                { withCredentials: true }
            );

            // Hide modal first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'editModal');
            modal.hide();

            // Then clear states and fetch fresh data
            setActivityToEdit(null);
            resetFormData();

            // Fetch updated activities
            const response = await axios.get(
                `${apiUrl}${endpoints.subjects}/${selectedSubject.id}/activities`,
                { withCredentials: true }
            );
            setActivityList(response.data.activities);

        } catch (err) {
            setError(err.response?.data?.error || activities.error.update);
        }
    };

    // Delete activity
    const handleDelete = async () => {
        if (!activityToDelete?.id) return;

        try {
            await axios.delete(
                `${apiUrl}${endpoints.activities}/${activityToDelete.id}`,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // Hide modal first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'deleteModal');
            modal.hide();

            // Clear the activityToDelete state
            setActivityToDelete(null);

            // Fetch updated activities
            if (selectedSubject) {
                const response = await axios.get(
                    `${apiUrl}${endpoints.subjects}/${selectedSubject.id}/activities`,
                    { withCredentials: true }
                );
                setActivityList(response.data.activities);
            }

            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.error || activities.error.delete);
        }
    };

    // Open edit modal with data
    const openEditModal = (activity) => {
        setActivityToEdit(activity);
        setFormData({
            description: activity.description,
            dueDate: activity.dueDate,
            status: activity.status,
            comments: activity.comments || ''
        });

        setTimeout(() => {
            editInputRef.current?.focus();
        }, 100);
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="w-full overflow-hidden">
            {/* Subject Pills */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    {subjectList.map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject)}
                            className={`px-4 py-2 rounded-full transition-colors ${selectedSubject?.id === subject.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {subject.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Header with Title and Create Button */}
            <div className="flex items-center justify-between px-1 my-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                    {selectedSubject ? `${activities.list.title} ${selectedSubject.name}` : activities.list.title}
                </h2>
                <button
                    data-modal-target="createModal"
                    data-modal-toggle="createModal"
                    onClick={handleCreateModal}
                    type="button"
                    className="md:hidden min-w-[40px] h-[40px] p-0 flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
                <button
                    data-modal-target="createModal"
                    data-modal-toggle="createModal"
                    onClick={handleCreateModal}
                    type="button"
                    className="hidden md:inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                    {activities.new}
                </button>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {activityList.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                        {activities.list.noActivities}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activityList.map((activity) => (
                            <div
                                key={activity.id}
                                className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                                <p className="mb-2 font-medium text-gray-900 dark:text-white">
                                    {activity.description}
                                </p>
                                <div className="mb-2">
                                    <ActivityStatus status={activity.status} />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {activities.list.due}: {new Date(activity.dueDate).toLocaleDateString(layout.locale)}
                                </p>
                                {activity.comments && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {activity.comments}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(activity)}
                                        data-modal-target="editModal"
                                        data-modal-toggle="editModal"
                                        className="px-3 py-2 text-sm font-medium text-center text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                                    >
                                        {activities.list.editButton}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActivityToDelete(activity)}
                                        data-modal-target="deleteModal"
                                        data-modal-toggle="deleteModal"
                                        className="px-3 py-2 text-sm font-medium text-center text-red-700 border border-red-700 rounded-lg hover:text-white hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-500 dark:focus:ring-red-800"
                                    >
                                        {activities.list.deleteButton}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Comments</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activityList.length === 0 ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan={5} className="px-6 py-4 text-center">
                                    {activities.list.noActivities}
                                </td>
                            </tr>
                        ) : (
                            activityList.map((activity) => (
                                <tr key={activity.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                                        {activity.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <ActivityStatus status={activity.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(activity.dueDate).toLocaleDateString(layout.locale)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {activity.comments}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(activity)}
                                                data-modal-target="editModal"
                                                data-modal-toggle="editModal"
                                                className="flex items-center gap-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                                            >
                                                {activities.list.editButton}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActivityToDelete(activity)}
                                                data-modal-target="deleteModal"
                                                data-modal-toggle="deleteModal"
                                                className="flex items-center gap-2 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-500 dark:focus:ring-red-800"
                                            >
                                                {activities.list.deleteButton}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <div id="createModal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-md max-h-full p-4">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {`${activities.new} - ${selectedSubject?.name}`}
                            </h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white"
                                data-modal-hide="createModal"
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">{layout.closeModal}</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="p-4 space-y-4 md:p-5">
                                <div>
                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.description}
                                    </label>
                                    <textarea
                                        ref={createInputRef}
                                        id="description"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dueDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.dueDate}
                                    </label>
                                    <FlowbiteDatepicker
                                        id="dueDate"
                                        required
                                        value={formData.dueDate}
                                        onChange={(date) => {
                                            const isoDate = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
                                            setFormData(prev => ({
                                                ...prev,
                                                dueDate: isoDate
                                            }));
                                        }}
                                        language={layout.locale.split('-')[0]}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.status}
                                    </label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="pending">{activities.pending}</option>
                                        <option value="partially_done">{activities.partiallyDone}</option>
                                        <option value="optional">{activities.optional}</option>
                                        <option value="done">{activities.done}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="comments" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.comments}
                                    </label>
                                    <textarea
                                        id="comments"
                                        value={formData.comments}
                                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {activities.form.createButton}
                                </button>
                                <button
                                    type="button"
                                    data-modal-hide="createModal"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                >
                                    {activities.form.cancelButton}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <div id="editModal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-md max-h-full p-4">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {`${activities.edit} - ${selectedSubject?.name}`}
                            </h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white"
                                data-modal-hide="editModal"
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">{layout.closeModal}</span>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="p-4 space-y-4 md:p-5">
                                <div>
                                    <label htmlFor="edit-description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.description}
                                    </label>
                                    <textarea
                                        ref={editInputRef}
                                        id="edit-description"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-dueDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.dueDate}
                                    </label>
                                    <FlowbiteDatepicker
                                        id="edit-dueDate"
                                        required
                                        value={formData.dueDate}
                                        onChange={(date) => {
                                            const isoDate = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
                                            setFormData(prev => ({
                                                ...prev,
                                                dueDate: isoDate
                                            }));
                                        }}
                                        language={layout.locale.split('-')[0]}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.status}
                                    </label>
                                    <select
                                        id="edit-status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="pending">{activities.pending}</option>
                                        <option value="partially_done">{activities.partiallyDone}</option>
                                        <option value="optional">{activities.optional}</option>
                                        <option value="done">{activities.done}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-comments" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {activities.form.comments}
                                    </label>
                                    <textarea
                                        id="edit-comments"
                                        value={formData.comments}
                                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="2"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {activities.form.updateButton}
                                </button>
                                <button
                                    type="button"
                                    data-modal-hide="editModal"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                >
                                    {activities.form.cancelButton}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div id="deleteModal" tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-md max-h-full p-4">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {activities.delete.title} - {selectedSubject?.name}
                            </h3>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white"
                                data-modal-hide="deleteModal"
                            >
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">{layout.closeModal}</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-4 md:p-5">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                {activities.delete.confirmation}
                            </p>
                            {activityToDelete && (
                                <div className="p-4 space-y-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {activityToDelete.description}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {activities.list.due}: {new Date(activityToDelete.dueDate).toLocaleDateString(layout.locale)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {activities.form.status}: {getStatusText(activityToDelete.status)}
                                    </p>
                                    {activityToDelete.comments && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {activities.form.comments}: {activityToDelete.comments}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600">
                            <button
                                type="button"
                                onClick={handleDelete}
                                data-modal-hide="deleteModal"
                                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                            >
                                {activities.delete.confirmButton}
                            </button>
                            <button
                                type="button"
                                data-modal-hide="deleteModal"
                                className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            >
                                {activities.delete.cancelButton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}