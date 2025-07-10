import React from 'react';
import { Edit } from 'lucide-react';

interface VehcicleDetailsProps {
    vehicle: Vehicle
}

export default function VehicleDetails({ vehicle }: VehcicleDetailsProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Vehicle Details</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
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
};
