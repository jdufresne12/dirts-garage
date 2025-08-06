'use client';
import React, { useState, useEffect } from 'react';
import helpers from '@/app/utils/helpers';

interface Activity {
    id: string;
    title: string;
    status: string;
    customer: string;
    vehicle: string;
    timestamp: string;
    type: string;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        try {
            const response = await fetch('/api/dashboard/recent-activity');
            if (!response.ok) {
                throw new Error('Failed to fetch recent activity');
            }
            const data = await response.json();
            setActivities(data);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const baseClasses = "px-2 py-1 sm:px-3 rounded-full text-xs font-medium";
        switch (status.toLowerCase()) {
            case 'completed':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'in progress':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'waiting':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'on hold':
                return `${baseClasses} bg-orange-100 text-orange-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getActivityDescription = (activity: Activity) => {
        switch (activity.type) {
            case 'completed':
                return `Completed: ${activity.title}`;
            case 'started':
                return `Started work on: ${activity.title}`;
            case 'in_progress':
                return `Updated: ${activity.title}`;
            case 'created':
                return `New job: ${activity.title}`;
            default:
                return activity.title;
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return helpers.displayDateAndTimeShort(timestamp);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                    {/* <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                        View All
                    </button> */}
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3 border-b border-gray-100 last:border-b-0 animate-pulse">
                            <div className="flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                {/* <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors self-start sm:self-auto">
                    View All
                </button> */}
            </div>

            <div className="space-y-3 sm:space-y-4">
                {activities.length > 0 ? (
                    activities.map(activity => (
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
                                    {getActivityDescription(activity)} - {formatTimeAgo(activity.timestamp)}
                                </div>
                            </div>
                            <span className={`${getStatusColor(activity.status)} self-start sm:self-auto whitespace-nowrap`}>
                                {activity.status}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
}