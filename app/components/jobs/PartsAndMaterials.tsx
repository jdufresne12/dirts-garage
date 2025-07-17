'use client';
import React, { useState, useEffect } from 'react';
import AddPartModal from './AddPartModal';
import { Edit } from 'lucide-react';

interface PartsProps {
    parts: Part[]
    setParts: React.Dispatch<React.SetStateAction<Part[] | undefined>>;
    jobId: string;
}

export default function parts({ parts, setParts, jobId }: PartsProps) {
    const [showAddPartModal, setShowAddPartModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [showPartInfo, setShowPartInfo] = useState<boolean[]>(new Array(parts.length).fill(false));

    const getPartStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 h-8 rounded text-xs font-medium";
        switch (status) {
            case 'Received':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'Ordered':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Needed':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const handleModalClose = () => {
        setShowAddPartModal(false);
        setSelectedPart(null);
    }

    const handleModalSave = (part: Part) => {
        console.log(part);
        part.jobId = jobId;

        // Call APi to add to DB
        if (selectedPart?.id === part.id) {
            setParts((prevParts) =>
                (prevParts ?? []).map(p => p.id === part.id ? part : p));
            setSelectedPart(part)
        } else {
            setParts(prevParts => [...prevParts!, part]);
            setSelectedPart(null)
        }

        setShowAddPartModal(false);
    }

    const handlePartRemoval = (partId: string) => {
        console.log(partId);
    }

    const handlePartClick = (index: number) => {
        const updatedShowPartInfo = [...showPartInfo];
        updatedShowPartInfo[index] = !updatedShowPartInfo[index];
        setShowPartInfo(updatedShowPartInfo);
    }

    const handleEditPart = (part: Part) => {
        setSelectedPart(part);
        setShowAddPartModal(true);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold">Parts & Materials</h2>
                <button
                    onClick={() => setShowAddPartModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                    Add Part
                </button>
            </div>

            <div className="space-y-4">
                {parts.map((part, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg hover:scale-101">
                        <div
                            onClick={() => handlePartClick(index)}
                            className="flex flex-row justify-between p-4 gap-4 sm:flex-row sm:items-center cursor-pointer"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{part.name}</h4>
                                <p className="text-sm text-gray-600">{part.partNumber} • Qty: {part.quantity} • ${part.price}</p>
                            </div>
                            <span className={`flex ${getPartStatusBadge(part.status)} whitespace-nowrap justify-center items-center`}>
                                {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                            </span>
                        </div>

                        {/* Expanded content sits outside the flex container */}
                        {showPartInfo[index] && part && (
                            <div className='w-full bg-gray-50 rounded-b-lg border-t border-gray-200'>
                                <div className="p-4">
                                    {/* Header with title and edit button */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Part Details</h3>
                                        <button
                                            onClick={() => handleEditPart(part)}
                                        >
                                            <Edit className="size-4 text-orange-400 mr-2 hover:scale-105" />
                                        </button>
                                    </div>

                                    {part.description &&
                                        <div className='mb-4'>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide ">
                                                Description
                                            </label>
                                            <p className="text-sm text-gray-900 font-medium">{part.description}</p>
                                        </div>
                                    }

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide ">
                                                    Part Name
                                                </label>
                                                <p className="text-sm text-gray-900 font-medium">{part.name}</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide ">
                                                    Part Number
                                                </label>
                                                <p className="text-sm text-gray-900 font-mono">{part.partNumber}</p>
                                            </div>
                                            {part.url && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide ">
                                                        Link
                                                    </label>
                                                    <a
                                                        href={part.url.startsWith('http') ? part.url : `https://${part.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 text-sm"
                                                    >
                                                        {part.url}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inventory & Pricing */}
                                        <div className="grid grid-cols-3 lg:grid-cols-none space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Quantity
                                                </label>
                                                <p className="text-sm text-gray-900">{part.quantity}</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Price <span className='lowercase'>(each)</span>
                                                </label>
                                                <p className="text-sm text-gray-900 font-semibold">${part.price}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Price <span className='lowercase'>(total)</span>
                                                </label>
                                                <p className="text-sm text-gray-900 font-semibold">
                                                    ${(part.quantity * part.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AddPartModal
                isOpen={showAddPartModal}
                partData={selectedPart}
                onClose={handleModalClose}
                onSave={handleModalSave}
                onDelete={handlePartRemoval}
            />
        </div>
    )
};