'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface JobsTableProps {
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({ searchTerm, currentPage, itemsPerPage, setCurrentPage }) => {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        fetch('/api/jobs')
            .then(res => res.json())
            .then((jobData: Job[]) => setJobs(jobData))
            .catch(error => console.error("Error fetching jobs:", error))
            .finally(() => setInitialLoading(false))
    }, [])

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const formatCurrency = (amount: number) => `$${amount ? amount.toLocaleString() : 0}`;
    const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString() : 'TBD';

    const getCustomerName = (customer: Customer | null): string => {
        if (!customer) return 'N/A';
        return `${customer.first_name} ${customer.last_name}`;
    };

    const getVehicleInfo = (vehicle: Vehicle | null): string => {
        if (!vehicle) return 'N/A';
        return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    };

    const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
        const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return `px-2 py-1 rounded text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'} `;
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

    const tabs = [
        { label: 'All', value: 'all' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Waiting', value: 'Waiting' },
        { label: 'Completed', value: 'Completed' },
        { label: 'On Hold', value: 'On Hold' },
    ];

    const getTabCount = (tabValue: string) => {
        if (tabValue === 'all') return jobs.length;
        return jobs.length > 0 ? jobs.filter((j) => j.status.toLowerCase() === tabValue.toLowerCase()).length : 0;
    };

    const getCurrentTabLabel = () => {
        const currentTab = tabs.find(tab => tab.value === activeTab);
        return `${currentTab?.label} (${getTabCount(activeTab)})`;
    };

    const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'In Progress' && job.status === 'In Progress') ||
            (activeTab === 'Waiting' && job.status === 'Waiting') ||
            (activeTab === 'Completed' && job.status === 'Completed') ||
            (activeTab === 'On Hold' && job.status === 'On Hold');

        const customerName = getCustomerName(job.customer || null).toLowerCase();
        const vehicleInfo = getVehicleInfo(job.vehicle || null).toLowerCase();
        const title = job.title.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            searchTerm === '' ||
            customerName.includes(searchLower) ||
            vehicleInfo.includes(searchLower) ||
            title.includes(searchLower) ||
            job.id.toString().includes(searchLower);

        return matchesTab && matchesSearch;
    }) : [];

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Desktop Tabs */}
            <div className="hidden md:block border-b border-gray-200">
                <nav className="-mb-px flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-6 py-3 border-b-2 font-medium text-xs md:text-sm ${activeTab === tab.value
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label} ({getTabCount(tab.value)})
                        </button>
                    ))}
                </nav>
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden border-b border-gray-200">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-white border-0 border-b border-gray-200 flex items-center justify-between"
                    >
                        <span>{getCurrentTabLabel()}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => {
                                        setActiveTab(tab.value);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${activeTab === tab.value
                                        ? 'bg-orange-50 text-orange-600 font-medium'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {tab.label} ({getTabCount(tab.value)})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {initialLoading ? (
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
                            Loading Jobs...
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
                <>
                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-b-gray-200">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    {/* Hide additional columns on mobile */}
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {activeTab === 'Waiting' && 'Est. Start'}
                                        {activeTab === 'Completed' && 'Completed Date'}
                                        {activeTab !== 'Completed' && activeTab !== 'Waiting' && 'Est. Completion'}
                                    </th>
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50" onClick={() => router.push(`/jobs/${job.id}`)}>
                                        <td className="px-3 md:px-6 py-4">
                                            {job.customer_id ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{getCustomerName(job.customer || null)}</div>
                                                    {job.vehicle_id && (
                                                        <div className="text-xs text-gray-500 mt-1">{getVehicleInfo(job.vehicle || null)}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <div className="text-sm text-gray-900">{job.title}</div>
                                            {job.latest_update && (
                                                <div className="hidden md:block text-xs text-gray-500 mt-1">{job.latest_update}</div>
                                            )}
                                        </td>
                                        <td className="px-3 md:px-6 py-4 text-left whitespace-nowrap">
                                            <span className={getStatusBadge(job.status)}>{job.status}</span>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                            <span className={getPriorityBadge(job.priority)}>{job.priority}</span>
                                        </td>
                                        {/* Hide additional columns on mobile */}
                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {activeTab === 'Waiting' && (job.estimated_start_date || 'Unknown')}
                                            {activeTab === 'Completed' && formatDate(job.completion_date || job.estimated_completion)}
                                            {activeTab !== 'Completed' && activeTab !== 'Waiting' && formatDate(job.estimated_completion)}
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {activeTab === 'Completed'
                                                    ? formatCurrency(job.actual_cost)
                                                    : `${formatCurrency(job.actual_cost)} / ${formatCurrency(job.estimated_cost)}`
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredJobs.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No jobs found matching your criteria.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {jobs && filteredJobs.length > itemsPerPage && (
                        <div className="px-3 md:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">{startIndex + 1}</span>
                                        {' '}to{' '}
                                        <span className="font-medium">{Math.min(endIndex, filteredJobs.length)}</span>
                                        {' '}of{' '}
                                        <span className="font-medium">{filteredJobs.length}</span>
                                        {' '}results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Page numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JobsTable;