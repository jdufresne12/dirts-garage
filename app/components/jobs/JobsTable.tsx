'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface JobsTableProps {
    jobs: Job[];
    customers: Customer[];
    vehicles: Vehicle[];
    activeTab: string;
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({
    jobs,
    customers,
    vehicles,
    activeTab,
    searchTerm,
    currentPage,
    itemsPerPage,
    setCurrentPage,
}) => {
    const router = useRouter();

    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
    const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString() : 'TBD';

    const getCustomerName = (customerId: string | null): string => {
        if (!customerId) return 'Unknown Customer';
        const customer = customers.find(c => c.id === customerId);
        return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
    };

    const getVehicleInfo = (vehicleId: string | null): string => {
        if (!vehicleId) return 'Unknown Vehicle';
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    };

    const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
        const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return `px-2 py-1 rounded text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`;
    };

    const getStatusBadge = (status: Status) => `px-2 py-1 rounded text-xs font-medium ${status.color}`;

    const filteredJobs = jobs.filter(job => {
        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'active' && job.status.type === 'Active') ||
            (activeTab === 'waiting' && job.status.type === 'Waiting') ||
            (activeTab === 'completed' && job.status.type === 'Completed') ||
            (activeTab === 'onHold' && job.status.type === 'On Hold');

        const customerName = getCustomerName(job.customerId).toLowerCase();
        const vehicleInfo = getVehicleInfo(job.vehicleId).toLowerCase();
        const title = job.title.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            searchTerm === '' ||
            customerName.includes(searchLower) ||
            vehicleInfo.includes(searchLower) ||
            title.includes(searchLower) ||
            job.id.toString().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                            {activeTab === 'waiting' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Start</th>
                            )}
                            {activeTab === 'completed' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
                            )}
                            {activeTab !== 'completed' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Completion</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50" onClick={() => router.push(`/jobs/${job.id}`)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{getCustomerName(job.customerId)}</div>
                                        <div className="text-sm text-gray-500">{getVehicleInfo(job.vehicleId)}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{job.title}</div>
                                    {job.notes && <div className="text-xs text-gray-500 mt-1">{job.notes}</div>}
                                </td>
                                {activeTab === 'waiting' && (
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">
                                            {job.estimatedStartDate || 'Unknown'}
                                        </span>
                                    </td>
                                )}
                                {activeTab === 'completed' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(job.endDate || job.estimatedCompletion)}
                                    </td>
                                )}
                                {activeTab !== 'completed' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(job.estimatedCompletion)}
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {activeTab === 'completed'
                                            ? formatCurrency(job.actualCost)
                                            : `${formatCurrency(job.actualCost)} / ${formatCurrency(job.estimatedCost)}`
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getPriorityBadge(job.priority)}>{job.priority}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getStatusBadge(job.status)}>{job.status.type}</span>
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
            {filteredJobs.length > itemsPerPage && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
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
                                <span className="font-medium">
                                    {Math.min(endIndex, filteredJobs.length)}
                                </span>
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
                                    // Show first page, last page, current page, and pages around current page
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
        </div>
    );
};

export default JobsTable;
