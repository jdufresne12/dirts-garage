import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface JobsTableProps {
    jobs: Job[];
    customerData: Customer;
    isJobsLoading: boolean;
    getStatusBadge: (status: string) => string;
}

const JobsTable: React.FC<JobsTableProps> = ({
    jobs,
    customerData,
    isJobsLoading,
    getStatusBadge
}) => {
    return (
        <div>
            <Link
                href={`/jobs/new-job?customer_id=${customerData.id}`}
                className="flex w-fit items-center mb-4 p-1 text-center text-sm font-medium transition-colors whitespace-nowrap
                text-orange-400 rounded-lg hover:border-orange-400 hover:border-1"
            >
                <Plus className="size-3 mr-1 text-orange-400 md:size-4" /> New Job
            </Link>

            {isJobsLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            ) : jobs && jobs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Cost</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {jobs.map(job => {
                                const vehicle = customerData.vehicles?.find(v => v.id === job.vehicle_id);
                                return (
                                    <tr
                                        key={job.id}
                                        onClick={() => window.location.href = `/jobs/${job.id}`}
                                        className="hover:bg-gray-50"
                                    >
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
                                            {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Not started'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${(job.estimated_cost || 0).toLocaleString()}
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
    );
};

export default JobsTable;