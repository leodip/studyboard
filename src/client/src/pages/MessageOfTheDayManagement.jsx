import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';

const MessageOfTheDayManagement = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        message: '',
        author: '',
        link: ''
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/motd`, {
                withCredentials: true
            });
            setMessages(response.data.messages);
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/motd`, formData, {
                withCredentials: true
            });
            setFormData({ message: '', author: '', link: '' });
            fetchMessages();
        } catch (err) {
            setError('Failed to create message');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/motd/${id}`, {
                withCredentials: true
            });
            fetchMessages();
        } catch (err) {
            setError('Failed to delete message');
            console.error(err);
        }
    };

    if (loading) return <div className="text-gray-300">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">New Message of the Day</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Author
                        </label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Link
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                            className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Create Message
                    </button>
                </form>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-white">Existing Messages</h2>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="p-4 bg-gray-700 rounded-lg">
                            <p className="mb-2 text-gray-300">{msg.message}</p>
                            {msg.author && (
                                <p className="text-sm text-gray-400">Author: {msg.author}</p>
                            )}
                            {msg.link && (
                                <a
                                    href={msg.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:underline"
                                >
                                    Related Link
                                </a>
                            )}
                            <button
                                onClick={() => handleDelete(msg.id)}
                                className="block px-3 py-1 mt-2 text-sm text-red-400 transition-colors border border-red-400 rounded-md hover:bg-red-400 hover:text-white"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessageOfTheDayManagement;