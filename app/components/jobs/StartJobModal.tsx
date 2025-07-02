'use client';
import React, { useState, useEffect } from 'react';

interface StartJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (customerData: any) => void;
}

interface StartJobData {
    jobId: string;
    customerId?: string;
    vehicleId?: string;
    startDate: string;
}

export default function StartJobModal({ isOpen, onClose, onSubmit }: StartJobModalProps) {
    const [formData, setFormData] = useState<StartJobData>({
        jobId: "",
        customerId: "",
        vehicleId: "",
        startDate: "",
    })
    const [errors, setErrors] = useState<Partial<StartJobData>>({})

    // Reset form data
    useEffect(() => {
        setFormData({
            jobId: "",
            customerId: "",
            vehicleId: "",
            startDate: "",
        })
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, onClose]);


    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto ease-out">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black opacity-75"
            />

            {/* Modal */}
            <div className='flex min-h-full items-center justify-center p-4'>
                <div className="relative max-h-[90vh] max-w-2xl w-full bg-white rounded-lg shadow-xl overflow-y-auto">
                    <h1>Start Job Modal</h1>
                </div>
            </div>
        </div>
    )
}