import React from 'react';

interface PartsProps {
    partsAndMaterials: Part[]
}

export default function PartsAndMaterials({ partsAndMaterials }: PartsProps) {
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
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold">Parts & Materials</h2>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                    Add Part
                </button>
            </div>

            <div className="space-y-4">
                {partsAndMaterials.map((part, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{part.name}</h4>
                            <p className="text-sm text-gray-600">{part.partNumber} • Qty: {part.quantity} • ${part.price}</p>
                        </div>
                        <span className={`${getPartStatusBadge(part.status)} whitespace-nowrap`}>
                            {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
};