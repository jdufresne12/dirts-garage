'use client';
import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
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
    const [possibleVehicles, setPossibleVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (customer_id) {
            setLoading(true);
            setError('');

            fetch(`/api/vehicles/customer/${customer_id}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setPossibleVehicles(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching vehicles:", error);
                    setError('Failed to load vehicles');
                    setLoading(false);
                    setPossibleVehicles([]);
                });
        } else {
            setPossibleVehicles([]);
        }
    }, [customer_id]);

    const handleAddVehicle = async (vehicle_id: string) => {
        if (vehicle_id && customer_id) {
            // Use possibleVehicles from API instead of mockVehicles
            const selectedVehicle = possibleVehicles.find(v => v.id === vehicle_id);
            if (selectedVehicle) {
                await handleUpdate?.(selectedVehicle);
                setIsEditing(false);
                setSelectedVehicleId('');
            }
        }
    };

    const handleAddNewVehicle = async (vehicleData: Vehicle) => {
        await handleUpdate?.(vehicleData);
        setSelectedVehicleId(vehicleData.id);
        setIsEditing(false);

        // Refresh the vehicle list to include the new vehicle
        if (customer_id) {
            try {
                const res = await fetch(`/api/vehicles/customer/${customer_id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPossibleVehicles(data);
                }
            } catch (error) {
                console.error("Error refreshing vehicles:", error);
            }
        }
    };

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

                {loading && <p className="text-gray-500 mb-4">Loading vehicles...</p>}
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {!loading && !error && possibleVehicles.length > 0 && (
                    <select
                        value={selectedVehicleId}
                        onChange={(e) => {
                            setSelectedVehicleId(e.target.value);
                            handleAddVehicle(e.target.value);
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
                )}

                {!loading && !error && possibleVehicles.length === 0 && (
                    <p className="text-gray-500 mb-4">No vehicles found for this customer.</p>
                )}

                <div className='flex flex-row justify-center items-center mt-4 gap-4'>
                    <p className='text-stone-300 text-sm'>or</p>
                    <button
                        onClick={() => setShowAddVehicleModal(true)}
                        className='flex items-center justify-center'
                    >
                        <span className='text-sm font-bold text-orange-400 hover:text-orange-800 hover:scale-110'>Add New Vehicle</span>
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
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>

                {(vehicle.engine || vehicle.engine || vehicle.engine) &&
                    <div className="space-y-3 mt-4">
                        <div className="text-sm text-gray-600 space-y-1">
                            {vehicle.engine && <p><strong>Engine:</strong> {vehicle.engine}</p>}
                            {vehicle.transmission && <p><strong>Transmission:</strong> {vehicle.transmission}</p>}
                            {vehicle.mileage !== 0 && <p><strong>Mileage:</strong> {vehicle.mileage}</p>}
                            {vehicle.vin && <p><strong>VIN:</strong> {vehicle.vin}</p>}
                        </div>
                    </div>
                }
            </div>
        )
    }
    else {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Vehicle Info</h3>
                    <p className="text-sm text-gray-500">Select a customer first</p>
                </div>
            </div>
        )
    }
}