'use client';
import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin } from "lucide-react";
import helpers from "@/app/utils/helpers";
import Modal from "../Modal";

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (customerData: Customer) => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
    const [formData, setFormData] = useState<Customer>({
        id: `CN-${helpers.generateUniqueID()}`,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        notes: "",
        status: 'None'
    });

    const [errors, setErrors] = useState<Partial<Customer>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form data
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                id: `CN-${helpers.generateUniqueID()}`,
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                zipcode: "",
                notes: "",
                status: 'None'
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Customer> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = "First name is required";
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = "Last name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create customer');
            }

            if (onSubmit) {
                onSubmit(formData);
            }

            onClose();
        } catch (error) {
            console.error('Error adding customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let formattedValue = value;

        if (name === "phone") {
            formattedValue = helpers.formatPhoneNumber(value)
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when user starts typing
        if (errors[name as keyof Customer]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="flex w-screen max-w-full items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                    <User className="h-6 w-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                        Add New Customer
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 ">
                        {/* First Name Field */}
                        <div className="col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="First Name"
                                disabled={isSubmitting}
                            />
                            {errors.first_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                            )}
                        </div>

                        {/* Last Name Field */}
                        <div className="col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Last Name"
                                disabled={isSubmitting}
                            />
                            {errors.last_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="inline h-4 w-4 mr-1" />
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="customer@example.com"
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="(555) 123-4567"
                            disabled={isSubmitting}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Address Fields */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Address
                        </label>
                        <div className="space-y-2">
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street Address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows={2}
                                disabled={isSubmitting}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    disabled={isSubmitting}
                                />
                                <select
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select State</option>
                                    {helpers.US_STATES.map((state) => (
                                        <option key={state.abbreviation} value={state.abbreviation}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    id="zipcode"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleInputChange}
                                    placeholder="ZIP Code"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Additional notes about the customer..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Customer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}