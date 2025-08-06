'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface JobAttention {
    id: string;
    title: string;
    status: string;
    customer: string;
    vehicle: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCompletion?: string;
}

export default function JobsRequiringAttention() {
    const [jobs, setJobs] = useState<JobAttention[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchJobsRequiringAttention();
    }, []);

    const fetchJobsRequiringAttention = async () => {
        try {
            const response = await fetch('/api/dashboard/jobs-attention');
            if (!response.ok) {
                throw new Error('Failed to fetch jobs requiring attention');
            }
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs requiring attention:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getJobIcon = (reason: string, priority: string) => {
        if (reason.toLowerCase().includes('invoice') || reason.toLowerCase().includes('invoicing')) {
            return { icon: DollarSign, color: 'text-green-500' };
        }
        if (reason.toLowerCase().includes('waiting') || reason.toLowerCase().includes('parts')) {
            return { icon: AlertTriangle, color: 'text-yellow-500' };
        }
        if (reason.toLowerCase().includes('approval') || reason.toLowerCase().includes('estimate')) {
            return { icon: Search, color: 'text-blue-500' };
        }
        if (reason.toLowerCase().includes('complete') || reason.toLowerCase().includes('pickup')) {
            return { icon: CheckCircle, color: 'text-green-500' };
        }
        if (reason.toLowerCase().includes('overdue') || reason.toLowerCase().includes('past due')) {
            return { icon: Clock, color: 'text-red-500' };
        }

        // Default based on priority
        switch (priority) {
            case 'high':
                return { icon: AlertTriangle, color: 'text-red-500' };
            case 'medium':
                return { icon: AlertTriangle, color: 'text-yellow-500' };
            default:
                return { icon: Search, color: 'text-blue-500' };
        }
    };

    const getActionButton = (reason: string, jobId: string) => {
        if (reason.toLowerCase().includes('invoice') || reason.toLowerCase().includes('invoicing')) {
            return { text: 'Generate Invoice', color: 'bg-green-500 hover:bg-green-600' };
        }
        if (reason.toLowerCase().includes('waiting') || reason.toLowerCase().includes('parts')) {
            return { text: 'Contact Customer', color: 'bg-orange-500 hover:bg-orange-600' };
        }
        if (reason.toLowerCase().includes('approval') || reason.toLowerCase().includes('estimate')) {
            return { text: 'Send Estimate', color: 'bg-blue-500 hover:bg-blue-600' };
        }
        if (reason.toLowerCase().includes('complete') || reason.toLowerCase().includes('pickup')) {
            return { text: 'Contact Customer', color: 'bg-green-500 hover:bg-green-600' };
        }

        return { text: 'View Job', color: 'bg-orange-500 hover:bg-orange-600' };
    };

    const handleActionClick = (jobId: string, reason: string) => {
        // Here you can implement navigation to job details or trigger specific actions
        console.log(`Action clicked for job ${jobId}: ${reason}`);
        // Example: router.push(`/jobs/${jobId}`);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Jobs Requiring Attention</h3>
                    <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors self-start sm:self-auto">
                        Manage All
                    </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg animate-pulse">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                            <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg h-full p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Jobs Requiring Attention</h3>
                {/* <button className="px-3 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors self-start sm:self-auto">
                    Manage All
                </button> */}
            </div>

            <div className="space-y-3 sm:space-y-4">
                {jobs.length > 0 ? (
                    jobs.map(job => {
                        const { icon: IconComponent, color } = getJobIcon(job.reason, job.priority);
                        const { text: actionText, color: actionColor } = getActionButton(job.reason, job.id);

                        return (
                            <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 sm:mt-1 flex-shrink-0 ${color}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                            <span className="sm:hidden">{job.customer}</span>
                                            <span className="hidden sm:inline">{job.customer} - {job.vehicle}</span>
                                        </div>
                                        <div className="text-xs sm:hidden text-gray-600 mt-0.5 truncate">
                                            {job.vehicle}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 sm:line-clamp-1">
                                            {job.reason}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleActionClick(job.id, job.reason)}
                                    className={`px-3 py-2 text-xs sm:text-sm text-white rounded-lg ${actionColor} transition-colors whitespace-nowrap self-start sm:self-auto`}
                                >
                                    {actionText}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="text-sm">No jobs require immediate attention</p>
                        <p className="text-xs text-gray-400 mt-1">Great work keeping up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}