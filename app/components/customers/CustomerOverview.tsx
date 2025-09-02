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
    };

    return (
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 ">
            {/* Header */}
            <div className="flex flex-col items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                    Customer Overview
                </h3>
                <span
                    className={`mt-2 px-3 py-2 text-sm rounded ${getStatusBadge(getStatus())}`}
                >
                    {getStatus()}
                </span>
            </div>

            {/* Main Grid Section */}
            <div className="flex flex-col justify-center flex-grow space-y-6">
                {/* First Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                        <p className="text-gray-500 text-sm">Vehicles</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">
                            {customerData.vehicles?.length || 0}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                        <p className="text-gray-500 text-sm">Jobs</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">
                            {jobs?.length || 0}
                        </p>
                    </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4 shadow-sm flex flex-col items-center">
                        <p className="text-gray-600 text-sm">Spent</p>
                        <p className="text-xl font-bold text-green-600 mt-1">
                            ${totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div
                        className={`rounded-lg p-4 shadow-sm flex flex-col items-center ${amountOwed > 0 ? 'bg-red-50' : 'bg-green-50'
                            }`}
                    >
                        <p className="text-gray-600 text-sm">Owed</p>
                        <p
                            className={`text-xl font-bold mt-1 ${amountOwed > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                        >
                            ${amountOwed.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOverview;
