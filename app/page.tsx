'use client';
import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  FileText,
  CheckCircle,
  DollarSign
} from 'lucide-react';

import AnalyticsCard from './components/AnalyticsCard';
import RevenueTrendGraph from './components/RevenueTrendGraph';
import RecentActivity from './components/RecentActivity';
import JobsRequiringAttention from './components/JobsRequiringAttention';

export default function Home() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex space-x-3">
            <Link
              href={"/customers/new-customer"}
              className="w-fit px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              + New Customer
            </Link>
            <Link
              href={"/jobs/new-job"}
              className="w-fit px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              + Start Job
            </Link>
            <Link
              href={"/invoice"}
              className="w-fit px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueTrendGraph />
          <RecentActivity />
        </div>

        {/* Jobs Requiring Attention */}
        <JobsRequiringAttention />
      </div>
    </div>
  );
}