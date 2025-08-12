'use client';
import React, { useState, useEffect } from 'react';

interface WaitingJob {
    id: string;
    title: string;
    customer: string;
    vehicle: string;
    status: string;
    createdDate: string;
    priority: 'high' | 'medium' | 'low';
    waitingReason: string;
}

export default function WaitingJobsTable() {
    const [jobs, setJobs] = useState<WaitingJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWaitingJobs();
    }, []);

    const fetchWaitingJobs = async () => {
        try {
            const response = await fetch('/api/dashboard/waiting-jobs');
            if (!response.ok) throw new Error('Failed to fetch waiting jobs');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching waiting jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Jobs waiting to be worked on</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Loading jobs...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Jobs waiting to be worked on</h3>

            {jobs.length > 0 ? (
                <div className="overflow-hidden">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {jobs.map((job) => (
                            <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{job.customer}</h4>
                                        <p className="text-sm text-gray-600">{job.vehicle}</p>
                                        <p className="text-sm text-gray-600">{job.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{job.waitingReason}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                        {job.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <p>Created: {new Date(job.createdDate).toLocaleDateString()}</p>
                                    <button className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 text-xs">
                                        Start Job
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">⏳</div>
                        <p className="text-sm italic">No jobs waiting to be worked on</p>
                    </div>
                </div>
            )}
        </div>
    );
}