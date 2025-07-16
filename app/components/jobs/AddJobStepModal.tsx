'use client'
import React, { useState, useEffect } from 'react';
import { Trash, X } from 'lucide-react';
import Modal from '../Modal';
import helpers from '@/app/utils/helpers';

const emptyFormData: JobStep = {
    id: helpers.generateUniqueID(),
    title: '',
    description: '',
    status: '',
    estimatedHours: 0,
    actualHours: 0,
    startDate: '',
    completedDate: '',
    estimatedStartDate: '',
};

interface AddProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobData: JobStep) => void;
    stepData?: JobStep;
    onDelete?: (stepId: string) => void; // NEW: optional delete handler
}

export default function AddJobStepModal({ isOpen, onClose, onSave, stepData, onDelete }: AddProgressModalProps) {
    const [formData, setFormData] = useState<JobStep>(stepData ?? emptyFormData);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // NEW

    useEffect(() => {
        if (stepData) {
            setFormData(stepData);
        } else {
            setFormData({ ...emptyFormData, id: helpers.generateUniqueID() });
        }
        setShowDeleteConfirm(false); // reset when modal opens
    }, [stepData, isOpen]);

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
        return formData.status === 'pending' ? true : false;
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

                        <div className="grid grid-cols-2 gap-10 pb-2">
                            <div className='col-span-1'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-700"> *</span>
                                </label>
                                <select
                                    value={formData.status || ''}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full border border-gray-300 rounded px-3 py-2.5 ${formData.status === "" ? "text-neutral-500" : null}`}
                                >
                                    <option value="">- Select Status -</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estimated Hours
                                    </label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        placeholder="0"
                                        value={formData.estimatedHours || ''}
                                        onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                                {formData.status !== "" && formData.status !== "pending" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hours
                                        </label>
                                        <input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            placeholder="0"
                                            value={formData.actualHours || ''}
                                            onChange={(e) => setFormData({ ...formData, actualHours: parseFloat(e.target.value) })}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>


                        {formData.status !== "" && (
                            <div className='grid grid-cols-2 gap-10 mt-5'>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        {isPending() ? "Estimated" : null} Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={(isPending() ? formData.estimatedStartDate : formData.startDate) || ''}
                                        onChange={(e) => isPending() ?
                                            setFormData({ ...formData, estimatedStartDate: e.target.value }) :
                                            setFormData({ ...formData, startDate: e.target.value })
                                        }
                                        className={`w-full border border-gray-300 rounded px-3 py-2 ${formData.startDate === "" ? "text-neutral-500" : null}`}
                                    />
                                </div>

                                {formData.status === 'completed' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Completed Date
                                        </label>
                                        <input
                                            type='datetime-local'
                                            value={formData.completedDate || ''}
                                            onChange={((e) => setFormData({ ...formData, completedDate: e.target.value }))}
                                            className={`w-full border border-gray-300 rounded px-3 py-2 ${formData.completedDate === "" ? "text-neutral-500" : null}`}
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
