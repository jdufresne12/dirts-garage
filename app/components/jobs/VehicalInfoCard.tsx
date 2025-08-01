'use client';
import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import { mockVehicles } from '@/app/data/mock-data';
import AddVehicleModal from '../customers/AddVehicleModal';

interface vehicleInfoProps {
    vehicle?: Vehicle;
    handleUpdate?: (vehicle: Vehicle) => void;
    customer_id?: string;
}

export default function VehicleInfo({ vehicle, handleUpdate, customer_id }: vehicleInfoProps) {
    const [isEditing, setIsEditing] = useState<boolean>(vehicle ? false : true);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
    const [possibleVehicles, setPossibleVehicles] = useState<Vehicle[] | []>([])

    useEffect(() => {
        if (customer_id) {
            try {
                fetch(`/api/vehicles/customer/${customer_id}`)
                    .then(res => res.json())
                    .then(data => setPossibleVehicles(data))
            } catch (error) {
                console.log("Error fetching vehicles:", error);
            }
        } else {
            setPossibleVehicles([])
        }
    }, [customer_id])

    const handleAddVehicle = (vehicle_id: string) => {
        if (vehicle_id && customer_id) {
            const selectedVehicle = mockVehicles.find(v => v.id === vehicle_id);
            if (selectedVehicle) {
                handleUpdate?.(selectedVehicle);
                setIsEditing(false);
                setSelectedVehicleId('');
            }
        }
    };

    const handleAddNewVehicle = (vehicleData: Vehicle) => {
        handleUpdate?.(vehicleData);
        setSelectedVehicleId(vehicleData.id);
        setIsEditing(false);
    }

    if ((!vehicle || isEditing) && customer_id) {
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
                    customer_id={customer_id}
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
                        <p><strong>Engine:</strong> {vehicle.engine}</p>
                        <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                        <p><strong>Mileage:</strong> {vehicle.mileage}</p>
                        <p><strong>VIN:</strong> {vehicle.vin || 'N/A'}</p>
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
