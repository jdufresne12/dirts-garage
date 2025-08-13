import React from 'react';

interface CustomerOverviewProps {
    customerData: Customer;
    jobs: Job[];
    totalSpent: number;
    amountOwed: number;
    getStatusBadge: (status: string) => string;
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({
    customerData,
    jobs,
    totalSpent,
    amountOwed,
    getStatusBadge
}) => {
    const getStatus = (): string => {
        if (jobs.find(job => job.status === "In Progress" || job.status === "On Hold"))
            return "In Progress";
        else if (jobs.find(job => job.status === "Payment"))
            return "Payment";
        else if (jobs.find(job => job.status === "Waiting"))
            return "Waiting";
        else return "None";
    }

    return (
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Overview</h3>

            <div className="space-y-8">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(getStatus())}`}>
                        {getStatus()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Total Vehicles</label>
                        <p className="text-2xl font-bold text-gray-900">{customerData.vehicles?.length || 0}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Total Jobs</label>
                        <p className="text-2xl font-bold text-gray-900">{jobs?.length || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Total Spent</label>
                        <p className="text-xl font-bold text-green-600">
                            ${totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Amount Owed</label>
                        <p className={`text-xl font-bold ${amountOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${amountOwed.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOverview;