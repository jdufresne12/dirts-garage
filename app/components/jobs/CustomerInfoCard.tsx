import React from 'react';
import { Edit, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerInfoProps {
    customer: Customer;
}

export default function CustomerInfo({ customer }: CustomerInfoProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Customer Info</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{customer.firstName} {customer.lastName} </h4>
                <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    {customer.address}
                </div>
            </div>
        </div>
    )

};