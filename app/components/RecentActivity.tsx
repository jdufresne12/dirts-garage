import React from 'react';

export default function RecentActivity() {
    const activities = [

        {
            id: 1,
            customer: 'Mike Johnson',
            vehicle: '2018 Camaro SS',
            work: 'Engine rebuild',
            status: 'Active',
            statusColor: 'bg-blue-100 text-blue-800',
            time: 'Started today'
        },
        {
            id: 2,
            customer: 'Sarah Davis',
            vehicle: '1969 Mustang',
            work: 'Transmission work',
            status: 'Completed',
            statusColor: 'bg-green-100 text-green-800',
            time: 'Completed'
        },
        {
            id: 3,
            customer: 'Tom Wilson',
            vehicle: '2020 Silverado',
            work: 'Waiting for parts approval',
            status: 'Pending',
            statusColor: 'bg-red-100 text-red-800',
            time: ''
        },
        {
            id: 4,
            customer: 'Lisa Brown',
            vehicle: '2015 F-150',
            work: 'Brake system overhaul',
            status: 'Active',
            statusColor: 'bg-yellow-100 text-yellow-800',
            time: ''
        }
    ];

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {activities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">
                                {activity.customer} - {activity.vehicle}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {activity.work} {activity.time && `- ${activity.time}`}
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.statusColor}`}>
                            {activity.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};