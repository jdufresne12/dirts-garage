'use client';
import React, { useState, useEffect } from 'react';

interface ActiveJob {
    id: string;
    title: string;
    customer: string;
    vehicle: string;
    status: string;
    startedDate: string;
    estimatedCompletion: string;
}

export default function ActiveJobsTable() {
    const [jobs, setJobs] = useState<ActiveJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    const fetchActiveJobs = async () => {
        try {
            const response = await fetch('/api/dashboard/active-jobs');
            if (!response.ok) throw new Error('Failed to fetch active jobs');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching active jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Jobs being worked on</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Loading jobs...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Jobs being worked on</h3>

            {jobs.length > 0 ? (
                <div className="overflow-hidden">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => window.location.href = `/jobs/${job.id}`}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{job.customer}</h4>
                                        <p className="text-sm text-gray-600">{job.vehicle}</p>
                                        <p className="text-sm text-gray-600">{job.title}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    {job.startedDate &&
                                        <p>Started: {new Date(job.startedDate).toLocaleDateString()}</p>
                                    }
                                    {job.estimatedCompletion &&
                                        <p>Due: {new Date(job.estimatedCompletion).toLocaleDateString()}</p>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex h-40 items-center justify-center">
                    <div className="text-center text-gray-500 -mt-5">
                        <div className="text-4xl mb-2">🔧</div>
                        <p className="text-sm italic">No jobs currently being worked on</p>
                    </div>
                </div>
            )}
        </div>
    );
}