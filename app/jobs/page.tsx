'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import mockData from '../data/mock-data';
import JobsTable from '../components/jobs/JobsTable';
import Link from 'next/link';

const JobsPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const fetchJobs = () => {
            const jobs: Job[] = mockData.jobs;
            const customers: Customer[] = mockData.customers;
            const vehicles: Vehicle[] = mockData.vehicles;

            setJobs(jobs);
            setCustomers(customers);
            setVehicles(vehicles);
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="pb-4 text-2xl font-bold text-gray-900 lg:text-3xl">Jobs</h1>

                {/* Action Buttons */}
                <div className="flex flex-row w-full items-center my-4 gap-5">
                    <div className="flex items-center relative border border-gray-300 rounded-lg hover:border-orange-400 focus-within:border-orange-400">
                        <Search className="size-4 mx-2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="w-50 py-1.5 md:w-75 focus:ring-0 focus:outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        href="/jobs/new-job"
                        className="flex p-2 text-sm text-center font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors border border-orange-400 whitespace-nowrap lg:shadow-none"
                    >
                        <Plus className="size-5 text-white md:mr-1" />
                        <span className="hidden md:inline">Add Job</span>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'In Progress', value: 'In Progress' },
                            { label: 'Waiting', value: 'Waiting' },
                            { label: 'Completed', value: 'Completed' },
                            { label: 'On Hold', value: 'On Hold' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === tab.value
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label} ({
                                    tab.value === 'all'
                                        ? jobs.length
                                        : jobs.filter((j) => j.status.toLowerCase() === tab.value.toLowerCase()).length
                                })
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Jobs Table */}
                <JobsTable
                    jobs={jobs}
                    customers={customers}
                    vehicles={vehicles}
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default JobsPage;
