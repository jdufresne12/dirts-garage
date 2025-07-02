'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, Search, Plus, ChevronRight } from 'lucide-react';
import { customers } from '../data/customers';
import AddCustomerModal from '../components/customers/AddCustomerModal';

const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
        case "active":
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case "waiting":
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "completed":
            return `${baseClasses} bg-green-100 text-green-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-600`;
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case "active":
            return "Active Job";
        case "waiting":
            return "Waiting";
        case "completed":
            return "Ready for Pickup";
        default:
            return "No Active Jobs";
    }
};

export default function CustomersPage() {
    const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

    const handleAddCustomer = (customerData: any) => {
        console.log('New customer data:', customerData);
        // Here you would typically save to your database or state management
        // For now, we'll just log it
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 p-4 rounded-lg lg:flex-row lg:items-center lg:justify-between lg:mb-8 lg:bg-white lg:p-6 lg:shadow-lg">
                    <h1 className="text-2xl p-4 min-w-0 text-center font-bold bg-white rounded-lg shadow-md text-gray-900 lg:p-0 lg:bg-none lg:rounded-none lg:shadow-none lg:text-3xl">Customers</h1>
                    {/* Action Container */}
                    <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button>
                            <Search className="size-5 text-gray-500 hover:scale-125" />
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-50 pl-4 pr-4 py-2 mr-5 border-1 border-gray-300 rounded-lg md:w-75 hover:border-orange-400"
                            />
                        </div>

                        <button
                            className="flex px-4 py-3 text-sm font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-center whitespace-nowrap lg:shadow-none"
                            onClick={() => setAddCustomerModalOpen(true)}
                        >
                            <Plus className="size-5 text-white md:mr-1" />
                            <span className='hidden md:inline'>Add Customer</span>
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="my-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
                        <div className="text-sm text-gray-600">Total Customers</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {customers.filter(c => c.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-600">Active Jobs</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-yellow-400">
                            {customers.filter(c => c.status === 'waiting').length}
                        </div>
                        <div className="text-sm text-gray-600">Waiting</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {customers.filter(c => c.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Ready for Pickup</div>
                    </div>
                </div>

                {/* Customer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {customers.map((customer) => (
                        <Link
                            key={customer.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-transform hover:scale-103 "
                            href={`/customers/${customer.id}`}
                        >
                            {/* Header with name and status */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                                    <span className={`${getStatusBadge(customer.status)} mt-2 inline-block`}>
                                        {getStatusText(customer.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="size-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{customer.phone}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="size-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            </div>

                            {/* Current Project */}
                            {customer.currentProject ? (
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Current Project</div>
                                    <div className="text-sm font-medium text-gray-900">{customer.currentProject}</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-sm text-gray-400">No active projects</div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AddCustomerModal
                isOpen={addCustomerModalOpen}
                onClose={() => setAddCustomerModalOpen(false)}
                onSubmit={handleAddCustomer}
            />
        </div>
    );
}