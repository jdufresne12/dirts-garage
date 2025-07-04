'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  FileText,
  CheckCircle,
  DollarSign,
  Plus
} from 'lucide-react';
import mockData from './data/mock-data';

import AnalyticsCard from './components/dashboard/AnalyticsCard';
import RevenueTrendGraph from './components/dashboard/RevenueTrendGraph';
import RecentActivity from './components/dashboard/RecentActivity';
import JobsRequiringAttention from './components/dashboard/JobsRequiringAttention';
import StartJobModal from './components/jobs/StartJobModal';

export default function Home() {
  const [startJobModalOpen, setStartJobModalOpen] = useState(false);

  const handleStartJob = (data: any) => {
    console.log('New customer data:', data);
    // Here you would typically save to your database or state management
    // For now, we'll just log it
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 p-4 rounded-lg lg:flex-row lg:items-center lg:justify-between lg:mb-8 lg:bg-white lg:p-6 lg:shadow-lg">
          <h1 className="text-2xl p-4 min-w-0 text-center font-bold bg-white rounded-lg shadow-md text-gray-900 lg:p-0 lg:bg-none lg:rounded-none lg:shadow-none lg:text-3xl">Dashboard Overview</h1>
          {/* Action Container */}
          <div className="flex flex-row justify-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href={"/jobs/new-job"}
              className="flex justify-center items-center p-2 text-sm font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-center whitespace-nowrap lg:shadow-none"
            >
              <Plus className="size-3 mr-1 text-white md:size-4" /> Job
            </Link>
            <button
              onClick={() => setStartJobModalOpen(true)}
              className="flex justify-center items-center px-3 py-2 text-sm font-medium shadow-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors text-center whitespace-nowrap lg:shadow-none"
            >
              Start Job
            </button>
            <Link
              href={"/invoice"}
              className="flex justify-center items-center px-3 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-center whitespace-nowrap lg:shadow-none"
            >
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <AnalyticsCard
            title="Active Jobs"
            value="12"
            change="+2 from last week"
            changeType="positive"
            icon={Wrench}
          />
          <AnalyticsCard
            title="Revenue This Month"
            value="$18,540"
            change="+15% from last month"
            changeType="positive"
            icon={DollarSign}
          />
          <AnalyticsCard
            title="Pending Invoices"
            value="$4,220"
            change="3 overdue"
            changeType="negative"
            icon={FileText}
          />
          <AnalyticsCard
            title="Completed This Week"
            value="8"
            change="On schedule"
            changeType="positive"
            icon={CheckCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <div className="w-full min-w-0">
            <RevenueTrendGraph />
          </div>
          <div className="w-full min-w-0">
            <RecentActivity />
          </div>
        </div>

        {/* Jobs Requiring Attention */}
        <div className="w-full min-w-0">
          <JobsRequiringAttention />
        </div>
      </div>

      {/* Add Customer Modal */}
      <StartJobModal
        isOpen={startJobModalOpen}
        onClose={() => setStartJobModalOpen(false)}
        onSubmit={handleStartJob}
      />
    </div>
  );
}