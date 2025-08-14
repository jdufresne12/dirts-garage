'use client'
import React, { useState, useEffect } from 'react';
import { Trash, X } from 'lucide-react';
import Modal from '../Modal';
import helpers from '@/app/utils/helpers';

const emptyFormData: Part = {
    id: helpers.generateUniqueID(),
    job_id: '',
    name: '',
    description: '',
    quantity: 1,
    price: 0,
    part_number: '',
    url: '',
    status: 'Needed'
};

interface AddPartModalProps {
    isOpen: boolean;
    partData: Part | null;
    job_id: string;
    onClose: () => void;
    onSave: (partData: Part) => void;
    onDelete?: (partId: string) => void;
}

export default function AddPartModal({ isOpen, partData, job_id, onClose, onSave, onDelete }: AddPartModalProps) {
    const [formData, setFormData] = useState<Part>(partData ?? emptyFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof Part, string>>>({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (partData) {
            setFormData(partData);
        } else {
            setFormData({
                ...emptyFormData,
                id: helpers.generateUniqueID(),
                job_id: job_id
            });
        }
        setErrors({});
        setShowDeleteConfirm(false);
        setIsSubmitting(false);
    }, [partData, isOpen, job_id]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Part, string>> = {};

        // Required field validations
        if (!formData.name.trim()) {
            newErrors.name = "Part name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Part name must be at least 2 characters";
        }

        if (!formData.part_number.trim()) {
            newErrors.part_number = "Part number is required";
        } else if (formData.part_number.trim().length < 2) {
            newErrors.part_number = "Part number must be at least 2 characters";
        }

        // Quantity validation
        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = "Quantity must be greater than 0";
        } else if (!Number.isInteger(formData.quantity)) {
            newErrors.quantity = "Quantity must be a whole number";
        }

        // Price validation
        if (formData.price < 0) {
            newErrors.price = "Price cannot be negative";
        }

        // URL validation (if provided)
        if (formData.url && formData.url.trim()) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(formData.url.trim())) {
                newErrors.url = "Please enter a valid URL (starting with http:// or https://)";
            }
        }

        // Status validation
        if (!formData.status) {
            newErrors.status = "Status is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: string | number = value;

        // Handle number fields
        if (type === "number") {
            if (name === "quantity") {
                newValue = value === "" ? 1 : parseInt(value, 10) || 1;
            } else if (name === "price") {
                newValue = value === "" ? 0 : parseFloat(value) || 0;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error when user starts typing
        if (errors[name as keyof Part]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving part:', error);
            // You could set a general error state here if needed
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (partData?.id && onDelete) {
            setIsSubmitting(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onDelete(partData.id);
                onClose();
            } catch (error) {
                console.error('Error deleting part:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="flex w-screen max-w-full items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{partData ? "Edit" : "Add"} Part</h3>
                {partData && !showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSubmitting}
                        className="disabled:opacity-50"
                    >
                        <Trash className="size-5 text-red-500 hover:scale-110" />
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="disabled:opacity-50"
                    >
                        <X className="size-5 hover:scale-110" />
                    </button>
                )}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm ? (
                <div className="p-6 space-y-4">
                    <p className="text-md text-gray-700">
                        Are you sure you want to <span className="text-red-600 font-semibold">delete</span> this part? <br />
                        <span className="text-sm text-gray-500">This action cannot be undone.</span>
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isSubmitting}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isSubmitting}
                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Part Form */}
                    <div className="space-y-5 p-6">
                        {/* Part Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Part Name <span className="text-red-700"> *</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Forged Pistons"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Part Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Part Number <span className="text-red-700"> *</span>
                            </label>
                            <input
                                type="text"
                                name="part_number"
                                placeholder="e.g. JE-123456"
                                value={formData.part_number || ''}
                                onChange={handleInputChange}
                                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.part_number ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={isSubmitting}
                            />
                            {errors.part_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.part_number}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                placeholder="Optional description or notes about this part..."
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Quantity, Price, and Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-700"> *</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    step="1"
                                    placeholder="1"
                                    value={formData.quantity || ''}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isSubmitting}
                                />
                                {errors.quantity && (
                                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (Each)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price || ''}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isSubmitting}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-700"> *</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status || 'Needed'}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    <option value="Needed">Needed</option>
                                    <option value="Ordered">Ordered</option>
                                    <option value="Received">Received</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        {/* URL (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product URL
                            </label>
                            <input
                                type="url"
                                name="url"
                                placeholder="https://..."
                                value={formData.url || ''}
                                onChange={handleInputChange}
                                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={isSubmitting}
                            />
                            {errors.url && (
                                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Optional link to product page or vendor
                            </p>
                        </div>

                        {/* Total Cost Display */}
                        {formData.quantity > 0 && formData.price > 0 && (
                            <div className="bg-gray-50 rounded p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${(formData.quantity * formData.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 my-5 p-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : (partData ? "Update" : "Add")} Part
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}