'use client'
import React, { useState } from 'react';
import {
    User,
    Phone,
    MapPin,
    Edit3,
    Save,
    X,
    Plus,
    Car,
    Wrench,
    DollarSign,
    Calendar,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const CustomerDetailsPage = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [isEditing, setIsEditing] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    // Mock customer data
    const [customerData, setCustomerData] = useState({
        id: 1,
        name: "Mike Johnson",
        phone: "(555) 123-4567",
        email: "mike.johnson@email.com",
        address: "123 Main St, Springfield, IL 62701",
        totalSpent: 15840,
        jobCount: 8,
        customerSince: "2019",
        status: "VIP",
        balanceDue: 1250.00,
        activeJobs: 2
    });

    const vehicles = [
        {
            id: 1,
            year: 2018,
            make: "Chevrolet",
            model: "Camaro SS",
            vin: "1G1FE1R7XJ0123456",
            mileage: "45,200",
            color: "Summit White",
            licensePlate: "ABC-123"
        },
        {
            id: 2,
            year: 1969,
            make: "Chevrolet",
            model: "Chevelle",
            vin: "136379L123456",
            mileage: "Restored",
            color: "Rally Green",
            licensePlate: "CLASSIC1"
        }
    ];

    const jobs = [
        {
            id: 1,
            vehicleId: 1,
            vehicle: "2018 Camaro SS",
            description: "LS3 Engine Rebuild",
            status: "In Progress",
            startDate: "2025-06-20",
            estimatedCompletion: "2025-07-15",
            estimatedCost: 4500,
            actualCost: 3200,
            statusColor: "bg-blue-100 text-blue-800"
        },
        {
            id: 2,
            vehicleId: 1,
            vehicle: "2018 Camaro SS",
            description: "Transmission Service",
            status: "Completed",
            startDate: "2025-05-10",
            completedDate: "2025-05-15",
            estimatedCost: 850,
            actualCost: 825,
            statusColor: "bg-green-100 text-green-800"
        },
        {
            id: 3,
            vehicleId: 2,
            vehicle: "1969 Chevelle",
            description: "Carburetor Rebuild",
            status: "Pending Parts",
            startDate: "2025-06-25",
            estimatedCompletion: "2025-07-10",
            estimatedCost: 1200,
            actualCost: 0,
            statusColor: "bg-yellow-100 text-yellow-800"
        }
    ];

    const invoices = [
        {
            id: "INV-001",
            jobId: 2,
            description: "Transmission Service - 2018 Camaro SS",
            amount: 825,
            date: "2025-05-15",
            dueDate: "2025-06-15",
            status: "Paid",
            statusColor: "bg-green-100 text-green-800"
        },
        {
            id: "INV-002",
            jobId: 1,
            description: "LS3 Engine Rebuild - Progress Payment",
            amount: 1250,
            date: "2025-06-25",
            dueDate: "2025-07-25",
            status: "Overdue",
            statusColor: "bg-red-100 text-red-800"
        }
    ];

    const handleSave = () => {
        setIsEditing(false);
        // Here you would save the data to your backend
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Here you would reset the form data
    };

    const getStatusBadge = (status: any, colorClass: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {status}
        </span>
    );

    const VehicleCard = ({ vehicle }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                    <Car className="w-5 h-5 text-orange-500 mr-2" />
                    <h4 className="font-semibold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <Edit3 className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div><span className="font-medium">VIN:</span> {vehicle.vin}</div>
                <div><span className="font-medium">Mileage:</span> {vehicle.mileage}</div>
                <div><span className="font-medium">Color:</span> {vehicle.color}</div>
                <div><span className="font-medium">License:</span> {vehicle.licensePlate}</div>
            </div>
        </div>
    );

    const AddVehicleModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New Vehicle</h3>
                    <button onClick={() => setShowAddVehicle(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Year" className="border rounded px-3 py-2" />
                        <input placeholder="Make" className="border rounded px-3 py-2" />
                    </div>
                    <input placeholder="Model" className="w-full border rounded px-3 py-2" />
                    <input placeholder="VIN" className="w-full border rounded px-3 py-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Mileage" className="border rounded px-3 py-2" />
                        <input placeholder="Color" className="border rounded px-3 py-2" />
                    </div>
                    <input placeholder="License Plate" className="w-full border rounded px-3 py-2" />
                    <div className="flex gap-3 pt-4">
                        <button
                            className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                        >
                            Add Vehicle
                        </button>
                        <button
                            onClick={() => setShowAddVehicle(false)}
                            className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
                        <p className="text-gray-600 mt-1">Manage customer information and history</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                            + New Job
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Create Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 mr-2" />
                                Name
                            </label>
                            {isEditing ? (
                                <input
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 mr-2" />
                                Phone
                            </label>
                            {isEditing ? (
                                <input
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 mr-2" />
                                Address
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={customerData.address}
                                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={2}
                                />
                            ) : (
                                <p className="text-gray-900">{customerData.address}</p>
                            )}
                        </div>
                    </div>

                    {/* Status & Stats */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                {customerData.status}
                            </span>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Customer Since</label>
                            <p className="text-gray-900">{customerData.customerSince}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Total Jobs</label>
                            <p className="text-gray-900">{customerData.jobCount}</p>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="flex items-center">
                                <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Active Jobs</p>
                                    <p className="text-lg font-bold text-blue-900">{customerData.activeJobs}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                            <div className="flex items-center">
                                <DollarSign className="w-5 h-5 text-red-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Balance Due</p>
                                    <p className="text-lg font-bold text-red-900">${customerData.balanceDue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Total Spent</p>
                                    <p className="text-lg font-bold text-green-900">${customerData.totalSpent.toLocaleString()}</p>
                                </div>
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
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'jobs', label: 'Jobs', icon: Wrench },
                            { id: 'invoices', label: 'Invoices', icon: FileText },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {jobs.map(job => (
                                            <tr key={job.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {job.vehicle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {job.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(job.status, job.statusColor)}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {invoice.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {invoice.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${invoice.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {invoice.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(invoice.status, invoice.statusColor)}
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
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Average Job Value</p>
                                        <p className="text-2xl font-bold text-blue-900">${(customerData.totalSpent / customerData.jobCount).toFixed(0)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Completion Rate</p>
                                        <p className="text-2xl font-bold text-green-900">92%</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Avg. Days to Complete</p>
                                        <p className="text-2xl font-bold text-orange-900">12</p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {showAddVehicle && <AddVehicleModal />}
        </div>
    );
};

export default CustomerDetailsPage;