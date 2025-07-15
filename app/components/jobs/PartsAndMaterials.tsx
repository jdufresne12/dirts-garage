'use client';
import React, { useState, useEffect } from 'react';
import AddPartModal from './AddPartModal';

interface PartsProps {
    parts: Part[]
    setParts: React.Dispatch<React.SetStateAction<Part[] | undefined>>;
    jobId: string;
}

export default function parts({ parts, setParts, jobId }: PartsProps) {
    const [showAddPartModal, setShowAddPartModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [showPartInfo, setShowPartInfo] = useState<boolean[]>(new Array(parts.length).fill(false));

    useEffect(() => {
        console.log(showPartInfo);
    }, [showPartInfo])

    const getPartStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case 'received':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'ordered':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'needed':
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

        setParts(prevParts => [...prevParts!, part]);
        setShowAddPartModal(false);
        setSelectedPart(null);
    }

    const handlePartRemoval = (partId: string) => {
        console.log(partId);
    }

    const handlePartClick = (part: Part, index: number) => {
        if (showPartInfo[index] === false) {
            setSelectedPart(part);
        }

        const updatedShowPartInfo = [...showPartInfo];
        updatedShowPartInfo[index] = !updatedShowPartInfo[index];
        setShowPartInfo(updatedShowPartInfo);
    }

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
                            onClick={() => handlePartClick(part, index)}
                            className="flex flex-row justify-between p-4 gap-4 sm:flex-row sm:items-center cursor-pointer"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{part.name}</h4>
                                <p className="text-sm text-gray-600">{part.partNumber} • Qty: {part.quantity} • ${part.price}</p>
                            </div>
                            <span className={`${getPartStatusBadge(part.status)} whitespace-nowrap`}>
                                {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                            </span>
                        </div>

                        {/* Expanded content sits outside the flex container */}
                        {showPartInfo[index] && selectedPart && (
                            <div className='w-full h-50 bg-black border-t border-gray-200'>
                                {/* Your expanded content here */}
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