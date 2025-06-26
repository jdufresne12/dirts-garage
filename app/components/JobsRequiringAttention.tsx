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
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Jobs Requiring Attention</h3>
                <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Manage All
                </button>
            </div>

            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <job.icon className={`h-5 w-5 mt-1 ${job.iconColor}`} />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {job.customer} - {job.vehicle}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {job.issue}
                                </div>
                            </div>
                        </div>
                        <button className={`px-4 py-2 text-sm text-white rounded-lg ${job.actionColor} transition-colors`}>
                            {job.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
