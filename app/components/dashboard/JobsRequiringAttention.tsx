import React from 'react';
import { AlertTriangle, Search, CheckCircle } from 'lucide-react';

export default function JobsRequiringAttention() {
    const jobs = [
        {
            id: 1,
            icon: AlertTriangle,
            iconColor: 'text-yellow-500',
            customer: 'Alex Martinez',
            vehicle: '1970 Chevelle',
            issue: 'Parts delayed - Customer needs update',
            action: 'Contact Customer',
            actionColor: 'bg-orange-500 hover:bg-orange-600'
        },
        {
            id: 2,
            icon: Search,
            iconColor: 'text-blue-500',
            customer: 'Jennifer Lee',
            vehicle: '2019 Corvette',
            issue: 'Diagnostic complete - Awaiting approval',
            action: 'Send Estimate',
            actionColor: 'bg-orange-500 hover:bg-orange-600'
        },
        {
            id: 3,
            icon: CheckCircle,
            iconColor: 'text-green-500',
            customer: 'Robert Garcia',
            vehicle: '2017 Tacoma',
            issue: 'Work complete - Ready for pickup',
            action: 'Generate Invoice',
            actionColor: 'bg-orange-500 hover:bg-orange-600'
        }
    ];

    return (
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Jobs Requiring Attention</h3>
                <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors self-start sm:self-auto">
                    Manage All
                </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <job.icon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 sm:mt-1 flex-shrink-0 ${job.iconColor}`} />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                    <span className="sm:hidden">{job.customer}</span>
                                    <span className="hidden sm:inline">{job.customer} - {job.vehicle}</span>
                                </div>
                                <div className="text-xs sm:hidden text-gray-600 mt-0.5 truncate">
                                    {job.vehicle}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1">
                                    {job.issue}
                                </div>
                            </div>
                        </div>
                        <button className={`px-3 py-2 text-xs sm:text-sm text-white rounded-lg ${job.actionColor} transition-colors whitespace-nowrap self-start sm:self-auto`}>
                            {job.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}