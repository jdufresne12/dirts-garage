'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    User,
    Phone,
    MapPin,
    Edit3,
    Save,
    X,
    Plus,
    Wrench,
    DollarSign,
    Calendar,
    FileText,
    TrendingUp,
    CheckCircle,
    ChevronLeft
} from 'lucide-react';

import mockData from '../../data/mock-data';
import VehicleCard from '@/app/components/customers/VehicleCard';
import AddVehicleModal from '@/app/components/customers/AddVehicleModal';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('jobs');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    // Get customer data using the new mock data structure
    const customer = mockData.getCustomerById(id as string);
    const [customerData, setCustomerData] = useState<Customer | undefined>(mockData.getCustomerById(id as string));

    useEffect(() => {
        const fetchCustomerData = async () => {
            const customer = await mockData.getCustomerById(id as string);
            console.log(`${id}`)
            setCustomerData(customer);
        };

        if (id) fetchCustomerData();
    }, [id]);

    const handleSave = () => {
        setIsEditing(false);
        // Here you would save the data to your backend
        console.log('Saving customer data:', customerData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original customer data
        setCustomerData(customer);
    };

    const getStatusBadge = (status: Status) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
            {status.type}
        </span>
    );

    const handleAddVehicle = (vehicle: Vehicle) => {
        console.log("New vehicle Info");
        console.log(vehicle);

        setCustomerData(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                vehicles: [...(prev.vehicles || []), vehicle],
                vehicleCount: (prev.vehicleCount || 0) + 1
            };
        });
    }

    // Handle case where customer is not found
    if (!customerData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h1>
                    <p className="text-gray-600">The customer with ID "{id}" could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-2 md:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex">
                        <Link className="flex items-center md:items-baseline md:p-1" href="/customers">
                            <ChevronLeft className="size-4 font-bold text-black md:size-6 lg:size-8 hover:text-gray-800 hover:scale-110" />
                        </Link>
                        <div className='ml-5'>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Customer Details</h1>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Manage customer information and history</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4 ">

                        <button className="p-2 border text-sm border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ">
                            Create Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Information Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Edit3 className="size-4" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Save className="size-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                >
                                    <X className="size-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {/* Name Section */}
                        <div>
                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            value={customerData.firstName}
                                            onChange={(e) => setCustomerData({
                                                ...customerData,
                                                firstName: e.target.value
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            value={customerData.lastName}
                                            onChange={(e) => setCustomerData({
                                                ...customerData,
                                                lastName: e.target.value
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                        <User className="size-3 mr-2" />
                                        Name
                                    </label>
                                    <p className="text-gray-900">{customerData.firstName} {customerData.lastName}</p>
                                </>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <Phone className="size-3 mr-2" />
                                Phone
                            </label>
                            {isEditing ? (
                                <input
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({
                                        ...customerData,
                                        phone: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.phone}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            {isEditing ? (
                                <input
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({
                                        ...customerData,
                                        email: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.email}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <MapPin className="size-3 mr-2" />
                                Address
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={customerData.address || ''}
                                    onChange={(e) => setCustomerData({
                                        ...customerData,
                                        address: e.target.value
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={2}
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.address || 'No address provided'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Stats */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Overview</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                            {getStatusBadge(customerData.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Total Vehicles</label>
                                <p className="text-2xl font-bold text-gray-900">{customerData.vehicleCount}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Total Jobs</label>
                                <p className="text-2xl font-bold text-gray-900">{customerData.jobCount}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Total Spent</label>
                                <p className="text-xl font-bold text-green-600">
                                    ${customerData.totalSpent ? customerData.totalSpent.toLocaleString() : 0}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Amount Owed</label>
                                <p className={`text-xl font-bold ${customerData.amountOwed && customerData.amountOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ${customerData.amountOwed ? customerData.amountOwed.toLocaleString() : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Vehicles</h2>
                    <button
                        onClick={() => setShowAddVehicle(true)}
                        className="flex items-center text-sm gap-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
                    >
                        <Plus className="size-3 md:size-4" />
                        Add Vehicle
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customerData.vehicles && customerData.vehicles.length > 0 ? (
                        customerData.vehicles.map(vehicle => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} customerId={customer!.id} onUpdate={handleAddVehicle} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No vehicles registered for this customer
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'jobs', label: 'Jobs', icon: Wrench },
                            { id: 'invoices', label: 'Invoices', icon: FileText },
                            // { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'jobs' && (
                        <div>
                            <Link
                                href="/jobs/new-job"
                                className="flex w-fit items-center mb-2 p-1 text-center text-sm font-medium transition-colors whitespace-nowrap
                            text-orange-400 rounded-lg hover:border-orange-400 hover:border-1"
                            >
                                <Plus className="size-3 mr-1 text-orange-400 md:size-4" /> New Job
                            </Link>
                            {customerData.jobs && customerData.jobs.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Cost</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {customerData.jobs.map(job => {
                                                const vehicle = customerData.vehicles?.find(v => v.id === job.vehicleId);
                                                return (
                                                    <tr key={job.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {job.title}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(job.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {job.startDate}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ${job.estimatedCost.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className="text-orange-600 hover:text-orange-900 mr-3">View</button>
                                                            <button className="text-gray-600 hover:text-gray-900">Edit</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No jobs found for this customer
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div>
                            <Link
                                href="/jobs/new-job"
                                className="flex w-fit items-center mb-2 p-1 text-center text-sm font-medium transition-colors whitespace-nowrap
                            text-orange-400 rounded-lg hover:border-orange-400 hover:border-1"
                            >
                                <Plus className="size-3 mr-1 text-orange-400 md:size-4" /> Create Invoice
                            </Link>
                            {customerData.invoices && customerData.invoices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {customerData.invoices.map(invoice => (
                                                <tr key={invoice.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        INV-{invoice.id.toString().padStart(3, '0')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${invoice.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${invoice.amountPaid.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {invoice.date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(invoice.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button className="text-orange-600 hover:text-orange-900 mr-3">View</button>
                                                        <button className="text-gray-600 hover:text-gray-900">Download</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No invoices found for this customer
                                </div>
                            )}
                        </div>
                    )}

                    {/* {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Average Job Value</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            ${customerData.jobCount > 0 ? (customerData.totalSpent / customerData.jobCount).toFixed(0) : '0'}
                                        </p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Active Jobs</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {customerData.jobs?.filter(job => job.status.type === 'Active').length || 0}
                                        </p>
                                    </div>
                                    <Wrench className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Completed Jobs</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            {customerData.jobs?.filter(job => job.status.type === 'Completed').length || 0}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={showAddVehicle}
                onClose={() => setShowAddVehicle(false)}
                onSubmit={handleAddVehicle}
                customerId={customer!.id}
            />
        </div>
    );
};

export default CustomerDetailsPage;