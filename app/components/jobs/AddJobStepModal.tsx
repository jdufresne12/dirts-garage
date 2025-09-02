'use client'
import React, { useState, useEffect } from 'react';
import { Trash, X } from 'lucide-react';
import Modal from '../Modal';
import helpers from '@/app/utils/helpers';

const emptyFormData: JobStep = {
    id: helpers.generateUniqueID(),
    title: '',
    description: '',
    status: 'Pending',
    estimated_hours: 0,
    actual_hours: 0,
    start_date: '',
    completed_date: '',
    estimated_start_date: '',
    job_id: '',
    order: 0,
};

interface AddProgressModalProps {
    isOpen: boolean;
    stepData?: JobStep;
    job_id: string;
    numSteps: number;
    onClose: () => void;
    onSave: (jobData: JobStep) => void;
    onDelete?: (stepId: string) => void;
}

export default function AddJobStepModal({ isOpen, stepData, job_id, numSteps, onClose, onSave, onDelete }: AddProgressModalProps) {
    const [formData, setFormData] = useState<JobStep>(stepData ?? emptyFormData);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // NEW

    useEffect(() => {
        if (stepData) {
            setFormData(stepData);
        } else {
            setFormData({
                ...emptyFormData,
                id: helpers.generateUniqueID(),
                job_id: job_id,
                order: numSteps
            });
        }
        setShowDeleteConfirm(false);
    }, [stepData, isOpen, job_id, numSteps]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleConfirmDelete = () => {
        if (stepData?.id && onDelete) {
            onDelete(stepData.id);
            onClose();
        }
    };

    function isPending() {
        return formData.status === 'Pending' ? true : false;
    };

    const formatDateTimeLocal = (dateString: string | null | undefined): string => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            // Check if the date is valid
            if (isNaN(date.getTime())) return '';

            // Format to YYYY-MM-DDTHH:MM (without seconds and timezone)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return '';
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{stepData ? "Edit " : "Add"} Work Progress Step</h3>
                {stepData && !showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}>
                        <Trash className="size-5 text-red-500 hover:scale-110" />
                    </button>
                ) : (
                    <button onClick={onClose}>
                        <X className="size-5 hover:scale-110" />
                    </button>
                )}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm ? (
                <div className="p-6 space-y-4">
                    <p className="text-md text-gray-700">
                        Are you sure you want to <span className="text-red-600 font-semibold">delete</span> this Job Step? <br />
                        <span className="text-sm text-gray-500">Job data related to this step will be lost.</span>
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleConfirmDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Existing Form */}
                    <div className="space-y-5 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-700"> *</span>
                        </label>
                        <input
                            placeholder="e.g. Engine Teardown"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brief Description <span className="text-red-700"> *</span>
                        </label>
                        <textarea
                            placeholder="Brief description of work to be completed..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-700"> *</span>
                                </label>
                                <select
                                    value={formData.status || ''}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full border border-gray-300 rounded px-3 py-2.5 ${formData.status === "" ? "text-neutral-500" : null}`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 truncate">
                                    Estimated Hours
                                </label>
                                <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    placeholder="0"
                                    value={formData.estimated_hours || ''}
                                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                            {formData.status !== "" && formData.status !== "Pending" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hours
                                    </label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        placeholder="0"
                                        value={formData.actual_hours || ''}
                                        onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                            )}
                        </div>


                        {formData.status !== "" && (
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        {isPending() ? "Estimated" : null} Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(isPending() ? formData.estimated_start_date : formData.start_date)}
                                        onChange={(e) => isPending() ?
                                            setFormData({ ...formData, estimated_start_date: e.target.value }) :
                                            setFormData({ ...formData, start_date: e.target.value })
                                        }
                                        className={`w-full border border-gray-300 rounded px-3 py-2`}
                                    />
                                </div>

                                {formData.status === 'Completed' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Completed Date
                                        </label>
                                        <input
                                            type='datetime-local'
                                            value={formatDateTimeLocal(formData.completed_date)}
                                            onChange={((e) => setFormData({ ...formData, completed_date: e.target.value }))}
                                            className={`w-full border border-gray-300 rounded px-3 py-2`}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 my-5 p-6 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                        >
                            {stepData ? "Update" : "Add"} Step
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </Modal>
    );
}
