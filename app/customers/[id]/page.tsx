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
    FileText,
    ChevronLeft,
    Mail
} from 'lucide-react';

import mockData from '../../data/mock-data';
import VehicleCard from '@/app/components/customers/VehicleCard';
import AddVehicleModal from '@/app/components/customers/AddVehicleModal';
import helpers from '@/app/utils/helpers';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('jobs');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const [initCustomerData, setInitCustomerData] = useState<Customer | undefined>();
    const [customerData, setCustomerData] = useState<Customer | undefined>();

    useEffect(() => {
        async function fetchCustomerData(id: string) {
            const res = await fetch(`/api/customers/${id}`);
            if (!res.ok) throw new Error('Customer not found');
            return await res.json();
        }

        if (id) {
            fetchCustomerData(id as string)
                .then(data => {
                    setCustomerData(data)
                    setInitCustomerData(data);
                    console.log(data)
                })
                .catch((err) => console.error(err));
        }
    }, [id]);

    const handleSave = async () => {
        setIsEditing(false);

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData), // Send only the fields to update
            });

            if (!res.ok) {
                throw new Error(`Failed to update customer: ${res.status}`);
            }

            const updatedCustomer = await res.json();
            console.log('Customer updated:', updatedCustomer);

            // Optional: Update local state with latest data
            setCustomerData(updatedCustomer);
            setInitCustomerData(updatedCustomer)

        } catch (err) {
            console.error('Error saving customer:', err);
        }
    };


    const handleCancel = () => {
        setIsEditing(false);
        setCustomerData(initCustomerData);
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case "In Progress":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "Waiting":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case "On Hold":
                return `${baseClasses} bg-orange-100 text-orange-800`;
            case "Payment":
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };

    const getInvoiceStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case "Completed":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "Awaiting Payment":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };


    const handleAddVehicle = (vehicle: Vehicle) => {
        console.log("New vehicle Info");
        console.log(vehicle);
        if (customerData?.vehicles?.find(v => v.id === vehicle.id)) {
            setCustomerData(prev => {
                if (!prev || !prev.vehicles) return prev;

                const updatedVehicles = prev.vehicles.map(v =>
                    v.id === vehicle.id ? vehicle : v
                );

                return {
                    ...prev,
                    vehicles: updatedVehicles
                };
            });
        } else {
            setCustomerData(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    vehicles: [...(prev.vehicles || []), vehicle],
                    vehicleCount: (prev.vehicleCount || 0) + 1
                };
            });
        }
    };

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
            <div className="mt-2 mb-4 md:mb-6">
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
                                            value={customerData.first_name}
                                            onChange={(e) => setCustomerData({
                                                ...customerData,
                                                first_name: e.target.value
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            value={customerData.last_name}
                                            onChange={(e) => setCustomerData({
                                                ...customerData,
                                                last_name: e.target.value
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
                                    <p className="text-gray-900">{customerData.first_name} {customerData.last_name}</p>
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
                                        phone: helpers.formatPhoneNumber(e.target.value)
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
                                <Mail className="size-3 mr-2" />
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

                        <div>
                            <label className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <MapPin className="size-3 mr-2" />
                                Address
                            </label>

                            {isEditing ? (
                                <div className="space-y-2">
                                    <textarea
                                        placeholder="Street Address"
                                        value={customerData.address || ''}
                                        onChange={(e) =>
                                            setCustomerData({ ...customerData, address: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows={2}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={customerData.city || ''}
                                            onChange={(e) =>
                                                setCustomerData({ ...customerData, city: e.target.value })
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                        <select
                                            value={customerData.state || ''}
                                            onChange={(e) =>
                                                setCustomerData({ ...customerData, state: e.target.value })
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="">Select State</option>
                                            {helpers.US_STATES.map((state) => (
                                                <option key={state.abbreviation} value={state.abbreviation}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="ZIP Code"
                                            value={customerData.zipcode || ''}
                                            onChange={(e) =>
                                                setCustomerData({ ...customerData, zipcode: e.target.value })
                                            }
                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-900">
                                    {customerData.address || 'No address provided'}
                                    {customerData.city || customerData.state || customerData.zipcode ? (
                                        <>
                                            {customerData.city ? `, ${customerData.city}` : ''}
                                            {customerData.state ? `, ${customerData.state}` : ''}
                                            {customerData.zipcode ? ` ${customerData.zipcode}` : ''}
                                        </>
                                    ) : null}
                                </p>
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
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(customerData.status)}`}>
                                {customerData.status === "In Progress" ? "Active Job" : customerData.status}
                            </span>
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
                            <VehicleCard key={vehicle.id} vehicle={vehicle} customerId={customerData.id} onUpdate={handleAddVehicle} />
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
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(job.status)}`}>
                                                                {job.status}
                                                            </span>
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
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getInvoiceStatusBadge(invoice.status)}`}>
                                                            {invoice.status}
                                                        </span>
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
                </div>
            </div>

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={showAddVehicle}
                onClose={() => setShowAddVehicle(false)}
                onSubmit={handleAddVehicle}
                customerId={customerData.id}
            />
        </div>
    );
};

export default CustomerDetailsPage;