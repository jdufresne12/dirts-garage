'use client'
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from '../Modal';
import helpers from '@/app/utils/helpers';

interface AddProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (jobData: JobStep) => void;
    stepData?: JobStep;
}

export default function AddJobStepModal({ isOpen, onClose, onSave, stepData }: AddProgressModalProps) {
    const [formData, setFormData] = useState<JobStep>(stepData || {
        id: helpers.generateUniqueID(),
        title: '',
        description: '',
        status: '',
        estimatedHours: 0,
        actualHours: 0,
        startDate: '',
        completedDate: ''
    });

    useEffect(() => {
        console.log(stepData)
    }, [])

    useEffect(() => {
        if (stepData) {
            setFormData(stepData)
        }
    }, [stepData])

    useEffect(() => {
        setFormData({
            id: helpers.generateUniqueID(),
            title: '',
            description: '',
            status: '',
            estimatedHours: 0,
            actualHours: 0,
            startDate: '',
            completedDate: ''
        })
    }, [onClose])

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{stepData ? "Edit " : "Add"} Work Progress Step</h3>
                <button onClick={onClose}>
                    <X className="size-5" />
                </button>
            </div>

            <div className="space-y-4 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-700"> *</span>
                </label>
                <input
                    placeholder="e.g. Engine Teardown"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brief Description <span className="text-red-700"> *</span>
                </label>
                <textarea
                    placeholder="Brief description of work to be completed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows={3}
                />
                <div className="grid grid-cols-2">
                    <div className='col-span-1 mr-2'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-700"> *</span>
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className={`w-full border border-gray-300 rounded px-3 py-2 ${formData.status === "" ? "text-neutral-500" : null}`}
                        >
                            <option value="">- Select Status -</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
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
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours
                        </label>
                        <input
                            type="number"
                            step="0.25"
                            min="0"
                            placeholder="0"
                            value={formData.actualHours}
                            onChange={(e) => setFormData({ ...formData, actualHours: parseFloat(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                </div>

                {formData.status !== "" && (
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className={`w-full border border-gray-300 rounded px-3 py-2 ${formData.startDate === "" ? "text-neutral-500" : null}`}
                            />
                        </div>

                        {formData.status === 'completed' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Completed Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.completedDate}
                                    onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${formData.completedDate === "" ? "text-neutral-500" : null}`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 my-5 p-6 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                >
                    Add Step
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};