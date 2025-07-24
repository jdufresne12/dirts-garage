import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null; // Don't render if modal is closed

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto ease-out">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black opacity-70 transition-opacity"
                onClick={onClose}
            />

            {/* Modal content container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
