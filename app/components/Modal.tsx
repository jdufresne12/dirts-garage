import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 transition-opacity"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="fixed inset-0 overflow-y-scroll">
                <div className="flex min-h-full items-center justify-center p-4 pt-8 sm:pt-6 sm:items-center">
                    <div className="flex flex-col w-full max-w-2xl bg-white rounded-lg shadow-xl mt-13 sm:mt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}