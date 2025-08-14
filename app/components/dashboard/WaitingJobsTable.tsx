'use client';
import React, { useState, useEffect } from 'react';

interface WaitingJob {
    id: string;
    title: string;
    customer: string;
    vehicle: string;
    status: string;
    createdDate: string;
    priority: 'High' | 'Medium' | 'Low';
    waitingReason: string;
}

interface WaitingJobsTableProps {
    onJobStarted?: () => void; // Optional callback to refresh dashboard
}

export default function WaitingJobsTable({ onJobStarted }: WaitingJobsTableProps) {
    const [jobs, setJobs] = useState<WaitingJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startingJobId, setStartingJobId] = useState<string | null>(null);

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
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStartJob = async (job: WaitingJob) => {
        setStartingJobId(job.id);

        try {
            // Get current date in yyyy-mm-dd format
            const currentDate = new Date().toISOString().split('T')[0];

            const response = await fetch(`/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'In Progress',
                    start_date: currentDate,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start job');
            }

            // Remove the job from the waiting list since it's now in progress
            setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));

            // Call the callback to refresh the entire dashboard
            if (onJobStarted) {
                onJobStarted();
            }

        } catch (error) {
            console.error('Error starting job:', error);
            alert('Failed to start job. Please try again.');
        } finally {
            setStartingJobId(null);
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
                                <div
                                    onClick={() => window.location.href = `/jobs/${job.id}`}
                                    className="flex justify-between items-start mb-2 cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{job.customer}</h4>
                                        <p className="text-sm text-gray-600">{job.vehicle}</p>
                                        <p className="text-sm text-gray-600">{job.title}</p>
                                        <p className="text-xs text-gray-500 mt-2">{job.waitingReason}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                        {job.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <p>Created: {new Date(job.createdDate).toLocaleDateString()}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartJob(job);
                                        }}
                                        disabled={startingJobId === job.id}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${startingJobId === job.id
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                    >
                                        {startingJobId === job.id ? 'Starting...' : 'Start Job'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex h-40 items-center justify-center">
                    <div className="text-center text-gray-500 -mt-5">
                        <div className="text-4xl mb-2">⏳</div>
                        <p className="text-sm italic">No jobs waiting to be worked on</p>
                    </div>
                </div>
            )}
        </div>
    );
}