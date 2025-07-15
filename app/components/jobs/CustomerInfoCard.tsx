'use client';
import React, { useState } from 'react';
import { Contact2, Edit, Phone, Mail, MapPin } from 'lucide-react';
import { mockCustomers } from '@/app/data/mock-data';
import AddCustomerModal from '../customers/AddCustomerModal';

interface CustomerInfoProps {
    customer?: Customer;
    handleUpdate?: (customer: Customer) => void;
}

export default function CustomerInfo({ customer, handleUpdate }: CustomerInfoProps) {
    const [isEditing, setIsEditing] = useState<boolean>(customer ? false : true);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);

    const handleCustomerSelect = (customerId: string) => {
        if (customerId) {
            const selectedCustomer = mockCustomers.find(c => c.id === customerId);
            if (selectedCustomer) {
                handleUpdate?.(selectedCustomer);
                setIsEditing(false);
                setSelectedCustomerId('');
            }
        }
    };

    const handleAddNewCustomer = (customerData: Customer) => {
        console.log(customerData);
        handleUpdate?.(customerData)
        setSelectedCustomerId(customerData.id);
        setIsEditing(false);
    }

    if (!customer || isEditing) {
        return (
            <div className="z-auto bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Select Customer</h3>
                    {customer && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        handleCustomerSelect(e.target.value);
                    }}
                    className="w-7/8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="">Choose a customer...</option>
                    {mockCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                        </option>
                    ))}
                </select>

                <div className='flex flex-row justify-center items-center mt-4 gap-4'>
                    <p className='text-stone-300 text-sm '>or</p>
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className='flex items-center justify-center '
                    >
                        <span className='text-sm font-bold text-orange-400 hover:text-color-800 hover:scale[120]'>Add Customer</span>
                    </button>
                </div>

                <AddCustomerModal
                    isOpen={showAddCustomerModal}
                    onClose={() => setShowAddCustomerModal(false)}
                    onSubmit={handleAddNewCustomer}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{customer.firstName} {customer.lastName}</h3>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <Edit className="size-4" />
                </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                    <Phone className="size-4 mr-2" />
                    {customer.phone}
                </div>
                <div className="flex items-center">
                    <Mail className="size-4 mr-2" />
                    {customer.email}
                </div>
                <div className="flex items-start">
                    <MapPin className="size-4 mr-2 mt-0.5" />
                    {customer.address}
                </div>
            </div>
        </div>
    );
};