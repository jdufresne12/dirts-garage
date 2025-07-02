'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Calendar,
    Clock,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Wrench,
    Users,
    Plus
} from 'lucide-react';
import { mockJobs } from '@/app/data/jobs';

const JobsPage = () => {
    const [activeTab, setActiveTab] = useState('inProgress');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('startDate');
    const [filterPriority, setFilterPriority] = useState('all');

    const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
        const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return `px-2 py-1 rounded text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`;
    };

    const getProgressBar = (progress: any) => (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );

    const formatCurrency = (amount: any) => `$${amount.toLocaleString()}`;
    const formatDate = (date: any) => date ? new Date(date).toLocaleDateString() : 'TBD';

    // Job Analytics
    const analytics = {
        totalActive: mockJobs.inProgress.length,
        totalWaiting: mockJobs.waiting.length,
        totalCompleted: mockJobs.completed.length,
        avgCompletionTime: 8, // days
        totalRevenue: mockJobs.completed.reduce((sum, job) => sum + (job.invoiceAmount || 0), 0),
        pendingRevenue: mockJobs.inProgress.reduce((sum, job) => sum + job.estimatedCost, 0)
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 p-4 rounded-lg lg:flex-row lg:items-center lg:justify-between lg:mb-8 lg:bg-white lg:p-6 lg:shadow-lg">
                    <h1 className="text-2xl p-4 min-w-0 text-center font-bold bg-white rounded-lg shadow-md text-gray-900 lg:p-0 lg:bg-none lg:rounded-none lg:shadow-none lg:text-3xl">Customers</h1>
                    <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button>
                            <Search className="size-5 text-gray-500 hover:scale-125" />
                        </button>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="w-50 p-1.5 mr-5 border-1 border-gray-300 rounded-lg md:w-75 hover:border-orange-400"
                            />
                        </div>
                        <Link
                            href={"/jobs/new-job"}
                            className="flex justify-center items-center p-2 text-sm font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-center whitespace-nowrap lg:shadow-none"
                        >
                            <Plus className="size-3 mr-1 text-white md:size-4" /> Job
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.totalActive}</p>
                                </div>
                                <Wrench className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Waiting</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.totalWaiting}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.totalCompleted}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-green-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Revenue (Month)</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.pendingRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                <button
                                    onClick={() => setActiveTab('inProgress')}
                                    className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'inProgress'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    In Progress ({mockJobs.inProgress.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('waiting')}
                                    className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'waiting'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Waiting ({mockJobs.waiting.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'completed'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Completed ({mockJobs.completed.length})
                                </button>
                            </nav>
                        </div>

                        {/* Table Content */}
                        <div className="overflow-x-auto">
                            {activeTab === 'inProgress' && (
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Completion</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockJobs.inProgress.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{job.customer}</div>
                                                        <div className="text-sm text-gray-500">{job.vehicle}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{job.workOrder}</div>
                                                    {job.notes && <div className="text-xs text-gray-500 mt-1">{job.notes}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1">
                                                            {getProgressBar(job.progress)}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{job.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.technician}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(job.estimatedCompletion)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{formatCurrency(job.actualCost)} / {formatCurrency(job.estimatedCost)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getPriorityBadge(job.priority)}>{job.priority}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                                                        <button className="text-orange-600 hover:text-orange-900"><Edit className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'waiting' && (
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waiting For</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockJobs.waiting.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{job.customer}</div>
                                                        <div className="text-sm text-gray-500">{job.vehicle}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{job.workOrder}</div>
                                                    {job.notes && <div className="text-xs text-gray-500 mt-1">{job.notes}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                                        {job.waitingReason}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(job.estimatedCost)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getPriorityBadge(job.priority)}>{job.priority}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                                                        <button className="text-green-600 hover:text-green-900">Start</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'completed' && (
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockJobs.completed.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{job.customer}</div>
                                                        <div className="text-sm text-gray-500">{job.vehicle}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{job.workOrder}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(job.completedDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.technician}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(job.actualCost)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${job.invoiced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {job.invoiced ? 'Invoiced' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                                                        {!job.invoiced && (
                                                            <button className="text-green-600 hover:text-green-900">Invoice</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsPage;