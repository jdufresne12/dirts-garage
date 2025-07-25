'use client';
import React, { useEffect, useState } from 'react';
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
      <div className="w-full mx-auto p-6 lg:p-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 w-full gap-4 mb-6 sm:gap-6 sm:mb-10 ">
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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <div className="w-full min-w-0">
            <RecentActivity />
          </div>
          <div className="w-full min-w-0">
            <JobsRequiringAttention />
          </div>
        </div>

        {/* <div className="w-full min-w-0">
          <RevenueTrendGraph />
        </div> */}
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