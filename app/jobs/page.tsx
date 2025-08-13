'use client';
import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import JobsTable from '../components/jobs/JobsTable';

const JobsPage = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <div className="w-full mx-auto p-4 sm:p-6">
                <div className='flex w-full p-2 mt-2 justify-center bg-white shadow-md rounded-lg sm:mt-0'>
                    <h1 className="text-xl font-bold">Jobs</h1>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-row w-full items-center mt-8 mb-5 gap-5 ">
                    <div className="flex w-full items-center relative border border-gray-300 rounded-lg sm:w-7/12 hover:border-orange-400 focus-within:border-orange-400">
                        <div>
                            <Search className="size-4 mx-2 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="w-full py-1.5 focus:ring-0 focus:outline-none"
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

                {/* Jobs Table */}
                <JobsTable
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
