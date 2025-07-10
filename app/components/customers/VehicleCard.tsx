'use client';

import { Car, Edit3 } from 'lucide-react';
import React, { useState } from 'react';
import AddVehicleModal from './AddVehicleModal';

interface VehicleCardProps {
    vehicle: Vehicle;
    customerId: string;
    onUpdate: (updatedVehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, customerId, onUpdate }: VehicleCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEditSubmit = (updatedVehicle: Vehicle) => {
        onUpdate(updatedVehicle);
        setShowEditModal(false);
    };

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                        <Car className="w-5 h-5 text-orange-500 mr-2" />
                        <h4 className="font-semibold text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                    </div>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div><span className="font-medium">VIN:</span> {vehicle.vin || 'N/A'}</div>
                    <div><span className="font-medium">Mileage:</span> {vehicle.mileage?.toLocaleString() || 'N/A'}</div>
                    <div><span className="font-medium">Color:</span> {vehicle.color || 'N/A'}</div>
                    <div><span className="font-medium">License:</span> {vehicle.licensePlate || 'N/A'}</div>
                </div>
            </div>

            {/* Edit Vehicle Modal */}
            <AddVehicleModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleEditSubmit}
                customerId={customerId}
                vehicle={{ ...vehicle, customerId }}
            />
        </>
    );
}
