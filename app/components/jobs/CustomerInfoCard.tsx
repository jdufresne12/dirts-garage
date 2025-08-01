'use client';
import React, { useEffect, useState } from 'react';
import { Contact2, Edit, Phone, Mail, MapPin } from 'lucide-react';
import AddCustomerModal from '../customers/AddCustomerModal';

interface CustomerInfoProps {
    customer?: Customer;
    handleUpdate?: (customer: Customer) => void;
}

export default function CustomerInfo({ customer, handleUpdate }: CustomerInfoProps) {
    const [isEditing, setIsEditing] = useState<boolean>(customer ? false : true);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/customers`);
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleCustomerSelect = async (customerId: string) => {
        if (customerId) {
            // Use the fetched customers from API, not mockCustomers
            const selectedCustomer = customers.find(c => c.id === customerId);
            if (selectedCustomer) {
                await handleUpdate?.(selectedCustomer);
                setIsEditing(false);
                setSelectedCustomerId('');
            }
        }
    };

    const handleAddNewCustomer = async (customerData: Customer) => {
        console.log('New customer:', customerData);
        await handleUpdate?.(customerData);
        setSelectedCustomerId(customerData.id);
        setIsEditing(false);

        // Refresh the customers list to include the new customer
        try {
            const res = await fetch(`/api/customers`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error("Error refreshing customers:", error);
        }
    };

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

                {loading ? (
                    <p className="text-gray-500">Loading customers...</p>
                ) : (
                    <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                            setSelectedCustomerId(e.target.value);
                            handleCustomerSelect(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="">Choose a customer...</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.first_name || customer.first_name} {customer.last_name || customer.last_name}
                            </option>
                        ))}
                    </select>
                )}

                <div className='flex flex-row justify-center items-center mt-4 gap-4'>
                    <p className='text-stone-300 text-sm'>or</p>
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className='flex items-center justify-center'
                    >
                        <span className='text-sm font-bold text-orange-400 hover:text-orange-800 hover:scale-110'>Add New Customer</span>
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
                <h3 className="font-semibold">
                    {customer.first_name || customer.first_name} {customer.last_name || customer.last_name}
                </h3>
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
}