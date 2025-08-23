'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus,
    Wrench,
    FileText,
    ChevronLeft,
    Trash2
} from 'lucide-react';

import VehicleCard from '@/app/components/customers/VehicleCard';
import AddVehicleModal from '@/app/components/customers/AddVehicleModal';
import CustomerInformation from '@/app/components/customers/CustomerInformation';
import CustomerOverview from '@/app/components/customers/CustomerOverview';
import JobsTable from '@/app/components/customers/JobsTable';
import InvoicesTable from '@/app/components/customers/InvoicesTable';
import { useRouter } from 'next/navigation';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<string>('jobs');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
    const [initCustomerData, setInitCustomerData] = useState<Customer | undefined>();
    const [customerData, setCustomerData] = useState<Customer | undefined>();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [financialSummary, setFinancialSummary] = useState<{
        total_spent: number;
        amount_owed: number;
        total_invoiced: number;
        invoice_count: number;
        job_count: number;
        total_job_costs: number;
    }>({
        total_spent: 0,
        amount_owed: 0,
        total_invoiced: 0,
        invoice_count: 0,
        job_count: 0,
        total_job_costs: 0
    });
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isJobsLoading, setIsJobsLoading] = useState<boolean>(false);
    const [isInvoicesLoading, setIsInvoicesLoading] = useState<boolean>(false);

    // Use financial summary from API instead of calculating from invoices
    const { totalSpent, amountOwed } = useMemo(() => {
        return {
            totalSpent: financialSummary.total_spent,
            amountOwed: financialSummary.amount_owed
        };
    }, [financialSummary]);

    const fetchJobs = useCallback(async () => {
        setIsJobsLoading(true);
        try {
            const res = await fetch(`/api/customers/${id}/jobs`);

            if (res.ok) {
                const jobsData = await res.json();
                setJobs(jobsData);
            } else {
                const errorText = await res.text();
                console.error('Jobs API error:', res.status, errorText);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setIsJobsLoading(false);
        }
    }, [id]);

    const fetchInvoices = useCallback(async () => {
        setIsInvoicesLoading(true);
        try {
            const res = await fetch(`/api/customers/${id}/invoices`);

            if (res.ok) {
                const invoicesData = await res.json();
                setInvoices(invoicesData);
            } else {
                const errorText = await res.text();
                console.error('Invoices API error:', res.status, errorText);
            }
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setIsInvoicesLoading(false);
        }
    }, [id]);

    const fetchFinancialSummary = useCallback(async () => {
        try {
            const res = await fetch(`/api/customers/${id}/financial-summary`);

            if (res.ok) {
                const summaryData = await res.json();
                setFinancialSummary(summaryData);
            } else {
                const errorText = await res.text();
                console.error('Financial summary API error:', res.status, errorText);
            }
        } catch (err) {
            console.error('Error fetching financial summary:', err);
        }
    }, [id]);

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
                })
                .then(() => {
                    fetchJobs();
                    fetchInvoices();
                })
                .catch((err) => console.error(err))
                .finally(() => setIsInitialLoading(false));
        }
    }, [id, fetchJobs, fetchInvoices]);

    useEffect(() => {
        if (customerData?.id) {
            fetchFinancialSummary();
        }
    }, [customerData?.id, fetchFinancialSummary]);

    const handleSave = async () => {
        setIsEditing(false);

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            if (!res.ok) {
                throw new Error(`Failed to update customer: ${res.status}`);
            }

            const updatedCustomer = await res.json();
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

    const handleDelete = async () => {
        const confirmMessage = `Are you sure you want to delete ${customerData?.first_name} ${customerData?.last_name}? This will remove their data from all associated jobs and invoices.\n\n This action cannot be undone.`;
        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/customers/${customerData!.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                // Handle specific status codes
                if (response.status === 404) {
                    throw new Error('Customer not found');
                }
                const errorText = await response.text();
                throw new Error(errorText || `Failed to delete ${customerData?.first_name} ${customerData?.last_name}`);
            }

            // Success - redirect to customers page
            router.push('/customers');

        } catch (error) {
            console.error(`Failed to delete customer:`, error);
            alert(`Failed to delete ${customerData?.first_name} ${customerData?.last_name}. Please try again.`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateVehicle = (vehicle: Vehicle, remove: boolean = false) => {
        if (remove) {
            setCustomerData(prev => {
                if (!prev || !prev.vehicles) return prev;

                const updatedVehicles = prev.vehicles.filter(v => v.id !== vehicle.id);

                return {
                    ...prev,
                    vehicles: updatedVehicles
                };
            });
        } else if (customerData?.vehicles?.find(v => v.id === vehicle.id)) {
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
                };
            });
        }
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
            case "Completed":
                return `${baseClasses} bg-green-100 text-green-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };

    const getInvoiceStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case "paid":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "sent":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "pending":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case "overdue":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "draft":
                return `${baseClasses} bg-gray-100 text-gray-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-600`;
        }
    };

    if (!customerData && !isInitialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h1>
                    <p className="text-gray-600">The customer with ID &quot;{id}&quot; could not be found.</p>
                </div>
            </div>
        );
    } else if (isInitialLoading || isDeleting) {
        return (
            <div className="w-full h-3/4 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
                    <Image
                        src="/gear.png"
                        alt="Dirt&apos;s Garage Logo"
                        width={500}
                        height={500}
                        className="size-20 mb-4 slow-spin"
                        priority
                    />
                    <div className="text-lg text-gray-700 font-medium text-center">
                        {isDeleting ? "Deleting customer and attached data" : "Loading customer data..."}
                    </div>

                    {/* Progress dots */}
                    <div className="flex space-x-1 mt-4">
                        <div className="size-2 bg-orange-500 rounded-full animate-bounce"></div>
                        <div className="size-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="size-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        )
    }
    else if (customerData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mt-2 mb-4 md:mb-6">
                    <div className="flex flex-row justify-between">
                        <div className="flex">
                            <Link className="flex items-center md:items-baseline md:p-1" href="/customers">
                                <ChevronLeft className="size-4 font-bold text-black md:size-6 lg:size-8 hover:text-gray-800 hover:scale-110" />
                            </Link>
                            <div className='ml-5'>
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Customer Details</h1>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">Manage customer information and history</p>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg sm:border sm:border-red-300 hover:bg-red-50"
                            >
                                <Trash2 className="size-5 sm:size-4" />
                                <span className='hidden sm:inline'>Delete Customer</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer Information and Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomerInformation
                        customerData={customerData}
                        setCustomerData={setCustomerData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />

                    <CustomerOverview
                        customerData={customerData}
                        jobs={jobs}
                        totalSpent={totalSpent}
                        amountOwed={amountOwed}
                        getStatusBadge={getStatusBadge}
                    />
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
                                <VehicleCard key={vehicle.id} vehicle={vehicle} customer_id={customerData.id} onUpdate={handleUpdateVehicle} />
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
                            <JobsTable
                                jobs={jobs}
                                customerData={customerData}
                                isJobsLoading={isJobsLoading}
                                getStatusBadge={getStatusBadge}
                            />
                        )}

                        {activeTab === 'invoices' && (
                            <InvoicesTable
                                invoices={invoices}
                                customerData={customerData}
                                isInvoicesLoading={isInvoicesLoading}
                                getInvoiceStatusBadge={getInvoiceStatusBadge}
                            />
                        )}
                    </div>
                </div>

                {/* Add Vehicle Modal */}
                <AddVehicleModal
                    isOpen={showAddVehicle}
                    onClose={() => setShowAddVehicle(false)}
                    onSubmit={handleUpdateVehicle}
                    customer_id={customerData.id}
                />
            </div>
        );
    }
};

export default CustomerDetailsPage;