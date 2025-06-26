import React from 'react';
import Link from 'next/link';

// Mock data - replace with your actual data source
const customers = [
    {
        id: 1,
        name: "Mike Johnson",
        phone: "(555) 123-4567",
        email: "mike.johnson@email.com",
        totalSpent: 15840,
        jobCount: 8,
        customerSince: 2019,
        status: "VIP",
        vehicles: [
            {
                year: 2018,
                make: "Chevrolet",
                model: "Camaro SS",
                vin: "1G1FE1R7XJ0123456",
                mileage: "45,200",
                color: "Summit White"
            },
            {
                year: 1969,
                make: "Chevrolet",
                model: "Chevelle",
                vin: "136379L123456",
                mileage: "Restored",
                color: "Rally Green"
            },
            {
                year: 1969,
                make: "Chevrolet",
                model: "Chevelle",
                vin: "136379L123456",
                mileage: "Restored",
                color: "Rally Green"
            },
            {
                year: 1969,
                make: "Chevrolet",
                model: "Chevelle",
                vin: "136379L123456",
                mileage: "Restored",
                color: "Rally Green"
            }
        ],
        activeJob: {
            description: "LS3 Engine Rebuild - Camaro SS",
            started: "6/20/2025"
        }
    },
    {
        id: 2,
        name: "Sarah Davis",
        phone: "(555) 987-6543",
        email: "sarah.davis@email.com",
        totalSpent: 8420,
        jobCount: 3,
        customerSince: 2021,
        status: "Standard",
        vehicles: [
            {
                year: 1969,
                make: "Ford",
                model: "Mustang Boss 429",
                vin: "9F02R123456",
                mileage: "12,400",
                color: "Grabber Blue"
            }
        ],
        completedJob: {
            description: "Transmission Rebuild - Boss 429",
            completed: "6/18/2025"
        }
    },
    {
        id: 3,
        name: "Tom Wilson",
        phone: "(555) 456-7890",
        email: "tom.wilson@email.com",
        totalSpent: 24650,
        jobCount: 12,
        customerSince: 2018,
        status: "Urgent",
        vehicles: [
            {
                year: 1970,
                make: "Plymouth",
                model: "Cuda 440",
                vin: "BS23N0B123456",
                mileage: "38,500",
                color: "In Violet"
            }
        ],
        activeJob: {
            description: "Complete Restoration - Plymouth Cuda",
            started: "5/15/2025"
        }
    }
];

const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
        case "VIP":
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Urgent":
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

const getJobStatusBadge = (type: "active" | "completed") => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium inline-block";
    if (type === "active") {
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    return `${baseClasses} bg-green-100 text-green-800`;
};

export default function CustomersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex items-center text-blue-600 mr-4">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                <h1 className="text-xl font-semibold">Customer Management</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search customers, vehicles, or phone numbers"
                                    className="w-80 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>All Customers</option>
                                <option>VIP Customers</option>
                                <option>Standard Customers</option>
                                <option>Urgent</option>
                            </select>

                            <Link
                                href="/customers/new-customer"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                + Add Customer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {customers.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                {/* Customer Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
                                            <span className={getStatusBadge(customer.status)}>{customer.status}</span>
                                        </div>
                                        <div className="mt-1 space-y-1">
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                                {customer.phone}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                                {customer.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right text-sm text-gray-600">
                                        <div>Total Spent: <span className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</span></div>
                                        <div>Jobs: <span className="font-semibold text-gray-900">{customer.jobCount}</span></div>
                                        <div>Since: <span className="font-semibold text-gray-900">{customer.customerSince}</span></div>
                                    </div>
                                </div>

                                {/* Vehicles */}
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    {customer.vehicles.map((vehicle, index) => (
                                        <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
                                            <h3 className="font-medium text-gray-900">
                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                            </h3>
                                            <div className="mt-1 text-sm text-gray-600 space-y-1">
                                                <div>VIN: {vehicle.vin}</div>
                                                <div>Mileage: {vehicle.mileage}</div>
                                                <div>Color: {vehicle.color}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Active/Completed Jobs */}
                                {customer.activeJob && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={getJobStatusBadge("active")}>Active</span>
                                                <span className="text-gray-900 font-medium">{customer.activeJob.description}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">Started: {customer.activeJob.started}</span>
                                        </div>
                                    </div>
                                )}

                                {customer.completedJob && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={getJobStatusBadge("completed")}>Completed</span>
                                                <span className="text-gray-900 font-medium">{customer.completedJob.description}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">Completed: {customer.completedJob.completed}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <Link
                                        href={`/customers/${customer.id}`}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium transition-colors"
                                    >
                                        View Details
                                    </Link>
                                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium transition-colors">
                                        Start New Job
                                    </button>
                                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium transition-colors">
                                        View History
                                    </button>
                                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium transition-colors">
                                        Contact
                                    </button>
                                    {customer.completedJob && (
                                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors">
                                            Generate Invoice
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}