'use client';
import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { mockVehicles } from '@/app/data/mock-data';
import AddVehicleModal from '../customers/AddVehicleModal';

interface vehicleInfoProps {
    vehicle?: Vehicle;
    handleUpdate?: (vehicle: Vehicle) => void;
    customerId?: string;
}

export default function VehicleInfo({ vehicle, handleUpdate, customerId }: vehicleInfoProps) {
    const [isEditing, setIsEditing] = useState<boolean>(vehicle ? false : true);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);

    const possibleVehicles = mockVehicles.filter(v => v.customerId === customerId);

    const handleAddVehicle = (vehicleId: string) => {
        if (vehicleId && customerId) {
            const selectedVehicle = mockVehicles.find(v => v.id === vehicleId);
            if (selectedVehicle) {
                handleUpdate?.(selectedVehicle);
                setIsEditing(false);
                setSelectedVehicleId('');
            }
        }
    };

    const handleAddNewVehicle = (vehicleData: Vehicle) => {
        console.log(vehicleData);
        handleUpdate?.(vehicleData);
        setSelectedVehicleId(vehicleData.id);
        setIsEditing(false);
    }

    if ((!vehicle || isEditing) && customerId) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Select Vehicle</h3>
                    {vehicle && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>
                {possibleVehicles.length > 0 &&
                    <select
                        value={selectedVehicleId}
                        onChange={(e) => {
                            setSelectedVehicleId(e.target.value)
                            handleAddVehicle(e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="">Choose a vehicle...</option>
                        {possibleVehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.year} {v.make} {v.model}
                            </option>
                        ))}
                    </select>
                }
                <div className='flex flex-row justify-center items-center mt-4 gap-4'>
                    <p className='text-stone-300 text-sm '>or</p>
                    <button
                        onClick={() => setShowAddVehicleModal(true)}
                        className='flex items-center justify-center '
                    >
                        <span className='text-sm font-bold text-orange-400 hover:text-color-800 hover:scale[120]'>Add New vehicle</span>
                    </button>
                </div>

                <AddVehicleModal
                    isOpen={showAddVehicleModal}
                    customerId={customerId}
                    onClose={() => setShowAddVehicleModal(false)}
                    onSubmit={handleAddNewVehicle}
                />
            </div>
        );
    }
    else if (vehicle) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>VIN:</strong> {vehicle.vin}</p>
                        <p><strong>Mileage:</strong> {vehicle.mileage}</p>
                        <p><strong>Color:</strong> {vehicle.color}</p>
                        <p><strong>Engine:</strong> {vehicle.engine}</p>
                        <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Vehicle Info</h3>
                </div>
            </div>
        )
    }
};
