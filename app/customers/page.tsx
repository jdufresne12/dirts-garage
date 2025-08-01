'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, Search, Plus, Users } from 'lucide-react';

import AddCustomerModal from '../components/customers/AddCustomerModal';
import customerHelpers from '../utils/customerHelpers';
import mockData from '../data/mock-data';
import helpers from '../utils/helpers';

const allCustomers = mockData.customers;

export default function CustomersPage() {
    const useMockData = false;
    const [initCustomers, setInitCustomers] = useState<Customer[]>(useMockData ? allCustomers : []);
    const [customers, setCustomers] = useState<Customer[]>(useMockData ? allCustomers : []);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!useMockData);

    useEffect(() => {
        if (!useMockData) {
            fetch('/api/customers')
                .then(res => res.json())
                .then(data => {
                    setInitCustomers(data);
                    setCustomers(data);
                })
                .catch(error => {
                    console.error('Error fetching customers:', error);
                    // Handle error appropriately
                })
                .finally(() => {
                    setIsInitialLoading(false);
                });
        }
    }, [useMockData]);

    useEffect(() => {
        if (searchTerm === "") {
            setCustomers(initCustomers)
        } else {
            const term = searchTerm.toLowerCase();

            // Will need to call an API with real data
            const filteredCustomers: Customer[] = (customers).filter((customer: Customer) => {
                return customer.first_name.toLowerCase().includes(term) ||
                    customer.last_name.toLowerCase().includes(term) ||
                    customer.email.toLowerCase().includes(term)
            });
            setCustomers(filteredCustomers);
        }
    }, [searchTerm, initCustomers])

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
        setSearchTerm("");
        setCustomers([...customers, newCustomer])
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6">
                {/* Action Buttons */}
                <div className="flex flex-row w-full items-center my-4 gap-5 ">
                    <div className="flex w-full sm:w-7/12 items-center relative border border-gray-300 rounded-lg hover:border-orange-400 focus-within:border-orange-400">
                        <div>
                            <Search className="size-4 mx-2 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full py-1.5 focus:ring-0 focus:outline-none"
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
                {isInitialLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
                            <Image
                                src="/gear.png"
                                alt="Dirt's Garage Logo"
                                width={500}
                                height={500}
                                className="size-20 mb-4 slow-spin"
                                priority
                            />
                            <div className="text-lg text-gray-700 font-medium text-center">
                                Loading customers...
                            </div>

                            {/* Progress dots */}
                            <div className="flex space-x-1 mt-4">
                                <div className="size-2 bg-orange-500 rounded-full animate-bounce"></div>
                                <div className="size-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="size-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
                                            <h3 className="font-semibold text-gray-900 truncate">{customer.first_name} {customer.last_name}</h3>
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
                                            <div className="text-sm font-medium text-gray-900">{getCurrentJob(customer) || "No Active Jobs"}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-sm text-gray-400">No active projects</div>
                                        </div>
                                    )}
                                </Link>
                            )) : (
                                <div className="col-span-full flex flex-col items-center justify-center min-h-[30vh]">
                                    <div className="bg-gray-50 rounded-full p-6 mb-4">
                                        <Users className="size-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No customers to show</h3>
                                </div>
                            )
                        }
                    </div>
                )}

            </div>

            <AddCustomerModal
                isOpen={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onSubmit={handleAddCustomer}
            />
        </div>
    );
}