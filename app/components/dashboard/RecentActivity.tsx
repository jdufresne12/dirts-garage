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
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                    View All
                </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {activities.map(activity => (
                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base text-gray-900">
                                <span className="sm:hidden truncate block">{activity.customer}</span>
                                <span className="hidden sm:inline">{activity.customer} - {activity.vehicle}</span>
                            </div>
                            <div className="text-xs sm:hidden text-gray-600 mt-0.5 truncate">
                                {activity.vehicle}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                {activity.work} {activity.time && `- ${activity.time}`}
                            </div>
                        </div>
                        <span className={`px-2 py-1 sm:px-3 rounded-full text-xs font-medium ${activity.statusColor} self-start sm:self-auto whitespace-nowrap`}>
                            {activity.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}