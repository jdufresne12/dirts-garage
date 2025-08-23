'use client'
import React, { useState } from 'react';
import { Edit, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Flag, Save, X, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JobDetailsCardProps {
    job: Job;
    onJobUpdate: (updatedFields: Partial<Job>) => void;
}

export default function JobDetailsCard({ job, onJobUpdate }: JobDetailsCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editForm, setEditForm] = useState({
        title: job.title,
        description: job.description,
        status: job.status,
        priority: job.priority,
        estimated_start_date: job.estimated_start_date || '',
        start_date: job.start_date || '',
        estimated_completion: job.estimated_completion || '',
        completion_date: job.completion_date || '',
        estimated_cost: job.estimated_cost || 0,
        actual_cost: job.actual_cost || 0,
        waiting_reason: job.waiting_reason || '',
    });

    const handleSave = () => {
        onJobUpdate(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm({
            title: job.title,
            description: job.description,
            status: job.status,
            priority: job.priority,
            estimated_start_date: job.estimated_start_date || '',
            start_date: job.start_date || '',
            estimated_completion: job.estimated_completion || '',
            completion_date: job.completion_date || '',
            estimated_cost: job.estimated_cost,
            actual_cost: job.actual_cost || 0,
            waiting_reason: job.waiting_reason || '',
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        // First confirmation
        const confirmMessage = `Are you sure you want to delete "${job.title}"?\n\nThis will permanently delete:\n• The job and all its details\n• All invoices and payments\n\nThis action cannot be undone.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        // Confirmation requiring typing "DELETE"
        const typeConfirm = prompt(`To confirm deletion of "${job.title}", please type "DELETE" (all caps):`);
        if (typeConfirm !== "DELETE") {
            alert("Deletion cancelled. You must type 'DELETE' exactly to confirm.");
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/jobs/${job.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 409) {
                    alert(`Cannot delete job: ${errorData.message || 'There are still references to this job in the database.'}`);
                } else {
                    throw new Error(errorData.message || 'Failed to delete job');
                }
                return;
            }

            const result = await response.json();

            // Show success message with details
            const deletionSummary = `Job "${job.title}" deleted successfully!\n
            \nDeleted items:\n• Job details\n• ${result.deletedCounts.jobSteps || 0} job steps\n• ${result.deletedCounts.parts || 0} parts\n• ${result.deletedCounts.notes || 0} notes\n• ${result.deletedCounts.invoices || 0} invoices (with related payments)`;

            if (result.s3DeletionDetails && result.s3DeletionDetails.length > 0) {
                alert(`${deletionSummary}\n\n⚠️ Note: Some media files failed to delete. Let Johnny know of this issue as well a the Job Number (#${job.id})`);
            } else {
                alert(deletionSummary);
            }

            // Navigate back to jobs list
            router.push('/jobs');

        } catch (error) {
            console.error('Failed to delete job:', error);
            alert(`Failed to delete job: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";
        switch (status) {
            case "In Progress":
                return { classes: `${baseClasses} bg-blue-100 text-blue-800`, icon: <Clock className="w-3 h-3" /> };
            case "Waiting":
                return { classes: `${baseClasses} bg-yellow-100 text-yellow-800`, icon: <AlertCircle className="w-3 h-3" /> };
            case "On Hold":
                return { classes: `${baseClasses} bg-orange-100 text-orange-800`, icon: <AlertCircle className="w-3 h-3" /> };
            case "Payment":
                return { classes: `${baseClasses} bg-red-100 text-red-800`, icon: <DollarSign className="w-3 h-3" /> };
            case "Completed":
                return { classes: `${baseClasses} bg-green-100 text-green-800`, icon: <CheckCircle className="w-3 h-3" /> };
            default:
                return { classes: `${baseClasses} bg-gray-100 text-gray-600`, icon: <Clock className="w-3 h-3" /> };
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1";
        switch (priority) {
            case "High":
                return { classes: `${baseClasses} bg-red-100 text-red-800`, icon: <Flag className="w-3 h-3" /> };
            case "Medium":
                return { classes: `${baseClasses} bg-yellow-100 text-yellow-800`, icon: <Flag className="w-3 h-3" /> };
            case "Low":
                return { classes: `${baseClasses} bg-green-100 text-green-800`, icon: <Flag className="w-3 h-3" /> };
            default:
                return { classes: `${baseClasses} bg-gray-100 text-gray-600`, icon: <Flag className="w-3 h-3" /> };
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        const [year, month, day] = formatDateEdit(dateString).split('-');
        return `${month}/${day}/${year}`
    };

    const formatDateEdit = (dateString: string) => {
        if (dateString === '')
            return dateString
        else {
            return dateString.split('T')[0];
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const statusBadge = getStatusBadge(job.status);
    const priorityBadge = getPriorityBadge(job.priority);

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6`}>
            {!isEditing && (
                <div className='flex items-center justify-between mb-2 '>
                    <div className='space-x-3'>
                        <div className={statusBadge.classes}>
                            {statusBadge.icon}
                            {job.status}
                        </div>
                        <div className={priorityBadge.classes}>
                            {priorityBadge.icon}
                            {job.priority}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsEditing(true)}
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <Edit className="size-4" />
                        </button>
                    </div>
                </div>

            )}

            {/* Save/Cancel buttons when editing */}
            {isEditing && (
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 text-center">
                        <span className="text-xl font-bold">Edit Job Details</span>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className={'text-gray-400 hover:scale-110 cursor-pointer'}
                    >
                        <X className="size-5" />
                    </button>
                </div>
            )}

            {/* Main content section */}
            <div className="mb-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <span className="flex border-b-1 border-gray-300 text-lg mb-4 md:font-semibold">Basic Details</span>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <span className="flex border-b-1 border-gray-300 text-lg pt-6 mb-4 md:font-semibold">Tracking Info</span>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className='grid col-span-2 md:col-span-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value, start_date: e.target.value === 'In Progress' ? formatDateEdit(new Date().toISOString()) : prev.start_date }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Waiting">Waiting</option>
                                    <option value="On Hold">On Hold</option>
                                    {/* <option value="Payment">Payment</option> */}
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className='grid col-span-2 md:col-span-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={editForm.priority}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                        <span className="text-sm font-medium text-gray-500">Job #{job.id}</span>
                        <p className="text-gray-600 leading-relaxed mt-2 whitespace-pre-line">{job.description}</p>
                    </div>
                )}
            </div>

            {isEditing ? (
                <>
                    <div className="flex flex-col lg:flex-row gap-6 pt-6 border-gray-200">
                        <div className="flex-1 lg:w-3/4">
                            <span className="flex border-b border-gray-300 text-lg mb-4 pb-2 md:font-semibold">Dates & Deadlines</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Start</label>
                                    <input
                                        type="date"
                                        value={formatDateEdit(editForm.estimated_start_date)}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, estimated_start_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formatDateEdit(editForm.start_date)}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion</label>
                                    <input
                                        type="date"
                                        value={formatDateEdit(editForm.estimated_completion)}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, estimated_completion: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                                    <input
                                        type="date"
                                        value={formatDateEdit(editForm.completion_date)}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, completion_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/4">
                            <span className="flex border-b border-gray-300 text-lg mb-4 pb-2 md:font-semibold">Costs</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={editForm.estimated_cost === 0 ? '' : editForm.estimated_cost}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || value === null) {
                                                    setEditForm(prev => ({ ...prev, estimated_cost: 0 }));
                                                } else {
                                                    const numValue = parseFloat(value);
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        estimated_cost: isNaN(numValue) ? 0 : parseFloat(numValue.toFixed(2))
                                                    }));
                                                }
                                            }}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Actual Cost - Fixed Version */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={editForm.actual_cost === 0 ? '' : editForm.actual_cost}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || value === null) {
                                                    setEditForm(prev => ({ ...prev, actual_cost: 0 }));
                                                } else {
                                                    const numValue = parseFloat(value);
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        actual_cost: isNaN(numValue) ? 0 : parseFloat(numValue.toFixed(2))
                                                    }));
                                                }
                                            }}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            step="0.01"
                                            min="0"
                                            disabled={job.status !== 'In Progress'}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(editForm.status === 'Waiting' || editForm.status === 'On Hold') && (
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editForm.status === 'Waiting' ? 'Waiting Reason' : 'Hold Reason'}
                            </label>
                            <input
                                type="text"
                                value={editForm.waiting_reason}
                                onChange={(e) => setEditForm(prev => ({ ...prev, waiting_reason: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter reason..."
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Estimated Start</p>
                            <p className="font-medium">{formatDate(job.estimated_start_date || '')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Actual Start</p>
                            <p className="font-medium">{formatDate(job.start_date || '')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Estimated Completion</p>
                            <p className="font-medium">{formatDate(job.estimated_completion || '')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Completion Date</p>
                            <p className="font-medium">{formatDate(job.completion_date || '')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Estimated Cost</p>
                            <p className="font-medium">{formatCurrency(job.estimated_cost)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Actual Cost</p>
                            <p className="font-medium">{formatCurrency(job.actual_cost)}</p>
                        </div>
                    </div>

                    {(job.status === 'Waiting' || job.status === 'On Hold') && job.waiting_reason && (
                        <div className="col-span-2 md:col-span-3 lg:col-span-6 pt-2">
                            <p className="text-xs text-gray-500 mb-1">
                                {job.status === 'Waiting' ? 'Waiting Reason' : 'Hold Reason'}
                            </p>
                            <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border-l-4 border-yellow-300">
                                {job.waiting_reason}
                            </p>
                        </div>
                    )}

                    {job.latest_update && (
                        <div className="col-span-2 md:col-span-3 lg:col-span-6 pt-2">
                            <p className="text-xs text-gray-500 mb-1">Latest Update</p>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-4 border-blue-300">
                                {job.latest_update}
                            </p>
                        </div>
                    )}
                </div>
            )}


            {/* Save/Cancel buttons when editing */}
            {isEditing && (
                <div className="flex justify-between gap-2 mt-8 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-2 rounded-md border border-red-400 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash className="size-4" />
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="size-4" />
                        Save
                    </button>
                </div>
            )}

            {/* Loading overlay when deleting */}
            {isDeleting && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Deleting job...</p>
                    </div>
                </div>
            )}
        </div>
    );
};