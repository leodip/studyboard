import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';
import { auditLogs } from '../translations';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 20;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * PAGE_SIZE;
            const response = await axios.get(`${apiUrl}/api/audit-logs?limit=${PAGE_SIZE}&offset=${offset}`, {
                withCredentials: true
            });
            setLogs(response.data.logs);
            const total = Math.ceil(response.data.total / PAGE_SIZE);
            setTotalPages(total);
            setError(null);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError(err.response?.data?.error || 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const renderEntityValues = (values) => {
        if (!values) return null;
        try {
            const parsed = JSON.parse(values);
            return (
                <div className="text-sm">
                    {Object.entries(parsed).map(([key, value]) => (
                        <div key={key} className="mb-1">
                            <span className="font-medium">{key}:</span>{' '}
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                        </div>
                    ))}
                </div>
            );
        } catch {
            return values;
        }
    };

    const getActionStyle = (action) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'DELETE':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const renderMobileLog = (log) => (
        <div key={log.id} className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            {/* Header with Timestamp and Action */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(log.timestamp)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionStyle(log.action)}`}>
                    {log.action}
                </span>
            </div>

            {/* User Info */}
            <div className="mb-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {log.user_email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {log.user_id}
                </div>
            </div>

            {/* Entity Info */}
            <div className="mb-3 text-sm">
                <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {auditLogs.entityType}: {log.entity_type}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        ID: {log.entity_id}
                    </span>
                </div>
            </div>

            {/* Changes */}
            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                {log.old_values && (
                    <div className="mb-3">
                        <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                            {auditLogs.oldValues}:
                        </div>
                        <div className="pl-2 text-sm text-gray-600 dark:text-gray-400">
                            {renderEntityValues(log.old_values)}
                        </div>
                    </div>
                )}
                {log.new_values && (
                    <div>
                        <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                            {auditLogs.newValues}:
                        </div>
                        <div className="pl-2 text-sm text-gray-600 dark:text-gray-400">
                            {renderEntityValues(log.new_values)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="p-4 text-red-500 dark:text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="container px-4 mx-auto">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                {auditLogs.title}
            </h1>

            {loading ? (
                <div className="flex items-center justify-center p-4">
                    <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin dark:border-white"></div>
                </div>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {logs.map(renderMobileLog)}
                    </div>

                    {/* Desktop View */}
                    <div className="relative hidden overflow-x-auto shadow-md md:block sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">{auditLogs.timestamp}</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">{auditLogs.user}</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">{auditLogs.action}</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">{auditLogs.entityType}</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">{auditLogs.entityId}</th>
                                    <th scope="col" className="w-1/2 px-4 py-3">{auditLogs.changes}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {log.user_email}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {log.user_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                            {log.entity_type}
                                        </td>
                                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                                            {log.entity_id}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.old_values && (
                                                <div className="mb-2">
                                                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                                                        {auditLogs.oldValues}:
                                                    </div>
                                                    {renderEntityValues(log.old_values)}
                                                </div>
                                            )}
                                            {log.new_values && (
                                                <div>
                                                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                                                        {auditLogs.newValues}:
                                                    </div>
                                                    {renderEntityValues(log.new_values)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex flex-col w-full gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-400">
                                {auditLogs.pagination.showing} <span className="font-medium">{currentPage}</span>{' '}
                                {auditLogs.pagination.of} <span className="font-medium">{totalPages}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                >
                                    {auditLogs.pagination.previous}
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                >
                                    {auditLogs.pagination.next}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}