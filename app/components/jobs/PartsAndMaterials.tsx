'use client';
import React, { useState, useEffect } from 'react';
import AddPartModal from './AddPartModal';
import { Edit, Cog } from 'lucide-react';

interface PartsProps {
    job_id: string;
    parts: Part[] | [];
    setParts: React.Dispatch<React.SetStateAction<Part[] | undefined>>;
}

export default function parts({ parts, setParts, job_id }: PartsProps) {
    const [showAddPartModal, setShowAddPartModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [showPartInfo, setShowPartInfo] = useState<boolean[]>(new Array(parts.length).fill(false));

    useEffect(() => {
        try {
            fetch(`/api/jobs/parts/${job_id}`)
                .then(res => res.json())
                .then(data => setParts(data))
        } catch (error) {
            console.error('Error fetching parts:', error);
        }
    }, [job_id]);

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

    const handleModalSave = async (part: Part) => {
        console.log(part);
        part.job_id = job_id;

        try {
            if (selectedPart?.id === part.id) {
                // Update existing part
                const response = await fetch(`/api/jobs/parts/${part.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(part),
                });

                if (!response.ok) {
                    throw new Error('Failed to update part');
                }

                const updatedPart = await response.json();

                setParts((prevParts) =>
                    (prevParts ?? []).map(p => p.id === part.id ? updatedPart : p)
                );
                setSelectedPart(updatedPart);
            } else {
                // Create new part
                const response = await fetch('/api/jobs/parts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(part),
                });

                if (!response.ok) {
                    throw new Error('Failed to create part');
                }

                setParts(prevParts => [...(prevParts ?? []), part]);
                setSelectedPart(null);
            }

            setShowAddPartModal(false);
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    const handlePartRemoval = async (partId: string) => {
        console.log(partId);

        try {
            const response = await fetch(`/api/jobs/parts/${partId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete part');
            }

            // Remove part from state only if API call was successful
            setParts(prevParts => (prevParts ?? []).filter(p => p.id !== partId));

            if (selectedPart?.id === partId) {
                setSelectedPart(null);
                setShowAddPartModal(false);
            }
        } catch (error) {
            console.error('Error deleting part:', error);
        }
    };

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
                {parts && parts.length > 0 &&
                    <button
                        onClick={() => setShowAddPartModal(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                    >
                        Add Part
                    </button>
                }

            </div>

            <div className="space-y-4">
                {parts.length > 0 ? parts.map((part, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg hover:scale-101">
                        <div
                            onClick={() => handlePartClick(index)}
                            className="flex flex-row justify-between p-4 gap-4 sm:flex-row sm:items-center cursor-pointer"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{part.name}</h4>
                                <p className="text-sm text-gray-600">{part.part_number} • Qty: {part.quantity} • ${part.price}</p>
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
                                                <p className="text-sm text-gray-900 font-mono">{part.part_number}</p>
                                            </div>
                                            {part.url && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Link
                                                    </label>
                                                    <a
                                                        href={part.url.startsWith('http') ? part.url : `https://${part.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 text-sm block truncate hover:text-blue-700 transition-colors"
                                                        title={part.url} // Shows full URL on hover
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
                )) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-4 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                <Cog className='size-8 text-gray-400' />
                            </div>

                            {/* Main message */}
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No parts added yet
                            </h3>

                            {/* Subtitle */}
                            <p className="text-sm text-gray-500 mb-6 max-w-md">
                                Add parts and materials needed for this job to track inventory, costs, and ordering status.
                                Click "Add Part" to get started.
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={() => setShowAddPartModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-lg hover:bg-orange-500 transition-colors duration-200"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Add Part
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddPartModal
                isOpen={showAddPartModal}
                partData={selectedPart}
                job_id={job_id}
                onClose={handleModalClose}
                onSave={handleModalSave}
                onDelete={handlePartRemoval}
            />
        </div>
    )
};