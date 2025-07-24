'use client';
import React, { useEffect, useState } from "react";
import { X, CarFront } from "lucide-react";
import Modal from "../Modal";
import helpers from "@/app/utils/helpers";

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (vehicleData: Vehicle) => void;
    customerId: string;
    vehicle?: Vehicle; // <-- For editing
}

export default function AddVehicleModal({
    isOpen,
    onClose,
    onSubmit,
    customerId,
    vehicle,
}: AddVehicleModalProps) {
    const isEditMode = !!vehicle;

    const [formData, setFormData] = useState<Vehicle>({
        id: vehicle?.id ?? helpers.generateUniqueID(),
        customerId: vehicle?.customerId ?? customerId,
        year: vehicle?.year ?? new Date().getFullYear(),
        make: vehicle?.make ?? "",
        model: vehicle?.model ?? "",
        vin: vehicle?.vin ?? "",
        licensePlate: vehicle?.licensePlate ?? "",
        color: vehicle?.color ?? "",
        mileage: vehicle?.mileage ?? 0,
        jobs: vehicle?.jobs ?? [],
    });

    const [errors, setErrors] = useState<Partial<Record<keyof Vehicle, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                id: vehicle?.id ?? helpers.generateUniqueID(),
                customerId: vehicle?.customerId ?? customerId,
                year: vehicle?.year ?? new Date().getFullYear(),
                make: vehicle?.make ?? "",
                model: vehicle?.model ?? "",
                vin: vehicle?.vin ?? "",
                licensePlate: vehicle?.licensePlate ?? "",
                color: vehicle?.color ?? "",
                mileage: vehicle?.mileage ?? 0,
                jobs: vehicle?.jobs ?? [],
            });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, vehicle]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const validateForm = () => {
        const newErrors: Partial<Record<keyof Vehicle, string>> = {};
        if (!formData.year) newErrors.year = "Year is required";
        if (!formData.make.trim()) newErrors.make = "Make is required";
        if (!formData.model.trim()) newErrors.model = "Model is required";
        if (!formData.vin?.trim()) newErrors.vin = "VIN is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type } = e.target;
        let newValue: string | number = value;

        // Handle number fields
        if (type === "number") {
            newValue = value === "" ? "" : parseInt(value, 10);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        if (errors[name as keyof Vehicle]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await new Promise((res) => setTimeout(res, 800));
            onSubmit?.(formData);
            onClose();
        } catch (err) {
            console.error("Vehicle submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex w-screen max-w-full items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                    <CarFront className="h-6 w-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year *
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.year ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Make *
                            </label>
                            <input
                                type="text"
                                name="make"
                                value={formData.make}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.make ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            {errors.make && <p className="text-sm text-red-600">{errors.make}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Model *
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.model ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            {errors.model && <p className="text-sm text-red-600">{errors.model}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                VIN *
                            </label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.vin ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            {errors.vin && <p className="text-sm text-red-600">{errors.vin}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
                            <input
                                type="number"
                                name="mileage"
                                value={formData.mileage}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                        <input
                            type="text"
                            name="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

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
                        {isSubmitting ? "Saving..." : isEditMode ? "Update Vehicle" : "Add Vehicle"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
