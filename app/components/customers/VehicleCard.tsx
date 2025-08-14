'use client';


import React, { useState } from 'react';
import AddVehicleModal from './AddVehicleModal';
import { Car, Edit3 } from 'lucide-react';

interface VehicleCardProps {
    vehicle: Vehicle;
    customer_id: string;
    onUpdate: (updatedVehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, customer_id, onUpdate }: VehicleCardProps) {
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
                    <div className='space-x-4'>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        {/* <button
                            onClick={() => setShowEditModal(true)}
                            className="text-gray-400 hover:text-red-600"
                        >
                            <Trash className="w-4 h-4" />
                        </button> */}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div><span className="font-medium">Engine:</span> {vehicle.engine || 'N/A'}</div>
                    <div><span className="font-medium">Transmission:</span> {vehicle.transmission || 'N/A'}</div>
                    <div><span className="font-medium">Mileage:</span> {vehicle.mileage !== 0 ? vehicle.mileage : 'N/A'}</div>
                    <div><span className="font-medium">VIN:</span> {vehicle.vin || 'N/A'}</div>
                </div>
            </div>

            {/* Edit Vehicle Modal */}
            <AddVehicleModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleEditSubmit}
                customer_id={customer_id}
                vehicle={{ ...vehicle, customer_id }}
            />
        </>
    );
}
