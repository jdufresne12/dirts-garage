'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, Search, Plus, Users } from 'lucide-react';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import customerHelpers from '../utils/customerHelpers';

import mockData from '../data/mock-data';
import helpers from '../utils/helpers';

const allCustomers = mockData.customers;

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(mockData.customers);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        if (searchTerm === "") {
            setCustomers(allCustomers)
        } else {
            const term = searchTerm.toLowerCase();

            // Will need to call an API with real data
            const filteredCustomers: Customer[] = allCustomers.filter((customer: Customer) => {
                return customer.firstName.toLowerCase().includes(term) ||
                    customer.lastName.toLowerCase().includes(term) ||
                    customer.email.toLowerCase().includes(term)
            });
            setCustomers(filteredCustomers);
        }
    }, [searchTerm])

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
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

    const getStatusText = (status: string) => {
        switch (status) {
            case "In Progress":
                return "Active Job";
            case "Waiting":
                return "Waiting";
            case "On Hold":
                return "On Hold";
            case "Payment":
                return "Awaiting Payment"
            default:
                return "No Active Jobs";
        }
    };

    const getCurrentJob = (customer: Customer) => {
        if (customer.jobs && customer.jobs.length > 0) {
            const activeJob = customer.jobs.find((job: Job) =>
                job.status != 'Waiting' &&
                job.status != 'Completed' &&
                job.status != 'none'
            )
            return activeJob ? activeJob.title : "No Active Jobs";
        }
    }

    const handleAddCustomer = (customer: Customer) => {
        const newCustomer = customerHelpers.newCustomer(customer);
        console.log("New Customer Info");
        console.log(newCustomer);
        setSearchTerm("");
        setCustomers([...allCustomers, newCustomer])
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="mt-5 text-2xl font-bold text-gray-900 md:mt-0 md:pb-4 lg:text-3xl">Customers</h1>

                {/* Action Buttons */}
                <div className="flex flex-row w-full items-center my-4 gap-5 hover">
                    <div className="flex items-center relative border border-gray-300 rounded-lg hover:border-orange-400 focus-within:border-orange-400">
                        <div>
                            <Search className="size-4 mx-2 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-50 py-1.5 md:w-75 focus:ring-0 focus:outline-none"
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                        />
                    </div>


                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="flex p-2 text-sm text-center font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 
                            transition-colors border border-orange-400 whitespace-nowrap lg:shadow-none"
                    >
                        <Plus className="size-5 text-white md:mr-1" />
                        <span className='hidden md:inline'>Add Customer</span>
                    </button>
                </div>

                {/* Customer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {customers.length > 0
                        ? customers.map((customer) => (
                            <Link
                                key={customer.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                href={`/customers/${customer.id}`}
                            >
                                {/* Header with name and status */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{customer.firstName} {customer.lastName}</h3>
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
                                {!helpers.checkNoActiveJobs(customer) ? (
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Current Project</div>
                                        <div className="text-sm font-medium text-gray-900">{getCurrentJob(customer)}</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-sm text-gray-400">No active projects</div>
                                    </div>
                                )}
                            </Link>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="bg-gray-50 rounded-full p-6 mb-4">
                                    <Users className="size-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-400 mb-2">No customers to show</h3>
                            </div>
                        )
                    }
                </div>
            </div>

            <AddCustomerModal
                isOpen={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onSubmit={handleAddCustomer}
            />
        </div>
    );
}