import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiUrl, endpoints } from '../config';
import { motd, layout } from '../translations';
import { initFlowbite } from 'flowbite'

const emptyFormData = {
    message: '',
    author: '',
    link: ''
};

export default function MotdList() {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [messageToEdit, setMessageToEdit] = useState(null);
    const [formData, setFormData] = useState(emptyFormData);

    const createInputRef = useRef(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            initFlowbite();
        }, 100);
    }, [messages]);

    // Reset form data
    const resetFormData = () => {
        setFormData(emptyFormData);
    };

    const handleCreateModal = () => {
        resetFormData();

        setTimeout(() => {
            createInputRef.current?.focus();
        }, 100);
    };

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${apiUrl}${endpoints.motd}`, {
                withCredentials: true
            });
            setMessages(response.data.messages);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || motd.error.fetch);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await fetchMessages();
            } catch (error) {
                console.error('Failed to load initial data:', error);
                setError(error.message);
            }
        };

        loadInitialData();
    }, []);

    // Create message
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${apiUrl}${endpoints.motd}`,
                formData,
                { withCredentials: true }
            );
            resetFormData();

            // Hide modal first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'createModal');
            modal.hide();

            // Then fetch messages and wait for it to complete
            await fetchMessages();

        } catch (err) {
            setError(err.response?.data?.error || motd.error.create);
        }
    };

    // Update message
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${apiUrl}${endpoints.motd}/${messageToEdit.id}`,
                formData,
                { withCredentials: true }
            );

            // Hide modal first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'editModal');
            modal.hide();

            // Then clear states and fetch fresh data
            setMessageToEdit(null);
            resetFormData();
            await fetchMessages();
        } catch (err) {
            setError(err.response?.data?.error || motd.error.update);
        }
    };

    // Delete message
    const handleDelete = async () => {
        if (!messageToDelete?.id) return;

        try {
            await axios.delete(`${apiUrl}${endpoints.motd}/${messageToDelete.id}`, {
                withCredentials: true
            });

            // Hide modal first
            const modal = window.FlowbiteInstances.getInstance('Modal', 'deleteModal');
            modal.hide();

            // Clear the messageToDelete state
            setMessageToDelete(null);

            // Then fetch fresh messages
            await fetchMessages();
        } catch (err) {
            setError(err.response?.data?.error || motd.error.delete);
        }
    };

    // Open edit modal with data
    const openEditModal = (message) => {
        setMessageToEdit(message);
        setFormData({
            message: message.message,
            author: message.author || '',
            link: message.link || ''
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
            <div className="flex items-center justify-between px-1 my-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                    {motd.list.title}
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
                    {motd.new}
                </button>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {messages.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                        {motd.list.noMessages}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                                <p className="mb-2 font-medium text-gray-900 dark:text-white">
                                    {msg.message}
                                </p>
                                {msg.author && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {motd.list.author}: {msg.author}
                                    </p>
                                )}
                                {msg.link && (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        <a
                                            href={msg.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {msg.link}
                                        </a>
                                    </p>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(msg)}
                                        data-modal-target="editModal"
                                        data-modal-toggle="editModal"
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-center text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                                    >
                                        {motd.list.editButton}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMessageToDelete(msg)}
                                        data-modal-target="deleteModal"
                                        data-modal-toggle="deleteModal"
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-center text-red-700 border border-red-700 rounded-lg hover:text-white hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-500 dark:focus:ring-red-800"
                                    >
                                        {motd.list.deleteButton}
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
                            <th scope="col" className="px-6 py-3">{motd.list.message}</th>
                            <th scope="col" className="px-6 py-3">{motd.list.author}</th>
                            <th scope="col" className="px-6 py-3">{motd.list.relatedLink}</th>
                            <th scope="col" className="px-6 py-3">{motd.list.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan={4} className="px-6 py-4 text-center">
                                    {motd.list.noMessages}
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr key={msg.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                                        {msg.message}
                                    </td>
                                    <td className="px-6 py-4">{msg.author}</td>
                                    <td className="px-6 py-4">
                                        {msg.link && (
                                            <a
                                                href={msg.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {msg.link}
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(msg)}
                                                data-modal-target="editModal"
                                                data-modal-toggle="editModal"
                                                className="flex items-center gap-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                                            >
                                                {motd.list.editButton}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMessageToDelete(msg)}
                                                data-modal-target="deleteModal"
                                                data-modal-toggle="deleteModal"
                                                className="flex items-center gap-2 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-500 dark:focus:ring-red-800"
                                            >
                                                {motd.list.deleteButton}
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
                                {motd.new}
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
                                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.message}
                                    </label>
                                    <textarea
                                        ref={createInputRef}
                                        id="message"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="4"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="author" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.author}
                                    </label>
                                    <input
                                        type="text"
                                        id="author"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.link}
                                    </label>
                                    <input
                                        type="url"
                                        id="link"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {motd.form.createButton}
                                </button>
                                <button
                                    type="button"
                                    data-modal-hide="createModal"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                >
                                    {motd.form.cancelButton}
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
                                {motd.edit}
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
                                    <label htmlFor="edit-message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.message}
                                    </label>
                                    <textarea
                                        ref={editInputRef}
                                        id="edit-message"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        rows="4"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-author" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.author}
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-author"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {motd.form.link}
                                    </label>
                                    <input
                                        type="url"
                                        id="edit-link"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center p-4 border-t border-gray-200 rounded-b md:p-5 dark:border-gray-600">
                                <button
                                    type="submit"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {motd.form.updateButton}
                                </button>
                                <button
                                    type="button"
                                    data-modal-hide="editModal"
                                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                >
                                    {motd.form.cancelButton}
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
                                {motd.delete.title}
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
                                {motd.delete.confirmation}
                            </p>
                            {messageToDelete && (
                                <div className="p-4 space-y-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {messageToDelete.message}
                                    </p>
                                    {messageToDelete.author && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {motd.list.author}: {messageToDelete.author}
                                        </p>
                                    )}
                                    {messageToDelete.link && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {motd.list.relatedLink}:{' '}
                                            <a
                                                href={messageToDelete.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {messageToDelete.link}
                                            </a>
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
                                {motd.delete.confirmButton}
                            </button>
                            <button
                                type="button"
                                data-modal-hide="deleteModal"
                                className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            >
                                {motd.delete.cancelButton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}